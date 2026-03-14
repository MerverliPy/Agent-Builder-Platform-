"""Main Agent class - the brain of the framework."""
import ollama
import uuid
import json
import re
from typing import Optional, AsyncIterator
from .message import Message, Role, ToolCall, ToolResult
from .tool_registry import ToolRegistry


class Agent:
    """
    The main agent that orchestrates conversations with the LLM
    and executes tools.
    """
    
    def __init__(
        self,
        model: str = "qwen2.5-coder:14b",
        system_prompt: Optional[str] = None,
        tool_registry: Optional[ToolRegistry] = None,
        max_iterations: int = 10,
        ollama_host: Optional[str] = None,
    ):
        self.model = model
        self.system_prompt = system_prompt or self._default_system_prompt()
        self.tool_registry = tool_registry or ToolRegistry()
        self.max_iterations = max_iterations
        self.messages: list[Message] = []
        self.client = ollama.Client(host=ollama_host) if ollama_host else ollama.Client()
        
        # Initialize with system message
        self.messages.append(Message(role=Role.SYSTEM, content=self.system_prompt))
    
    def _default_system_prompt(self) -> str:
        return """You are a powerful AI coding assistant with access to tools.

IMPORTANT: When you need to use a tool, you MUST respond with ONLY a valid JSON object in this exact format:
{"name": "tool_name", "arguments": {"arg1": "value1", "arg2": "value2"}}

Do NOT include any other text, explanation, or markdown formatting when calling a tool.
Only output plain JSON for tool calls.

After receiving tool results, analyze them and either:
1. Call another tool if needed (output ONLY JSON)
2. Provide a helpful response to the user (normal text)

Available tools will be provided. Use them to accomplish tasks efficiently.
Be concise and helpful."""

    def _build_messages_for_api(self) -> list[dict]:
        """Convert messages to Ollama API format."""
        return [msg.to_ollama_format() for msg in self.messages]
    
    def _parse_tool_call_from_content(self, content: str) -> Optional[ToolCall]:
        """
        Parse a tool call from content if the model outputs JSON instead of
        using proper tool_calls format.
        """
        if not content:
            return None
        
        content = content.strip()
        
        # Try to extract JSON from the content
        # Handle cases where JSON might be wrapped in markdown code blocks
        json_match = re.search(r'```(?:json)?\s*(\{.*?\})\s*```', content, re.DOTALL)
        if json_match:
            content = json_match.group(1)
        
        # Try to parse as JSON
        try:
            # Check if it looks like a tool call
            if content.startswith('{') and 'name' in content:
                data = json.loads(content)
                
                # Check if it has the expected structure
                if 'name' in data and isinstance(data.get('name'), str):
                    # Verify this is a valid tool name
                    tool_name = data['name']
                    if self.tool_registry.get(tool_name):
                        return ToolCall(
                            id=str(uuid.uuid4()),
                            name=tool_name,
                            arguments=data.get('arguments', {})
                        )
        except json.JSONDecodeError:
            pass
        
        return None
    
    async def run(self, user_input: str) -> AsyncIterator[str]:
        """
        Run the agent with user input.
        Yields assistant responses and tool outputs as they happen.
        """
        # Add user message
        self.messages.append(Message(role=Role.USER, content=user_input))
        
        iteration = 0
        while iteration < self.max_iterations:
            iteration += 1
            
            # Call the LLM
            tools = self.tool_registry.to_ollama_format() if self.tool_registry.list_tools() else None
            
            response = self.client.chat(
                model=self.model,
                messages=self._build_messages_for_api(),
                tools=tools,
                stream=False
            )
            
            # Handle both dict-style and object-style response
            if hasattr(response, 'message'):
                assistant_message = response.message
                content = assistant_message.content or ''
                tool_calls_raw = assistant_message.tool_calls or []
            else:
                assistant_message = response.get('message', {})
                content = assistant_message.get('content', '')
                tool_calls_raw = assistant_message.get('tool_calls', [])
            
            # Parse tool calls from proper format
            tool_calls = []
            if tool_calls_raw:
                for tc in tool_calls_raw:
                    if hasattr(tc, 'function'):
                        func = tc.function
                        tool_calls.append(ToolCall(
                            id=str(uuid.uuid4()),
                            name=func.name if hasattr(func, 'name') else func.get('name', ''),
                            arguments=func.arguments if hasattr(func, 'arguments') else func.get('arguments', {})
                        ))
                    else:
                        func = tc.get('function', {})
                        tool_calls.append(ToolCall(
                            id=str(uuid.uuid4()),
                            name=func.get('name', ''),
                            arguments=func.get('arguments', {})
                        ))
            
            # FALLBACK: Try to parse tool call from content if no proper tool_calls
            if not tool_calls and content:
                parsed_call = self._parse_tool_call_from_content(content)
                if parsed_call:
                    tool_calls = [parsed_call]
                    # Don't yield the raw JSON to the user
                    content = ""
            
            # Store assistant message
            self.messages.append(Message(
                role=Role.ASSISTANT,
                content=content,
                tool_calls=tool_calls if tool_calls else None
            ))
            
            # Yield content if any (and not a tool call)
            if content and not tool_calls:
                yield content
            
            # If no tool calls, we're done
            if not tool_calls:
                break
            
            # Execute tools
            for tool_call in tool_calls:
                tool = self.tool_registry.get(tool_call.name)
                if tool:
                    yield f"\n[Executing: {tool_call.name}]\n"
                    result = await tool.execute(**tool_call.arguments)
                    result_preview = result[:500] + ('...' if len(result) > 500 else '')
                    yield f"[Result: {result_preview}]\n"
                    
                    # Add tool result to messages
                    self.messages.append(Message(
                        role=Role.TOOL,
                        content=result,
                        tool_result=ToolResult(
                            tool_call_id=tool_call.id,
                            name=tool_call.name,
                            content=result
                        )
                    ))
                else:
                    error_msg = f"Tool '{tool_call.name}' not found"
                    yield f"\n[Error: {error_msg}]\n"
                    self.messages.append(Message(
                        role=Role.TOOL,
                        content=error_msg,
                        tool_result=ToolResult(
                            tool_call_id=tool_call.id,
                            name=tool_call.name,
                            content=error_msg,
                            success=False,
                            error=error_msg
                        )
                    ))
    
    def run_sync(self, user_input: str) -> str:
        """Synchronous version of run - returns full response."""
        import asyncio
        
        async def collect():
            chunks = []
            async for chunk in self.run(user_input):
                chunks.append(chunk)
            return ''.join(chunks)
        
        return asyncio.run(collect())
    
    def clear_history(self) -> None:
        """Clear conversation history, keeping only system prompt."""
        self.messages = [Message(role=Role.SYSTEM, content=self.system_prompt)]
    
    def get_history(self) -> list[Message]:
        """Get conversation history."""
        return self.messages.copy()

"""
OpenAI-compatible API server that wraps the Qwen agent.

This allows OpenCode to use our Qwen agent as a custom provider.
The server translates between OpenAI API format and our agent's internal format,
handling the JSON-parsing fallback for tool calls that Qwen outputs.
"""
import json
import uuid
import time
import asyncio
import re
from typing import Optional, AsyncIterator
from dataclasses import dataclass, asdict
from http.server import HTTPServer, BaseHTTPRequestHandler
from functools import partial
import threading

# FastAPI/uvicorn for async support
try:
    from fastapi import FastAPI, HTTPException, Request
    from fastapi.responses import StreamingResponse, JSONResponse
    from pydantic import BaseModel
    import uvicorn
    HAS_FASTAPI = True
except ImportError:
    HAS_FASTAPI = False

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import ollama


# ============================================================================
# Data Models (OpenAI API compatible)
# ============================================================================

@dataclass
class ChatMessage:
    role: str
    content: str
    tool_calls: Optional[list] = None
    tool_call_id: Optional[str] = None


@dataclass  
class ToolFunction:
    name: str
    arguments: str  # JSON string


@dataclass
class ToolCall:
    id: str
    type: str
    function: ToolFunction


@dataclass
class Choice:
    index: int
    message: dict
    finish_reason: str


@dataclass
class Usage:
    prompt_tokens: int
    completion_tokens: int
    total_tokens: int


@dataclass
class ChatCompletionResponse:
    id: str
    object: str
    created: int
    model: str
    choices: list
    usage: Usage


# ============================================================================
# Core Agent Logic with Tool Call Parsing
# ============================================================================

class QwenOpenAIBridge:
    """
    Bridges Qwen/Ollama to OpenAI API format.
    Handles the JSON-parsing fallback for tool calls.
    """
    
    def __init__(self, model: str = "qwen2.5-coder:14b", ollama_host: str = None):
        self.model = model
        self.client = ollama.Client(host=ollama_host) if ollama_host else ollama.Client()
    
    def _parse_tool_calls_from_content(self, content: str, tools: list) -> tuple[str, list]:
        """
        Parse tool calls from content if Qwen outputs JSON instead of proper tool_calls.
        Returns (cleaned_content, tool_calls_list).
        """
        if not content:
            return content, []
        
        content = content.strip()
        tool_names = {t['function']['name'] for t in tools} if tools else set()
        
        # Try to extract JSON from content
        # Handle markdown code blocks
        json_match = re.search(r'```(?:json)?\s*(\{.*?\})\s*```', content, re.DOTALL)
        if json_match:
            json_str = json_match.group(1)
        elif content.startswith('{') and content.endswith('}'):
            json_str = content
        else:
            return content, []
        
        try:
            data = json.loads(json_str)
            
            # Check if it looks like a tool call
            if isinstance(data, dict) and 'name' in data:
                tool_name = data['name']
                if tool_name in tool_names:
                    tool_call = {
                        'id': f'call_{uuid.uuid4().hex[:8]}',
                        'type': 'function',
                        'function': {
                            'name': tool_name,
                            'arguments': json.dumps(data.get('arguments', {}))
                        }
                    }
                    # Return empty content when it's a tool call
                    return "", [tool_call]
        except json.JSONDecodeError:
            pass
        
        return content, []
    
    def chat_completion(
        self,
        messages: list[dict],
        tools: Optional[list] = None,
        stream: bool = False,
        **kwargs
    ) -> dict:
        """
        Process a chat completion request in OpenAI format.
        """
        # Convert messages to Ollama format
        ollama_messages = []
        for msg in messages:
            ollama_msg = {
                'role': msg['role'],
                'content': msg.get('content', '')
            }
            # Handle tool results
            if msg['role'] == 'tool':
                ollama_msg['role'] = 'user'  # Ollama doesn't have 'tool' role
                ollama_msg['content'] = f"Tool result for {msg.get('tool_call_id', 'unknown')}:\n{msg.get('content', '')}"
            ollama_messages.append(ollama_msg)
        
        # Convert tools to Ollama format
        ollama_tools = None
        if tools:
            ollama_tools = tools  # OpenAI format is close to Ollama format
        
        # Call Ollama
        response = self.client.chat(
            model=self.model,
            messages=ollama_messages,
            tools=ollama_tools,
            stream=False
        )
        
        # Extract response
        if hasattr(response, 'message'):
            assistant_msg = response.message
            content = assistant_msg.content or ''
            raw_tool_calls = assistant_msg.tool_calls or []
        else:
            assistant_msg = response.get('message', {})
            content = assistant_msg.get('content', '')
            raw_tool_calls = assistant_msg.get('tool_calls', [])
        
        # Convert Ollama tool calls to OpenAI format
        tool_calls = []
        if raw_tool_calls:
            for tc in raw_tool_calls:
                if hasattr(tc, 'function'):
                    func = tc.function
                    tool_calls.append({
                        'id': f'call_{uuid.uuid4().hex[:8]}',
                        'type': 'function',
                        'function': {
                            'name': func.name if hasattr(func, 'name') else func.get('name', ''),
                            'arguments': json.dumps(func.arguments if hasattr(func, 'arguments') else func.get('arguments', {}))
                        }
                    })
                else:
                    func = tc.get('function', {})
                    tool_calls.append({
                        'id': f'call_{uuid.uuid4().hex[:8]}',
                        'type': 'function',
                        'function': {
                            'name': func.get('name', ''),
                            'arguments': json.dumps(func.get('arguments', {}))
                        }
                    })
        
        # FALLBACK: Parse tool calls from content if none found
        if not tool_calls and content and tools:
            content, parsed_calls = self._parse_tool_calls_from_content(content, tools)
            tool_calls = parsed_calls
        
        # Build response message
        response_message = {'role': 'assistant', 'content': content}
        if tool_calls:
            response_message['tool_calls'] = tool_calls
            response_message['content'] = None  # OpenAI convention
        
        # Determine finish reason
        finish_reason = 'tool_calls' if tool_calls else 'stop'
        
        # Build OpenAI-compatible response
        return {
            'id': f'chatcmpl-{uuid.uuid4().hex[:8]}',
            'object': 'chat.completion',
            'created': int(time.time()),
            'model': self.model,
            'choices': [{
                'index': 0,
                'message': response_message,
                'finish_reason': finish_reason
            }],
            'usage': {
                'prompt_tokens': response.prompt_eval_count if hasattr(response, 'prompt_eval_count') else 0,
                'completion_tokens': response.eval_count if hasattr(response, 'eval_count') else 0,
                'total_tokens': (response.prompt_eval_count or 0) + (response.eval_count or 0) if hasattr(response, 'prompt_eval_count') else 0
            }
        }


# ============================================================================
# FastAPI Server
# ============================================================================

if HAS_FASTAPI:
    app = FastAPI(title="Qwen Agent OpenAI Bridge", version="1.0.0")
    bridge = None  # Initialized on startup
    
    class ChatCompletionRequest(BaseModel):
        model: str = "qwen2.5-coder:14b"
        messages: list
        tools: Optional[list] = None
        tool_choice: Optional[str] = None
        stream: bool = False
        temperature: Optional[float] = None
        max_tokens: Optional[int] = None
    
    class ModelInfo(BaseModel):
        id: str
        object: str = "model"
        created: int = 0
        owned_by: str = "local"
    
    class ModelListResponse(BaseModel):
        object: str = "list"
        data: list[ModelInfo]
    
    @app.on_event("startup")
    async def startup():
        global bridge
        model = os.environ.get("QWEN_MODEL", "qwen2.5-coder:14b")
        host = os.environ.get("OLLAMA_HOST")
        bridge = QwenOpenAIBridge(model=model, ollama_host=host)
        print(f"Qwen Agent Bridge started with model: {model}")
    
    @app.get("/v1/models")
    async def list_models():
        """List available models."""
        model = os.environ.get("QWEN_MODEL", "qwen2.5-coder:14b")
        return {
            "object": "list",
            "data": [
                {
                    "id": model,
                    "object": "model",
                    "created": int(time.time()),
                    "owned_by": "local-qwen"
                }
            ]
        }
    
    @app.post("/v1/chat/completions")
    async def chat_completions(request: ChatCompletionRequest):
        """
        OpenAI-compatible chat completions endpoint.
        This is what OpenCode calls.
        """
        try:
            response = bridge.chat_completion(
                messages=request.messages,
                tools=request.tools,
                stream=request.stream
            )
            return JSONResponse(content=response)
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
    
    @app.get("/health")
    async def health():
        return {"status": "ok", "model": os.environ.get("QWEN_MODEL", "qwen2.5-coder:14b")}

else:
    app = None


# ============================================================================
# Server Runner
# ============================================================================

def run_server(host: str = "127.0.0.1", port: int = 8787, model: str = None):
    """Run the OpenAI-compatible API server."""
    if not HAS_FASTAPI:
        print("Error: FastAPI and uvicorn are required.")
        print("Install with: pip install fastapi uvicorn")
        return
    
    if model:
        os.environ["QWEN_MODEL"] = model
    
    print(f"""
╔══════════════════════════════════════════════════════════════╗
║           Qwen Agent - OpenAI Compatible Bridge              ║
╠══════════════════════════════════════════════════════════════╣
║  Server: http://{host}:{port}                               
║  Model:  {os.environ.get('QWEN_MODEL', 'qwen2.5-coder:14b')}
║                                                              
║  Endpoints:                                                  
║    POST /v1/chat/completions  - Chat API                    
║    GET  /v1/models            - List models                 
║    GET  /health               - Health check                
╚══════════════════════════════════════════════════════════════╝
""")
    
    uvicorn.run(app, host=host, port=port, log_level="info")


if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="Qwen Agent OpenAI Bridge")
    parser.add_argument("--host", default="127.0.0.1", help="Host to bind to")
    parser.add_argument("--port", type=int, default=8787, help="Port to listen on")
    parser.add_argument("--model", default="qwen2.5-coder:14b", help="Ollama model to use")
    args = parser.parse_args()
    
    run_server(host=args.host, port=args.port, model=args.model)

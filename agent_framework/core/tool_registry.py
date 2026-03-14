"""Tool registry and base tool definitions."""
from typing import Any, Callable, Optional
from pydantic import BaseModel
import inspect
import json


class ToolParameter(BaseModel):
    """A parameter for a tool."""
    name: str
    type: str
    description: str
    required: bool = True
    enum: Optional[list[str]] = None
    default: Optional[Any] = None


class Tool(BaseModel):
    """A tool that can be called by the agent."""
    name: str
    description: str
    parameters: list[ToolParameter]
    handler: Optional[Callable] = None
    
    class Config:
        arbitrary_types_allowed = True
    
    def to_ollama_format(self) -> dict:
        """Convert to Ollama tools API format."""
        properties = {}
        required = []
        
        for param in self.parameters:
            prop = {"type": param.type, "description": param.description}
            if param.enum:
                prop["enum"] = param.enum
            properties[param.name] = prop
            if param.required:
                required.append(param.name)
        
        return {
            "type": "function",
            "function": {
                "name": self.name,
                "description": self.description,
                "parameters": {
                    "type": "object",
                    "properties": properties,
                    "required": required
                }
            }
        }
    
    async def execute(self, **kwargs) -> str:
        """Execute the tool with given arguments."""
        if self.handler is None:
            return json.dumps({"error": f"No handler for tool {self.name}"})
        
        try:
            if inspect.iscoroutinefunction(self.handler):
                result = await self.handler(**kwargs)
            else:
                result = self.handler(**kwargs)
            
            if isinstance(result, str):
                return result
            return json.dumps(result, indent=2)
        except Exception as e:
            return json.dumps({"error": str(e)})


class ToolRegistry:
    """Registry of available tools."""
    
    def __init__(self):
        self._tools: dict[str, Tool] = {}
    
    def register(self, tool: Tool) -> None:
        """Register a tool."""
        self._tools[tool.name] = tool
    
    def unregister(self, name: str) -> None:
        """Unregister a tool."""
        self._tools.pop(name, None)
    
    def get(self, name: str) -> Optional[Tool]:
        """Get a tool by name."""
        return self._tools.get(name)
    
    def list_tools(self) -> list[Tool]:
        """List all registered tools."""
        return list(self._tools.values())
    
    def to_ollama_format(self) -> list[dict]:
        """Convert all tools to Ollama format."""
        return [tool.to_ollama_format() for tool in self._tools.values()]
    
    def tool(self, name: str, description: str, parameters: list[ToolParameter] = None):
        """Decorator to register a function as a tool."""
        def decorator(func: Callable):
            tool = Tool(
                name=name,
                description=description,
                parameters=parameters or [],
                handler=func
            )
            self.register(tool)
            return func
        return decorator

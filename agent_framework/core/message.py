"""Message types for agent conversations."""
from enum import Enum
from typing import Any, Optional
from pydantic import BaseModel
from datetime import datetime


class Role(str, Enum):
    SYSTEM = "system"
    USER = "user"
    ASSISTANT = "assistant"
    TOOL = "tool"


class ToolCall(BaseModel):
    """Represents a tool call made by the assistant."""
    id: str
    name: str
    arguments: dict[str, Any]


class ToolResult(BaseModel):
    """Result from a tool execution."""
    tool_call_id: str
    name: str
    content: str
    success: bool = True
    error: Optional[str] = None


class Message(BaseModel):
    """A message in the conversation."""
    role: Role
    content: str
    tool_calls: Optional[list[ToolCall]] = None
    tool_result: Optional[ToolResult] = None
    timestamp: datetime = None
    
    def __init__(self, **data):
        if 'timestamp' not in data or data['timestamp'] is None:
            data['timestamp'] = datetime.now()
        super().__init__(**data)
    
    def to_ollama_format(self) -> dict:
        """Convert to Ollama API format."""
        msg = {"role": self.role.value, "content": self.content}
        if self.tool_calls:
            msg["tool_calls"] = [
                {
                    "id": tc.id,
                    "type": "function",
                    "function": {
                        "name": tc.name,
                        "arguments": tc.arguments
                    }
                }
                for tc in self.tool_calls
            ]
        return msg

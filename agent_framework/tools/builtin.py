"""Create and register all built-in tools."""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from core.tool_registry import ToolRegistry
from tools.bash import BashTool
from tools.file_tools import ReadFileTool, WriteFileTool, EditFileTool, ListDirectoryTool
from tools.search import GlobTool, GrepTool


def create_builtin_tools() -> ToolRegistry:
    """Create a ToolRegistry with all built-in tools registered."""
    registry = ToolRegistry()
    
    # Register all tools
    registry.register(BashTool)
    registry.register(ReadFileTool)
    registry.register(WriteFileTool)
    registry.register(EditFileTool)
    registry.register(ListDirectoryTool)
    registry.register(GlobTool)
    registry.register(GrepTool)
    
    return registry

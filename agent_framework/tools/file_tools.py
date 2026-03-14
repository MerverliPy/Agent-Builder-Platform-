"""File operation tools."""
import os
from typing import Optional
import sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from core.tool_registry import Tool, ToolParameter


def read_file(file_path: str, offset: int = 1, limit: int = 500) -> str:
    """Read a file and return its contents with line numbers."""
    try:
        file_path = os.path.expanduser(file_path)
        
        if not os.path.exists(file_path):
            return f"[Error: File not found: {file_path}]"
        
        if os.path.isdir(file_path):
            entries = os.listdir(file_path)
            return "\n".join(sorted(entries))
        
        with open(file_path, 'r', encoding='utf-8', errors='replace') as f:
            lines = f.readlines()
        
        total_lines = len(lines)
        start = max(0, offset - 1)
        end = min(total_lines, start + limit)
        
        output_lines = []
        for i, line in enumerate(lines[start:end], start=start + 1):
            output_lines.append(f"{i}: {line.rstrip()}")
        
        result = "\n".join(output_lines)
        if end < total_lines:
            result += f"\n\n[Showing lines {offset}-{end} of {total_lines}]"
        
        return result
        
    except Exception as e:
        return f"[Error reading file: {str(e)}]"


def write_file(file_path: str, content: str) -> str:
    """Write content to a file."""
    try:
        file_path = os.path.expanduser(file_path)
        
        # Create parent directories if needed
        parent_dir = os.path.dirname(file_path)
        if parent_dir and not os.path.exists(parent_dir):
            os.makedirs(parent_dir)
        
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        
        return f"[Successfully wrote {len(content)} characters to {file_path}]"
        
    except Exception as e:
        return f"[Error writing file: {str(e)}]"


def edit_file(file_path: str, old_string: str, new_string: str, replace_all: bool = False) -> str:
    """Edit a file by replacing text."""
    try:
        file_path = os.path.expanduser(file_path)
        
        if not os.path.exists(file_path):
            return f"[Error: File not found: {file_path}]"
        
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        if old_string not in content:
            return f"[Error: oldString not found in {file_path}]"
        
        count = content.count(old_string)
        if count > 1 and not replace_all:
            return f"[Error: Found {count} matches. Use replace_all=true or provide more context.]"
        
        if replace_all:
            new_content = content.replace(old_string, new_string)
            replaced = count
        else:
            new_content = content.replace(old_string, new_string, 1)
            replaced = 1
        
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        
        return f"[Successfully replaced {replaced} occurrence(s) in {file_path}]"
        
    except Exception as e:
        return f"[Error editing file: {str(e)}]"


def list_directory(path: str = ".", recursive: bool = False, pattern: str = None) -> str:
    """List directory contents."""
    try:
        path = os.path.expanduser(path)
        
        if not os.path.exists(path):
            return f"[Error: Path not found: {path}]"
        
        if not os.path.isdir(path):
            return f"[Error: Not a directory: {path}]"
        
        entries = []
        
        if recursive:
            for root, dirs, files in os.walk(path):
                rel_root = os.path.relpath(root, path)
                for d in sorted(dirs):
                    rel_path = os.path.join(rel_root, d) if rel_root != "." else d
                    entries.append(f"{rel_path}/")
                for f in sorted(files):
                    rel_path = os.path.join(rel_root, f) if rel_root != "." else f
                    if pattern is None or pattern in f:
                        entries.append(rel_path)
        else:
            for entry in sorted(os.listdir(path)):
                full_path = os.path.join(path, entry)
                if os.path.isdir(full_path):
                    entries.append(f"{entry}/")
                else:
                    if pattern is None or pattern in entry:
                        entries.append(entry)
        
        return "\n".join(entries) if entries else "[Empty directory]"
        
    except Exception as e:
        return f"[Error listing directory: {str(e)}]"


ReadFileTool = Tool(
    name="read_file",
    description="Read a file's contents. Returns numbered lines.",
    parameters=[
        ToolParameter(
            name="file_path",
            type="string",
            description="Path to the file to read",
            required=True
        ),
        ToolParameter(
            name="offset",
            type="integer",
            description="Line number to start from (1-indexed, default: 1)",
            required=False,
            default=1
        ),
        ToolParameter(
            name="limit",
            type="integer",
            description="Maximum number of lines to read (default: 500)",
            required=False,
            default=500
        )
    ],
    handler=read_file
)

WriteFileTool = Tool(
    name="write_file",
    description="Write content to a file. Creates parent directories if needed.",
    parameters=[
        ToolParameter(
            name="file_path",
            type="string",
            description="Path to the file to write",
            required=True
        ),
        ToolParameter(
            name="content",
            type="string",
            description="Content to write to the file",
            required=True
        )
    ],
    handler=write_file
)

EditFileTool = Tool(
    name="edit_file",
    description="Edit a file by replacing specific text. Use for precise modifications.",
    parameters=[
        ToolParameter(
            name="file_path",
            type="string",
            description="Path to the file to edit",
            required=True
        ),
        ToolParameter(
            name="old_string",
            type="string",
            description="The exact text to find and replace",
            required=True
        ),
        ToolParameter(
            name="new_string",
            type="string",
            description="The text to replace it with",
            required=True
        ),
        ToolParameter(
            name="replace_all",
            type="boolean",
            description="Replace all occurrences (default: false)",
            required=False,
            default=False
        )
    ],
    handler=edit_file
)

ListDirectoryTool = Tool(
    name="list_directory",
    description="List files and directories in a path.",
    parameters=[
        ToolParameter(
            name="path",
            type="string",
            description="Directory path to list (default: current directory)",
            required=False,
            default="."
        ),
        ToolParameter(
            name="recursive",
            type="boolean",
            description="List recursively (default: false)",
            required=False,
            default=False
        ),
        ToolParameter(
            name="pattern",
            type="string",
            description="Filter files by pattern",
            required=False
        )
    ],
    handler=list_directory
)

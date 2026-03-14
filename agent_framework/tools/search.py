"""Search tools - glob and grep."""
import os
import re
import fnmatch
from typing import Optional
import sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from core.tool_registry import Tool, ToolParameter


def glob_search(pattern: str, path: str = ".", max_results: int = 100) -> str:
    """Search for files matching a glob pattern."""
    try:
        path = os.path.expanduser(path)
        
        if not os.path.exists(path):
            return f"[Error: Path not found: {path}]"
        
        matches = []
        
        for root, dirs, files in os.walk(path):
            # Skip hidden directories and common ignore patterns
            dirs[:] = [d for d in dirs if not d.startswith('.') and d not in ['node_modules', '__pycache__', 'venv', '.git']]
            
            for filename in files:
                full_path = os.path.join(root, filename)
                rel_path = os.path.relpath(full_path, path)
                
                # Match against the pattern
                if fnmatch.fnmatch(rel_path, pattern) or fnmatch.fnmatch(filename, pattern):
                    matches.append(rel_path)
                    if len(matches) >= max_results:
                        break
            
            if len(matches) >= max_results:
                break
        
        if not matches:
            return f"[No files matching pattern: {pattern}]"
        
        result = "\n".join(sorted(matches))
        if len(matches) == max_results:
            result += f"\n\n[Showing first {max_results} results]"
        
        return result
        
    except Exception as e:
        return f"[Error in glob search: {str(e)}]"


def grep_search(
    pattern: str,
    path: str = ".",
    include: Optional[str] = None,
    max_results: int = 50,
    ignore_case: bool = False
) -> str:
    """Search file contents using regex."""
    try:
        path = os.path.expanduser(path)
        
        if not os.path.exists(path):
            return f"[Error: Path not found: {path}]"
        
        flags = re.IGNORECASE if ignore_case else 0
        try:
            regex = re.compile(pattern, flags)
        except re.error as e:
            return f"[Error: Invalid regex pattern: {str(e)}]"
        
        matches = []
        
        for root, dirs, files in os.walk(path):
            # Skip hidden directories and common ignore patterns
            dirs[:] = [d for d in dirs if not d.startswith('.') and d not in ['node_modules', '__pycache__', 'venv', '.git']]
            
            for filename in files:
                # Filter by include pattern
                if include and not fnmatch.fnmatch(filename, include):
                    continue
                
                full_path = os.path.join(root, filename)
                rel_path = os.path.relpath(full_path, path)
                
                try:
                    with open(full_path, 'r', encoding='utf-8', errors='ignore') as f:
                        for line_num, line in enumerate(f, 1):
                            if regex.search(line):
                                matches.append(f"{rel_path}:{line_num}: {line.strip()[:100]}")
                                if len(matches) >= max_results:
                                    break
                except (IOError, OSError):
                    continue
                
                if len(matches) >= max_results:
                    break
            
            if len(matches) >= max_results:
                break
        
        if not matches:
            return f"[No matches for pattern: {pattern}]"
        
        result = "\n".join(matches)
        if len(matches) == max_results:
            result += f"\n\n[Showing first {max_results} results]"
        
        return result
        
    except Exception as e:
        return f"[Error in grep search: {str(e)}]"


GlobTool = Tool(
    name="glob",
    description="Search for files matching a glob pattern (e.g., '*.py', 'src/**/*.ts').",
    parameters=[
        ToolParameter(
            name="pattern",
            type="string",
            description="Glob pattern to match files",
            required=True
        ),
        ToolParameter(
            name="path",
            type="string",
            description="Directory to search in (default: current directory)",
            required=False,
            default="."
        ),
        ToolParameter(
            name="max_results",
            type="integer",
            description="Maximum number of results (default: 100)",
            required=False,
            default=100
        )
    ],
    handler=glob_search
)

GrepTool = Tool(
    name="grep",
    description="Search file contents using regex. Returns matching lines with file path and line numbers.",
    parameters=[
        ToolParameter(
            name="pattern",
            type="string",
            description="Regex pattern to search for",
            required=True
        ),
        ToolParameter(
            name="path",
            type="string",
            description="Directory to search in (default: current directory)",
            required=False,
            default="."
        ),
        ToolParameter(
            name="include",
            type="string",
            description="File pattern to include (e.g., '*.py', '*.js')",
            required=False
        ),
        ToolParameter(
            name="max_results",
            type="integer",
            description="Maximum number of results (default: 50)",
            required=False,
            default=50
        ),
        ToolParameter(
            name="ignore_case",
            type="boolean",
            description="Case-insensitive search (default: false)",
            required=False,
            default=False
        )
    ],
    handler=grep_search
)

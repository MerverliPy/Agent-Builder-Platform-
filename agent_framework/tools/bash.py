"""Bash command execution tool."""
import subprocess
import os
from typing import Optional
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from core.tool_registry import Tool, ToolParameter


def execute_bash(
    command: str,
    workdir: Optional[str] = None,
    timeout: int = 120
) -> str:
    """Execute a bash command and return the output."""
    try:
        cwd = workdir or os.getcwd()
        
        result = subprocess.run(
            command,
            shell=True,
            cwd=cwd,
            capture_output=True,
            text=True,
            timeout=timeout
        )
        
        output = ""
        if result.stdout:
            output += result.stdout
        if result.stderr:
            if output:
                output += "\n--- stderr ---\n"
            output += result.stderr
        
        if result.returncode != 0:
            output += f"\n[Exit code: {result.returncode}]"
        
        return output.strip() or "[Command completed with no output]"
        
    except subprocess.TimeoutExpired:
        return f"[Error: Command timed out after {timeout} seconds]"
    except Exception as e:
        return f"[Error: {str(e)}]"


BashTool = Tool(
    name="bash",
    description="Execute a bash command in the shell. Use for running scripts, git commands, package managers, etc.",
    parameters=[
        ToolParameter(
            name="command",
            type="string",
            description="The bash command to execute",
            required=True
        ),
        ToolParameter(
            name="workdir",
            type="string",
            description="Working directory for the command (defaults to current directory)",
            required=False
        ),
        ToolParameter(
            name="timeout",
            type="integer",
            description="Timeout in seconds (default: 120)",
            required=False,
            default=120
        )
    ],
    handler=execute_bash
)

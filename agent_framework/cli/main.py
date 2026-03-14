"""Interactive CLI for the Qwen Agent."""
import asyncio
import sys
import os

# Add parent to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from rich.console import Console
from rich.panel import Panel
from rich.markdown import Markdown
from rich.live import Live
from rich.text import Text
from prompt_toolkit import PromptSession
from prompt_toolkit.history import FileHistory
from prompt_toolkit.auto_suggest import AutoSuggestFromHistory

from core.agent import Agent
from core.task_planner import TaskPlanner
from tools.builtin import create_builtin_tools
from memory.memory_store import MemoryStore
from config.settings import Settings


class QwenAgentCLI:
    """Interactive command-line interface for the agent."""
    
    def __init__(self, settings: Settings = None):
        self.settings = settings or Settings()
        self.console = Console()
        
        # Initialize components
        self.tool_registry = create_builtin_tools()
        self.memory_store = MemoryStore()
        self.task_planner = TaskPlanner()
        
        # Add memory and task tools
        self._register_meta_tools()
        
        # Initialize agent
        self.agent = Agent(
            model=self.settings.model,
            system_prompt=self._build_system_prompt(),
            tool_registry=self.tool_registry,
            max_iterations=self.settings.max_iterations,
            ollama_host=self.settings.ollama_host
        )
        
        # Setup prompt history
        history_path = os.path.expanduser("~/.qwen-agent/history")
        os.makedirs(os.path.dirname(history_path), exist_ok=True)
        self.session = PromptSession(
            history=FileHistory(history_path),
            auto_suggest=AutoSuggestFromHistory()
        )
    
    def _build_system_prompt(self) -> str:
        """Build the system prompt with context."""
        base_prompt = """You are a powerful AI coding assistant running in a terminal.

You have access to tools for:
- Executing bash commands
- Reading, writing, and editing files
- Searching files with glob patterns and grep
- Managing a task list for complex work
- Storing and retrieving memories

When given a task:
1. Break it down into steps using the task_planner tool
2. Execute each step methodically
3. Mark tasks complete as you finish them
4. Verify your work

Be concise but thorough. Use tools proactively to accomplish goals.
Current working directory: {cwd}
"""
        return base_prompt.format(cwd=os.getcwd())
    
    def _register_meta_tools(self):
        """Register memory and task planning tools."""
        from core.tool_registry import Tool, ToolParameter
        import uuid
        
        # Memory tool
        def memory_handler(mode: str, content: str = None, query: str = None, memory_type: str = "fact"):
            from memory.memory_store import Memory, MemoryType
            
            if mode == "add" and content:
                mem = Memory(
                    id=str(uuid.uuid4()),
                    type=MemoryType(memory_type),
                    content=content
                )
                self.memory_store.add(mem)
                return f"Memory stored: {content[:50]}..."
            
            elif mode == "search" and query:
                results = self.memory_store.search(query)
                if not results:
                    return "No memories found."
                return "\n".join([f"- {m.content}" for m in results])
            
            elif mode == "list":
                memories = self.memory_store.list_all()
                if not memories:
                    return "No memories stored."
                return "\n".join([f"[{m.type.value}] {m.content}" for m in memories])
            
            return "Invalid mode. Use: add, search, or list"
        
        memory_tool = Tool(
            name="memory",
            description="Store and retrieve persistent memories. Use 'add' to store, 'search' to find, 'list' to see all.",
            parameters=[
                ToolParameter(name="mode", type="string", description="Operation: add, search, or list", required=True, enum=["add", "search", "list"]),
                ToolParameter(name="content", type="string", description="Content to store (for add)", required=False),
                ToolParameter(name="query", type="string", description="Search query (for search)", required=False),
                ToolParameter(name="memory_type", type="string", description="Type of memory", required=False, enum=["fact", "preference", "project_info", "learned_pattern"])
            ],
            handler=memory_handler
        )
        self.tool_registry.register(memory_tool)
        
        # Task planner tool
        def task_handler(action: str, task_id: str = None, content: str = None, priority: str = "medium", tasks: list = None):
            from core.task_planner import TaskPriority, TaskStatus
            
            if action == "add" and content:
                task = self.task_planner.add_task(content, TaskPriority(priority))
                return f"Added task: {task.content} ({task.id})"
            
            elif action == "add_multiple" and tasks:
                created = self.task_planner.add_tasks(tasks)
                return f"Added {len(created)} tasks"
            
            elif action == "start" and task_id:
                task = self.task_planner.start_task(task_id)
                return f"Started: {task.content}" if task else "Task not found"
            
            elif action == "complete" and task_id:
                task = self.task_planner.complete_task(task_id)
                return f"Completed: {task.content}" if task else "Task not found"
            
            elif action == "list":
                return self.task_planner.format_tasks()
            
            elif action == "clear":
                self.task_planner.clear_all()
                return "Cleared all tasks"
            
            return "Invalid action. Use: add, add_multiple, start, complete, list, clear"
        
        task_tool = Tool(
            name="task_planner",
            description="Manage a todo list for complex tasks. Use to plan and track work.",
            parameters=[
                ToolParameter(name="action", type="string", description="Action: add, add_multiple, start, complete, list, clear", required=True, enum=["add", "add_multiple", "start", "complete", "list", "clear"]),
                ToolParameter(name="task_id", type="string", description="Task ID for start/complete actions", required=False),
                ToolParameter(name="content", type="string", description="Task description (for add)", required=False),
                ToolParameter(name="priority", type="string", description="Task priority", required=False, enum=["high", "medium", "low"]),
                ToolParameter(name="tasks", type="array", description="List of task objects for add_multiple", required=False)
            ],
            handler=task_handler
        )
        self.tool_registry.register(task_tool)
    
    def _print_welcome(self):
        """Print welcome message."""
        self.console.print(Panel(
            "[bold blue]Qwen Agent[/bold blue] - Your AI Coding Assistant\n\n"
            f"Model: [cyan]{self.settings.model}[/cyan]\n"
            f"Working directory: [dim]{os.getcwd()}[/dim]\n\n"
            "Commands:\n"
            "  [green]/help[/green]    - Show help\n"
            "  [green]/clear[/green]   - Clear conversation\n"
            "  [green]/tasks[/green]   - Show current tasks\n"
            "  [green]/memory[/green]  - Show memories\n"
            "  [green]/quit[/green]    - Exit\n",
            title="Welcome",
            border_style="blue"
        ))
    
    def _handle_command(self, command: str) -> bool:
        """Handle CLI commands. Returns True if should continue."""
        cmd = command.strip().lower()
        
        if cmd in ['/quit', '/exit', '/q']:
            self.console.print("[dim]Goodbye![/dim]")
            return False
        
        elif cmd == '/help':
            self._print_welcome()
        
        elif cmd == '/clear':
            self.agent.clear_history()
            self.console.print("[dim]Conversation cleared.[/dim]")
        
        elif cmd == '/tasks':
            tasks = self.task_planner.format_tasks()
            self.console.print(Panel(tasks, title="Tasks", border_style="yellow"))
        
        elif cmd == '/memory':
            memories = self.memory_store.list_all()
            if memories:
                text = "\n".join([f"[{m.type.value}] {m.content}" for m in memories])
            else:
                text = "No memories stored."
            self.console.print(Panel(text, title="Memories", border_style="magenta"))
        
        else:
            self.console.print(f"[red]Unknown command: {command}[/red]")
        
        return True
    
    async def _process_input(self, user_input: str):
        """Process user input and display agent response."""
        self.console.print()
        
        with self.console.status("[bold green]Thinking...[/bold green]"):
            response_parts = []
            async for chunk in self.agent.run(user_input):
                response_parts.append(chunk)
        
        # Display the response
        full_response = ''.join(response_parts)
        
        # Try to render as markdown
        try:
            self.console.print(Panel(
                Markdown(full_response),
                border_style="green"
            ))
        except Exception:
            self.console.print(Panel(full_response, border_style="green"))
    
    async def run(self):
        """Run the interactive CLI loop."""
        self._print_welcome()
        
        while True:
            try:
                # Get user input
                user_input = await asyncio.get_event_loop().run_in_executor(
                    None,
                    lambda: self.session.prompt("\n[You] > ")
                )
                
                if not user_input.strip():
                    continue
                
                # Handle commands
                if user_input.startswith('/'):
                    if not self._handle_command(user_input):
                        break
                    continue
                
                # Process with agent
                await self._process_input(user_input)
                
            except KeyboardInterrupt:
                self.console.print("\n[dim]Use /quit to exit[/dim]")
            except EOFError:
                break
            except Exception as e:
                self.console.print(f"[red]Error: {e}[/red]")


def main():
    """Main entry point."""
    cli = QwenAgentCLI()
    asyncio.run(cli.run())


if __name__ == "__main__":
    main()

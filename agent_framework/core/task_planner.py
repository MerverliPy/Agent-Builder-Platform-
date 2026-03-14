"""Task planning and todo management."""
from enum import Enum
from typing import Optional
from datetime import datetime
from pydantic import BaseModel
import json
import os


class TaskStatus(str, Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class TaskPriority(str, Enum):
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"


class Task(BaseModel):
    """A task in the todo list."""
    id: str
    content: str
    status: TaskStatus = TaskStatus.PENDING
    priority: TaskPriority = TaskPriority.MEDIUM
    created_at: datetime = None
    completed_at: Optional[datetime] = None
    
    def __init__(self, **data):
        if 'created_at' not in data or data['created_at'] is None:
            data['created_at'] = datetime.now()
        super().__init__(**data)


class TaskPlanner:
    """
    Manages a todo list for the agent to track complex tasks.
    """
    
    def __init__(self, storage_path: str = None):
        if storage_path is None:
            home = os.path.expanduser("~")
            storage_dir = os.path.join(home, ".qwen-agent")
            self.storage_path = os.path.join(storage_dir, "tasks.json")
        else:
            self.storage_path = storage_path
        
        self.tasks: dict[str, Task] = {}
        self._task_counter = 0
        self._load()
    
    def _load(self):
        """Load tasks from disk."""
        if os.path.exists(self.storage_path):
            try:
                with open(self.storage_path, 'r') as f:
                    data = json.load(f)
                    self._task_counter = data.get('_counter', 0)
                    for task_id, task_data in data.get('tasks', {}).items():
                        if 'created_at' in task_data:
                            task_data['created_at'] = datetime.fromisoformat(task_data['created_at'])
                        if task_data.get('completed_at'):
                            task_data['completed_at'] = datetime.fromisoformat(task_data['completed_at'])
                        self.tasks[task_id] = Task(**task_data)
            except (json.JSONDecodeError, Exception):
                self.tasks = {}
    
    def _save(self):
        """Save tasks to disk."""
        os.makedirs(os.path.dirname(self.storage_path), exist_ok=True)
        
        data = {'_counter': self._task_counter, 'tasks': {}}
        for task_id, task in self.tasks.items():
            task_dict = task.model_dump()
            task_dict['created_at'] = task.created_at.isoformat()
            if task.completed_at:
                task_dict['completed_at'] = task.completed_at.isoformat()
            data['tasks'][task_id] = task_dict
        
        with open(self.storage_path, 'w') as f:
            json.dump(data, f, indent=2)
    
    def add_task(self, content: str, priority: TaskPriority = TaskPriority.MEDIUM) -> Task:
        """Add a new task."""
        self._task_counter += 1
        task_id = f"task_{self._task_counter}"
        
        task = Task(
            id=task_id,
            content=content,
            priority=priority
        )
        self.tasks[task_id] = task
        self._save()
        return task
    
    def add_tasks(self, tasks: list[dict]) -> list[Task]:
        """Add multiple tasks at once."""
        created = []
        for task_data in tasks:
            content = task_data.get('content', '')
            priority = TaskPriority(task_data.get('priority', 'medium'))
            status = TaskStatus(task_data.get('status', 'pending'))
            
            self._task_counter += 1
            task = Task(
                id=f"task_{self._task_counter}",
                content=content,
                priority=priority,
                status=status
            )
            self.tasks[task.id] = task
            created.append(task)
        
        self._save()
        return created
    
    def update_status(self, task_id: str, status: TaskStatus) -> Optional[Task]:
        """Update a task's status."""
        if task_id not in self.tasks:
            return None
        
        task = self.tasks[task_id]
        task.status = status
        
        if status == TaskStatus.COMPLETED:
            task.completed_at = datetime.now()
        
        self._save()
        return task
    
    def start_task(self, task_id: str) -> Optional[Task]:
        """Mark a task as in progress."""
        return self.update_status(task_id, TaskStatus.IN_PROGRESS)
    
    def complete_task(self, task_id: str) -> Optional[Task]:
        """Mark a task as completed."""
        return self.update_status(task_id, TaskStatus.COMPLETED)
    
    def cancel_task(self, task_id: str) -> Optional[Task]:
        """Cancel a task."""
        return self.update_status(task_id, TaskStatus.CANCELLED)
    
    def get_tasks(self, status: TaskStatus = None) -> list[Task]:
        """Get all tasks, optionally filtered by status."""
        tasks = list(self.tasks.values())
        
        if status:
            tasks = [t for t in tasks if t.status == status]
        
        # Sort by priority and creation time
        priority_order = {TaskPriority.HIGH: 0, TaskPriority.MEDIUM: 1, TaskPriority.LOW: 2}
        tasks.sort(key=lambda t: (priority_order[t.priority], t.created_at))
        
        return tasks
    
    def get_pending_tasks(self) -> list[Task]:
        """Get all pending tasks."""
        return self.get_tasks(TaskStatus.PENDING)
    
    def get_in_progress(self) -> list[Task]:
        """Get tasks currently in progress."""
        return self.get_tasks(TaskStatus.IN_PROGRESS)
    
    def clear_completed(self):
        """Remove all completed tasks."""
        self.tasks = {
            tid: task for tid, task in self.tasks.items()
            if task.status != TaskStatus.COMPLETED
        }
        self._save()
    
    def clear_all(self):
        """Clear all tasks."""
        self.tasks = {}
        self._task_counter = 0
        self._save()
    
    def format_tasks(self) -> str:
        """Format tasks for display."""
        if not self.tasks:
            return "No tasks."
        
        lines = []
        status_icons = {
            TaskStatus.PENDING: "[ ]",
            TaskStatus.IN_PROGRESS: "[~]",
            TaskStatus.COMPLETED: "[x]",
            TaskStatus.CANCELLED: "[-]"
        }
        priority_icons = {
            TaskPriority.HIGH: "!",
            TaskPriority.MEDIUM: ".",
            TaskPriority.LOW: " "
        }
        
        for task in self.get_tasks():
            icon = status_icons[task.status]
            prio = priority_icons[task.priority]
            lines.append(f"{icon}{prio} {task.content} ({task.id})")
        
        return "\n".join(lines)

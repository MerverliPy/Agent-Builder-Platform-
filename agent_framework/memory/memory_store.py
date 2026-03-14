"""Persistent memory store for the agent."""
import json
import os
from enum import Enum
from datetime import datetime
from typing import Optional, Any
from pydantic import BaseModel


class MemoryType(str, Enum):
    FACT = "fact"
    PREFERENCE = "preference"
    PROJECT_INFO = "project_info"
    LEARNED_PATTERN = "learned_pattern"
    CONVERSATION = "conversation"


class Memory(BaseModel):
    """A single memory entry."""
    id: str
    type: MemoryType
    content: str
    metadata: dict[str, Any] = {}
    created_at: datetime = None
    updated_at: datetime = None
    relevance_score: float = 1.0
    
    def __init__(self, **data):
        now = datetime.now()
        if 'created_at' not in data or data['created_at'] is None:
            data['created_at'] = now
        if 'updated_at' not in data or data['updated_at'] is None:
            data['updated_at'] = now
        super().__init__(**data)


class MemoryStore:
    """
    Simple file-based memory store.
    Stores memories as JSON for persistence across sessions.
    """
    
    def __init__(self, storage_path: str = None):
        if storage_path is None:
            # Default to ~/.qwen-agent/memory.json
            home = os.path.expanduser("~")
            self.storage_dir = os.path.join(home, ".qwen-agent")
            self.storage_path = os.path.join(self.storage_dir, "memory.json")
        else:
            self.storage_path = storage_path
            self.storage_dir = os.path.dirname(storage_path)
        
        self._ensure_storage()
        self.memories: dict[str, Memory] = {}
        self._load()
    
    def _ensure_storage(self):
        """Ensure storage directory exists."""
        if self.storage_dir and not os.path.exists(self.storage_dir):
            os.makedirs(self.storage_dir)
    
    def _load(self):
        """Load memories from disk."""
        if os.path.exists(self.storage_path):
            try:
                with open(self.storage_path, 'r') as f:
                    data = json.load(f)
                    for mem_id, mem_data in data.items():
                        # Parse datetime strings
                        if 'created_at' in mem_data:
                            mem_data['created_at'] = datetime.fromisoformat(mem_data['created_at'])
                        if 'updated_at' in mem_data:
                            mem_data['updated_at'] = datetime.fromisoformat(mem_data['updated_at'])
                        self.memories[mem_id] = Memory(**mem_data)
            except (json.JSONDecodeError, Exception):
                self.memories = {}
    
    def _save(self):
        """Save memories to disk."""
        data = {}
        for mem_id, memory in self.memories.items():
            mem_dict = memory.model_dump()
            # Convert datetime to ISO format
            mem_dict['created_at'] = memory.created_at.isoformat()
            mem_dict['updated_at'] = memory.updated_at.isoformat()
            data[mem_id] = mem_dict
        
        with open(self.storage_path, 'w') as f:
            json.dump(data, f, indent=2)
    
    def add(self, memory: Memory) -> Memory:
        """Add a memory to the store."""
        self.memories[memory.id] = memory
        self._save()
        return memory
    
    def get(self, memory_id: str) -> Optional[Memory]:
        """Get a memory by ID."""
        return self.memories.get(memory_id)
    
    def search(self, query: str, memory_type: MemoryType = None, limit: int = 10) -> list[Memory]:
        """
        Simple search through memories.
        Returns memories containing the query string.
        """
        results = []
        query_lower = query.lower()
        
        for memory in self.memories.values():
            if memory_type and memory.type != memory_type:
                continue
            
            if query_lower in memory.content.lower():
                results.append(memory)
        
        # Sort by relevance score and recency
        results.sort(key=lambda m: (m.relevance_score, m.updated_at), reverse=True)
        return results[:limit]
    
    def list_all(self, memory_type: MemoryType = None, limit: int = 50) -> list[Memory]:
        """List all memories, optionally filtered by type."""
        results = list(self.memories.values())
        
        if memory_type:
            results = [m for m in results if m.type == memory_type]
        
        results.sort(key=lambda m: m.updated_at, reverse=True)
        return results[:limit]
    
    def delete(self, memory_id: str) -> bool:
        """Delete a memory by ID."""
        if memory_id in self.memories:
            del self.memories[memory_id]
            self._save()
            return True
        return False
    
    def clear(self):
        """Clear all memories."""
        self.memories = {}
        self._save()

"""Conversation memory for maintaining context across sessions."""
import json
import os
from datetime import datetime
from typing import Optional
from ..core.message import Message, Role


class ConversationMemory:
    """
    Manages conversation history with persistence.
    Stores recent conversations and allows retrieval of context.
    """
    
    def __init__(self, storage_path: str = None, max_conversations: int = 10):
        if storage_path is None:
            home = os.path.expanduser("~")
            storage_dir = os.path.join(home, ".qwen-agent")
            self.storage_path = os.path.join(storage_dir, "conversations.json")
        else:
            self.storage_path = storage_path
        
        self.max_conversations = max_conversations
        self.conversations: dict[str, list[dict]] = {}
        self._current_id: Optional[str] = None
        self._load()
    
    def _load(self):
        """Load conversations from disk."""
        if os.path.exists(self.storage_path):
            try:
                with open(self.storage_path, 'r') as f:
                    self.conversations = json.load(f)
            except (json.JSONDecodeError, Exception):
                self.conversations = {}
    
    def _save(self):
        """Save conversations to disk."""
        # Ensure directory exists
        os.makedirs(os.path.dirname(self.storage_path), exist_ok=True)
        
        # Prune old conversations if needed
        if len(self.conversations) > self.max_conversations:
            # Sort by last message timestamp and keep recent ones
            sorted_convs = sorted(
                self.conversations.items(),
                key=lambda x: x[1][-1].get('timestamp', '') if x[1] else '',
                reverse=True
            )
            self.conversations = dict(sorted_convs[:self.max_conversations])
        
        with open(self.storage_path, 'w') as f:
            json.dump(self.conversations, f, indent=2)
    
    def start_conversation(self, conversation_id: str = None) -> str:
        """Start a new conversation or resume an existing one."""
        if conversation_id is None:
            conversation_id = datetime.now().strftime("%Y%m%d_%H%M%S")
        
        if conversation_id not in self.conversations:
            self.conversations[conversation_id] = []
        
        self._current_id = conversation_id
        return conversation_id
    
    def add_message(self, message: Message, conversation_id: str = None):
        """Add a message to a conversation."""
        conv_id = conversation_id or self._current_id
        if conv_id is None:
            conv_id = self.start_conversation()
        
        if conv_id not in self.conversations:
            self.conversations[conv_id] = []
        
        msg_dict = {
            'role': message.role.value,
            'content': message.content,
            'timestamp': message.timestamp.isoformat() if message.timestamp else datetime.now().isoformat()
        }
        
        if message.tool_calls:
            msg_dict['tool_calls'] = [
                {'id': tc.id, 'name': tc.name, 'arguments': tc.arguments}
                for tc in message.tool_calls
            ]
        
        self.conversations[conv_id].append(msg_dict)
        self._save()
    
    def get_conversation(self, conversation_id: str = None) -> list[Message]:
        """Get messages from a conversation."""
        conv_id = conversation_id or self._current_id
        if conv_id is None or conv_id not in self.conversations:
            return []
        
        messages = []
        for msg_dict in self.conversations[conv_id]:
            messages.append(Message(
                role=Role(msg_dict['role']),
                content=msg_dict['content']
            ))
        return messages
    
    def get_recent_context(self, n_messages: int = 10, conversation_id: str = None) -> list[Message]:
        """Get recent messages for context."""
        messages = self.get_conversation(conversation_id)
        return messages[-n_messages:] if messages else []
    
    def list_conversations(self) -> list[dict]:
        """List all conversations with metadata."""
        result = []
        for conv_id, messages in self.conversations.items():
            if messages:
                result.append({
                    'id': conv_id,
                    'message_count': len(messages),
                    'last_message': messages[-1].get('timestamp', ''),
                    'preview': messages[-1].get('content', '')[:100]
                })
        return sorted(result, key=lambda x: x['last_message'], reverse=True)
    
    def delete_conversation(self, conversation_id: str) -> bool:
        """Delete a conversation."""
        if conversation_id in self.conversations:
            del self.conversations[conversation_id]
            self._save()
            return True
        return False

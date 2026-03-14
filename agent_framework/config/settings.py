"""Settings and configuration management."""
import os
import yaml
from typing import Optional
from pydantic import BaseModel


class Settings(BaseModel):
    """Agent configuration settings."""
    
    # Model settings
    model: str = "qwen2.5-coder:14b"
    ollama_host: Optional[str] = None
    max_iterations: int = 10
    
    # Behavior settings
    auto_confirm_tools: bool = True
    verbose: bool = False
    
    # Storage paths
    storage_dir: str = None
    
    # Tool settings
    bash_timeout: int = 120
    max_file_lines: int = 500
    
    def __init__(self, **data):
        # Set default storage dir
        if 'storage_dir' not in data or data['storage_dir'] is None:
            data['storage_dir'] = os.path.expanduser("~/.qwen-agent")
        super().__init__(**data)
    
    @classmethod
    def from_file(cls, path: str) -> "Settings":
        """Load settings from a YAML file."""
        with open(path, 'r') as f:
            data = yaml.safe_load(f)
        return cls(**data) if data else cls()
    
    @classmethod
    def from_env(cls) -> "Settings":
        """Load settings from environment variables."""
        data = {}
        
        if os.environ.get('QWEN_MODEL'):
            data['model'] = os.environ['QWEN_MODEL']
        
        if os.environ.get('OLLAMA_HOST'):
            data['ollama_host'] = os.environ['OLLAMA_HOST']
        
        if os.environ.get('QWEN_MAX_ITERATIONS'):
            data['max_iterations'] = int(os.environ['QWEN_MAX_ITERATIONS'])
        
        if os.environ.get('QWEN_VERBOSE'):
            data['verbose'] = os.environ['QWEN_VERBOSE'].lower() in ('true', '1', 'yes')
        
        return cls(**data)
    
    @classmethod
    def load(cls, config_path: str = None) -> "Settings":
        """Load settings from file and environment (env takes precedence)."""
        # Start with defaults
        settings_data = {}
        
        # Try to load from config file
        if config_path and os.path.exists(config_path):
            with open(config_path, 'r') as f:
                file_data = yaml.safe_load(f)
                if file_data:
                    settings_data.update(file_data)
        else:
            # Try default config locations
            default_paths = [
                os.path.expanduser("~/.qwen-agent/config.yaml"),
                os.path.expanduser("~/.config/qwen-agent/config.yaml"),
                "./qwen-agent.yaml"
            ]
            for path in default_paths:
                if os.path.exists(path):
                    with open(path, 'r') as f:
                        file_data = yaml.safe_load(f)
                        if file_data:
                            settings_data.update(file_data)
                    break
        
        # Override with environment variables
        env_settings = cls.from_env()
        for field, value in env_settings.model_dump().items():
            if value is not None and os.environ.get(f'QWEN_{field.upper()}'):
                settings_data[field] = value
        
        return cls(**settings_data)
    
    def save(self, path: str = None):
        """Save settings to a YAML file."""
        if path is None:
            path = os.path.join(self.storage_dir, "config.yaml")
        
        os.makedirs(os.path.dirname(path), exist_ok=True)
        
        with open(path, 'w') as f:
            yaml.dump(self.model_dump(), f, default_flow_style=False)


# Example config file content
EXAMPLE_CONFIG = """
# Qwen Agent Configuration

# Model settings
model: qwen2.5-coder:14b
ollama_host: http://localhost:11434
max_iterations: 10

# Behavior
auto_confirm_tools: true
verbose: false

# Tool settings
bash_timeout: 120
max_file_lines: 500
"""

# Qwen Agent Framework

A powerful AI agent framework built for Ollama with Qwen models, with **OpenCode integration**.

## Features

- **OpenCode Integration** - Use Qwen as a provider inside OpenCode
- **Tool Call Translation** - Converts Qwen's JSON output to proper OpenAI tool_calls
- **Built-in Tools** - bash, file read/write/edit, glob, grep
- **Memory System** - Persistent storage across sessions
- **Task Planning** - Todo list for complex multi-step tasks
- **Interactive CLI** - Rich terminal interface with history

---

## OpenCode Integration (Recommended)

Use Qwen inside OpenCode with proper tool calling support:

### 1. Start the Bridge Server

```bash
cd agent_framework

# First time setup
python3 -m venv venv
source venv/bin/activate
pip install ollama rich prompt-toolkit pydantic pyyaml fastapi uvicorn

# Start the server
./start_server.sh

# Or manually:
python server/api.py --port 8787 --model qwen2.5-coder:14b
```

### 2. Configure OpenCode

Add to `~/.config/opencode/opencode.json`:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "provider": {
    "qwen-agent": {
      "npm": "@ai-sdk/openai-compatible",
      "name": "Qwen Agent (local)",
      "options": {
        "baseURL": "http://127.0.0.1:8787/v1"
      },
      "models": {
        "qwen2.5-coder:14b": {
          "name": "Qwen 2.5 Coder 14B (Agent)",
          "limit": {
            "context": 32768,
            "output": 8192
          }
        }
      }
    }
  }
}
```

### 3. Use in OpenCode

```bash
# Restart OpenCode
opencode

# Select the model
/models
# Choose: Qwen 2.5 Coder 14B (Agent)
```

Now Qwen will work with proper tool calling inside OpenCode!

---

## How the Bridge Works

The problem: Qwen via Ollama outputs tool calls as raw JSON text:
```json
{"name": "list_directory", "arguments": {"path": "."}}
```

OpenCode expects proper OpenAI-format tool_calls:
```json
{
  "tool_calls": [{
    "id": "call_xxx",
    "type": "function", 
    "function": {"name": "list_directory", "arguments": "{\"path\": \".\"}"}
  }]
}
```

The bridge server (`server/api.py`) translates between these formats, making Qwen work seamlessly with OpenCode.

---

## Standalone Usage

### Interactive CLI

```bash
cd agent_framework
source venv/bin/activate
python run.py
```

Commands:
- `/help` - Show help
- `/clear` - Clear conversation
- `/tasks` - Show task list
- `/memory` - Show stored memories
- `/quit` - Exit

### Programmatic Usage

```python
import asyncio
from core.agent import Agent
from tools.builtin import create_builtin_tools

async def main():
    agent = Agent(
        model="qwen2.5-coder:14b",
        tool_registry=create_builtin_tools()
    )
    
    async for response in agent.run("Create a hello world Python script"):
        print(response, end='')

asyncio.run(main())
```

---

## Project Structure

```
agent_framework/
├── server/
│   └── api.py            # OpenAI-compatible API (for OpenCode)
├── core/
│   ├── agent.py          # Main Agent class
│   ├── message.py        # Message types
│   ├── tool_registry.py  # Tool system
│   └── task_planner.py   # Todo management
├── tools/
│   ├── bash.py           # Shell execution
│   ├── file_tools.py     # File operations
│   ├── search.py         # Glob/grep
│   └── builtin.py        # Tool registration
├── memory/
│   ├── memory_store.py   # Persistent memory
│   └── conversation_memory.py
├── config/
│   └── settings.py       # Configuration
├── cli/
│   └── main.py           # Interactive CLI
├── start_server.sh       # Start OpenCode bridge
├── run.py                # Standalone CLI entry point
└── test_agent.py         # Test script
```

## Requirements

- Python 3.10+
- Ollama running locally (`ollama serve`)
- qwen2.5-coder:14b pulled (`ollama pull qwen2.5-coder:14b`)

## API Endpoints (Bridge Server)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/v1/chat/completions` | POST | OpenAI-compatible chat API |
| `/v1/models` | GET | List available models |
| `/health` | GET | Health check |

---

## Troubleshooting

### "Connection refused" when starting OpenCode
Make sure the bridge server is running:
```bash
curl http://127.0.0.1:8787/health
```

### Tools not being called
The bridge parses JSON from Qwen's output. If Qwen isn't outputting proper JSON, try:
1. Using a larger model (14b+ recommended)
2. Adjusting the system prompt in `server/api.py`

### Model not appearing in OpenCode
1. Restart OpenCode after modifying the config
2. Run `/models` to refresh the model list

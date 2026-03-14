#!/usr/bin/env python3
"""Simple test script to verify the agent works."""
import asyncio
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from core.agent import Agent
from tools.builtin import create_builtin_tools


async def test_agent():
    """Test the agent with a simple task."""
    print("=" * 50)
    print("Testing Qwen Agent Framework")
    print("=" * 50)
    
    # Create agent with tools
    tools = create_builtin_tools()
    agent = Agent(
        model="qwen2.5-coder:14b",
        tool_registry=tools,
        max_iterations=5
    )
    
    # Test 1: Simple question
    print("\n[Test 1] Simple response:")
    print("-" * 30)
    async for chunk in agent.run("Say hello and tell me what tools you have available."):
        print(chunk, end='', flush=True)
    print()
    
    # Test 2: Tool use - list files
    print("\n[Test 2] List current directory:")
    print("-" * 30)
    agent.clear_history()
    async for chunk in agent.run("List the files in the current directory."):
        print(chunk, end='', flush=True)
    print()
    
    # Test 3: Read a file
    print("\n[Test 3] Read this test file:")
    print("-" * 30)
    agent.clear_history()
    async for chunk in agent.run("Read the first 20 lines of test_agent.py"):
        print(chunk, end='', flush=True)
    print()
    
    print("\n" + "=" * 50)
    print("Tests completed!")
    print("=" * 50)


def main():
    """Run tests."""
    try:
        asyncio.run(test_agent())
    except KeyboardInterrupt:
        print("\n[Interrupted]")
    except Exception as e:
        print(f"\n[Error] {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    main()

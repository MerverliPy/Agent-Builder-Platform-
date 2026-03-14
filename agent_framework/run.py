#!/usr/bin/env python3
"""Qwen Agent - An AI coding assistant powered by Ollama."""
import argparse
import asyncio
import sys
import os

# Ensure the package is importable
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from cli.main import QwenAgentCLI
from config.settings import Settings


def main():
    parser = argparse.ArgumentParser(
        description="Qwen Agent - AI Coding Assistant",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  qwen-agent                    # Start interactive mode
  qwen-agent --model qwen2.5:7b # Use a different model
  qwen-agent -c config.yaml     # Use custom config file
        """
    )
    
    parser.add_argument(
        '-m', '--model',
        default=None,
        help='Ollama model to use (default: qwen2.5-coder:14b)'
    )
    parser.add_argument(
        '-c', '--config',
        default=None,
        help='Path to config file'
    )
    parser.add_argument(
        '--host',
        default=None,
        help='Ollama host URL'
    )
    parser.add_argument(
        '-v', '--verbose',
        action='store_true',
        help='Enable verbose output'
    )
    parser.add_argument(
        '--version',
        action='version',
        version='Qwen Agent 0.1.0'
    )
    
    args = parser.parse_args()
    
    # Load settings
    settings = Settings.load(args.config)
    
    # Override with command line args
    if args.model:
        settings.model = args.model
    if args.host:
        settings.ollama_host = args.host
    if args.verbose:
        settings.verbose = True
    
    # Run the CLI
    cli = QwenAgentCLI(settings)
    asyncio.run(cli.run())


if __name__ == "__main__":
    main()

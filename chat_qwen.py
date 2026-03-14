#!/usr/bin/env python3
"""Simple interactive chat with Qwen 2.5 Coder Agent"""
import ollama

client = ollama.Client()
messages = []

print("Chat with Qwen 2.5 Coder Agent (type 'exit' to quit)")
print("-" * 50)

while True:
    user_input = input("\nYou: ").strip()
    if user_input.lower() in ['exit', 'quit', 'q']:
        break
    if not user_input:
        continue
    
    messages.append({"role": "user", "content": user_input})
    
    response = client.chat(
        model="qwen2.5-coder-agent:14b",
        messages=messages,
        stream=True
    )
    
    print("\nQwen: ", end="", flush=True)
    full_response = ""
    for chunk in response:
        text = chunk['message']['content']
        print(text, end="", flush=True)
        full_response += text
    print()
    
    messages.append({"role": "assistant", "content": full_response})

print("\nGoodbye!")

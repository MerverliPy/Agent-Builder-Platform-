# Agent Sandbox Guide

## Overview

The **Agent Sandbox** is a dedicated testing and interaction workspace for each agent in the Custom Agent Builder Platform (CABP). It provides a live chat interface to test agent configurations, conversational capabilities, and response generation before deploying agents to production.

## Key Features

### 1. Live Chat Interface
- Real-time message exchange with agents
- Clean, intuitive UI with message history
- Automatic conversation persistence during the session
- Smooth animations and responsive design (desktop, tablet, mobile)

### 2. Dual-Mode Operation

#### Production Mode (LLM Configured)
When an AI/LLM provider is properly configured (e.g., Ollama, OpenAI):
- Real API calls to the configured LLM provider
- Agent responses generated based on actual model inference
- Conversation context maintained across messages
- Unique `conversationId` for tracking agent interactions

#### Mock/Demo Mode (Fallback)
When no LLM provider is configured or if the provider is unavailable:
- Simulated responses based on agent configuration
- Uses agent's `responseStyle` and `skills` to generate contextually appropriate responses
- Useful for UI testing and demonstrations
- Automatically activated when LLM provider is unreachable

### 3. Personality Styles

Agents support four personality styles that influence both real API responses and mock response generation:

#### **Concise**
- Short, direct responses
- Example: "Got it. Here's what I found..."
- Best for: Factual queries, time-sensitive interactions

#### **Friendly**
- Warm, conversational tone (default)
- Example: "Great question! I'd be happy to help..."
- Best for: General interactions, first-time users

#### **Technical**
- Structured, detailed explanations
- Example: "Analyzing your input... From a technical perspective..."
- Best for: Complex queries, expert users

#### **Teacher**
- Step-by-step, educational approach
- Example: "That's a great question! Let me explain this step by step..."
- Best for: Learning scenarios, onboarding

### 4. Conversation Persistence

#### Session-Level Storage
- Conversations are automatically saved to `sessionStorage` during the current browser session
- Storage key: `cabp_sandbox_{agentId}`
- Persists across page refreshes within the same session
- Conversation data includes:
  - Message history (user and agent messages)
  - Conversation ID (for multi-turn tracking)
  - Timestamps for each message

#### Clearing Conversations
- Click the "Clear Conversation" button to start fresh
- Removes the agent's conversation from session storage
- Does not affect other agent conversations

### 5. Rate Limiting
- Minimum interval between messages: **1 second** (1000ms)
- Prevents accidental rapid-fire messaging
- Displays warning in console if limit is exceeded
- Protects both the UI and backend from overload

## How to Use

### Accessing the Sandbox

1. **From Agent List**
   - Navigate to the "Agents" page
   - Click "Test" button on any agent card
   - Sandbox page loads for that agent

2. **Direct URL**
   - Go to: `/agents/{agentId}/sandbox`
   - Replace `{agentId}` with the agent's unique ID

### Testing an Agent

#### Step 1: View Agent Information
- Agent name, description, and avatar appear at the top
- Skills and roles badges show agent capabilities
- Response style indicator shows the configured personality

#### Step 2: Send a Message
1. Click in the message composer at the bottom
2. Type your test message
3. Press Enter or click Send
4. Wait for the response (or see mock response in demo mode)

#### Step 3: Review Responses
- User messages appear on the right (blue background)
- Agent responses appear on the left (gray background)
- Each message includes a timestamp
- Real API responses show the model name (e.g., "Ollama - neural-chat")

#### Step 4: Clear and Reset
- Click "Clear Conversation" to start over
- This removes the conversation from session storage
- Agent is ready for a fresh test

### Advanced Usage

#### Testing Different Personality Styles
1. Edit the agent configuration
2. Change the `responseStyle` field
3. Return to sandbox
4. Send new messages to test the personality change

#### Testing with Skills and Roles
- Agents with skills will reference relevant expertise in responses
- Mock responses incorporate skill context when available
- Example: "Drawing on my Python expertise..."

#### Testing Multi-Turn Conversations
- Send multiple messages in sequence
- Conversation ID is maintained automatically
- The agent's context from previous messages is available
- Useful for testing stateful agent behaviors

#### Switching Between LLM and Mock Modes
- In LLM mode: Real provider responses
- If provider becomes unavailable: Automatically switches to mock mode with info banner
- Toggle manually by checking agent configuration

## Technical Details

### Storage Implementation
- **Type**: Browser `sessionStorage` (client-side only)
- **Key Format**: `cabp_sandbox_{agentId}`
- **Data Structure**:
  ```json
  {
    "messages": [
      { "id": 1234567890, "role": "user", "content": "...", "timestamp": "10:30 AM" },
      { "id": 1234567891, "role": "agent", "content": "...", "timestamp": "10:30 AM", "model": "Ollama - neural-chat" }
    ],
    "conversationId": "conv_abc123xyz"
  }
  ```

### Message Structure
- **User Messages**: `role: 'user'`, `timestamp`, `content`
- **Agent Messages**: `role: 'agent'`, `timestamp`, `content`, optional `model` field
- Each message has a unique `id` (typically Unix timestamp)

### Response Style Processing
Mock response generation algorithm:
1. Reads agent's `responseStyle` field
2. Maps style to appropriate response templates
3. Selects random template from style collection
4. Appends skill context (if available)
5. Appends role signature (if available)

### Rate Limiting Logic
```
currentTime - lastMessageTime < 1000ms → Message blocked, warning logged
currentTime - lastMessageTime ≥ 1000ms → Message allowed, lastMessageTime updated
```

## Configuration

### Environment Variables
The sandbox uses the same API configuration as the main application:
- `VITE_API_BASE`: Base URL for API calls (default: `http://100.81.83.98:5000/api` on Tailscale, `http://localhost:5000/api` locally)

### Component Files
- **Main Component**: `client/src/pages/AgentSandboxPage.jsx` (535 lines)
- **Message Display**: `client/src/components/sandbox/ChatMessage.jsx`
- **Message Input**: `client/src/components/sandbox/MessageComposer.jsx`

## Troubleshooting

### "AI provider not configured" Message
- **Cause**: LLM provider (Ollama, OpenAI, etc.) is not set up
- **Solution**: Configure LLM provider in agent settings, OR continue using demo mode

### Conversation Not Persisting
- **Cause**: Browser's `sessionStorage` is disabled or full
- **Solution**: Check browser privacy settings, clear old sessions

### Messages Not Sending
- **Cause**: Rate limiting (sent >1 message within 1 second)
- **Solution**: Wait 1 second between messages

### Agent Not Loading
- **Cause**: Invalid agent ID or permission issues
- **Solution**: Verify agent ID in URL, ensure logged-in user has access

## Best Practices

1. **Before Production Deployment**
   - Test agent with various conversation styles
   - Verify personality style matches intended use case
   - Test edge cases and complex queries

2. **During Development**
   - Use mock mode for rapid UI/UX testing
   - Switch to real LLM mode for accuracy validation
   - Persist conversations across sessions to review patterns

3. **Documentation and Notes**
   - Screenshot useful responses for documentation
   - Save conversation examples for onboarding
   - Note any model-specific quirks or improvements needed

## Future Enhancements

Potential features for the Agent Sandbox:

- **Conversation Export**: Download transcripts as JSON, PDF, or Markdown
- **Response Evaluation**: Rate responses (thumbs up/down, scoring)
- **Prompt Templates**: Save and reuse common test prompts
- **Batch Testing**: Send multiple pre-written prompts automatically
- **Response Comparison**: Test multiple agents or LLM providers side-by-side
- **History Export**: Bulk export of all conversations for analysis
- **Analytics**: Track conversation metrics (message count, response times, etc.)

## Related Documentation

- **Architecture**: See `ARCHITECTURE.md` for system design
- **E2E Testing**: See `TESTING.md` for Playwright test configuration
- **Deployment**: See `.github/workflows/e2e.yml` for CI/CD setup

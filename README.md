# FixIt Bot — Simple System Design

> 2-hour hackathon build · text input only · minimal viable product

---

## Overview

### FRONTEND — React Chat UI

Simple text input → send button → message list. That's it.

`React or plain HTML/JS`

↓

### BACKEND — API Server

One endpoint: receives user message, calls Claude API, returns response.

`FastAPI (Python) or Express (Node)`

↓

### AI — Claude API

System prompt turns Claude into a handyman expert. Diagnoses issues, gives DIY steps, estimates costs.

`Claude Sonnet · tool use for structured output`

> **That's it. 3 pieces. User types → backend calls Claude → response appears.**

---

## How It Works

### Request Lifecycle

1. **User types** — `"My kitchen faucet is dripping"`
2. **Frontend sends POST** — `/api/chat → { message, history }`
3. **Backend calls Claude** — `System prompt + conversation history + user message`
4. **Claude responds** — `Diagnosis, severity, DIY steps, cost estimate`
5. **Response displayed** — `Formatted message appears in chat`

### The Secret Sauce: System Prompt

The system prompt is what makes Claude act as a handyman expert. It tells Claude to:

- ✓ Diagnose the issue (category + severity)
- ✓ Give DIY repair steps if it's safe
- ✓ Estimate cost (DIY vs professional)
- ✓ Recommend a pro for anything dangerous
- ✓ Always prioritize safety warnings

### Example Conversation

**User:**
> My kitchen faucet won't stop dripping. It's a single-handle type.

**FixIt Bot:**
```
🔍 Issue: Dripping single-handle faucet
⚠️ Severity: Minor
🛠️ Category: Plumbing

💡 Most likely a worn cartridge or O-ring. Here's the fix:
1. Turn off water supply under the sink
2. Remove handle (Allen key or Phillips screw)
3. Pull out the cartridge
4. Replace O-rings or full cartridge ($8-15 at hardware store)
5. Reassemble and test

💰 DIY: $8–15 · Pro: $75–150
⏱️ Time: ~30 minutes
```

---

## Build Plan

### 2-Hour Timeline

| Time | Task | Details |
|------|------|---------|
| **0:00–0:30** | Setup & API test | Create project, install deps, verify Claude API key works with a test call |
| **0:30–1:00** | Backend endpoint | Single POST `/api/chat` route — takes message + history, calls Claude, returns response |
| **1:00–1:30** | Chat UI | Text input, send button, message list, auto-scroll. Keep it simple. |
| **1:30–2:00** | Polish & demo prep | Write system prompt, test 3 scenarios, fix any bugs |

### You Only Need 3 Files

```
📄 server.py    — FastAPI backend, one /chat endpoint
📄 index.html   — Chat UI (or App.jsx if using React)
📄 .env         — ANTHROPIC_API_KEY=sk-ant-...
```

### Skip For Now (Add Later)

- ✗ Image upload / vision — cool but adds complexity
- ✗ Database — Claude's knowledge is enough for the demo
- ✗ RAG / vector search — not needed in 2 hours
- ✗ Auth / user accounts — unnecessary for hackathon
- ✗ Booking / scheduling — mock it in the system prompt

### Demo Tip

> Prepare 3 prompts: a simple fix (leaky faucet), a safety scenario (electrical spark), and a follow-up question ("how long will that take?"). Shows range + conversation memory.

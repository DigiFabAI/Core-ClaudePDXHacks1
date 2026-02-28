# FixIt Bot — Simple System Design

> 2-hour hackathon build · text + photo input · minimal viable product

---

## Overview

### Frontend — React Chat UI

Text input, photo upload button, send button, message list. Users can type a description, snap a photo of the problem, or both. Image preview shows before sending.

**Tech:** React or plain HTML/JS · `<input type="file" accept="image/*" capture="environment">` for camera/gallery

### Backend — API Server

One endpoint: receives user message (text, image, or both), calls Claude API, returns response. Images are sent as base64-encoded data.

**Tech:** FastAPI (Python) or Express (Node)

### AI — Claude API

System prompt turns Claude into a handyman expert. Diagnoses issues, gives DIY steps, estimates costs. Claude's vision capability lets it analyze photos of damage, identify parts, and assess severity visually.

**Tech:** Claude Sonnet · vision + tool use for structured output

> **That's it. 3 pieces. User types or snaps a photo → backend calls Claude → response appears.**

---

## How It Works

### Request Lifecycle

1. **User types or uploads a photo** — "My kitchen faucet is dripping" or snaps a photo of the problem
2. **Frontend sends POST** — `/api/chat` → `{ message, history, image? }` (image as base64 if provided)
3. **Backend calls Claude** — System prompt + conversation history + user message (text and/or image content blocks)
4. **Claude responds** — Diagnosis, severity, DIY steps, cost estimate. References what it sees in the photo if one was provided.
5. **Response displayed** — Formatted message appears in chat

### The Secret Sauce: System Prompt

The system prompt is what makes Claude act as a handyman expert. It tells Claude to:

- Analyze uploaded photos to identify visible damage, parts, or issues
- Diagnose the issue (category + severity)
- Give DIY repair steps if it's safe
- Estimate cost (DIY vs professional)
- Recommend a pro for anything dangerous
- Always prioritize safety warnings

### Example Conversation

**User:**
> My kitchen faucet won't stop dripping. It's a single-handle type.

**FixIt Bot:**
```
Issue: Dripping single-handle faucet
Severity: Minor
Category: Plumbing

Most likely a worn cartridge or O-ring. Here's the fix:
1. Turn off water supply under the sink
2. Remove handle (Allen key or Phillips screw)
3. Pull out the cartridge
4. Replace O-rings or full cartridge ($8-15 at hardware store)
5. Reassemble and test

DIY: $8–15 · Pro: $75–150
Time: ~30 minutes
```

**User (with photo):**
> [Uploads photo of water-stained ceiling] "I noticed this today — is this serious?"

**FixIt Bot:**
```
Issue: Water damage / ceiling leak
Severity: Moderate–High
Category: Plumbing / Water Damage

I can see brownish water staining on your ceiling with some bubbling paint.
This indicates an active or recent leak from above — likely a pipe, bathroom,
or roof issue.

Immediate steps:
1. Check the room directly above for leaks (toilet, shower, sink)
2. Place a bucket underneath if still dripping
3. Do NOT poke the bubbling area — it may release trapped water

If from plumbing above:
- Turn off water to the fixture
- DIY fix depends on source (could be a supply line or drain)

If from the roof:
- Check attic for daylight or wet spots
- Temporary tarp if accessible

DIY: $20–80 (if simple supply line) · Pro: $150–500+
Time: Varies — find the source first

⚠️ Address this quickly. Prolonged moisture leads to mold and structural damage.
```

---

## Build Plan

### 2-Hour Timeline

| Time | Task | Details |
|------|------|---------|
| 0:00–0:30 | Setup & API test | Create project, install deps, verify API key works with a test call |
| 0:30–1:00 | Backend endpoint | Single POST `/api/chat` route — takes message + history, calls Claude, returns response |
| 1:00–1:30 | Chat UI | Text input, photo upload button, send button, message list, image preview, auto-scroll |
| 1:30–2:00 | Polish & demo prep | Write system prompt, test 3 scenarios, fix any bugs |

### You Only Need 3 Files

```
server.py      — FastAPI backend, one /chat endpoint
index.html     — Chat UI (or App.jsx if using React)
.env           — Your API key (keep this secret, add to .gitignore)
```

### Skip For Now (Add Later)

- Database — Claude's knowledge is enough for the demo
- RAG / vector search — not needed in 2 hours
- Auth / user accounts — unnecessary for hackathon
- Booking / scheduling — mock it in the system prompt

### Demo Tip

Prepare 3 prompts: a simple fix (leaky faucet), a photo demo (snap a picture of water damage or a cracked wall), and a safety scenario (electrical spark). Shows text + vision + conversation memory.

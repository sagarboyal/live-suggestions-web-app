# Live Suggestions App

> A full-stack real-time meeting assistant that captures microphone input, transcribes speech in chunks, surfaces contextual suggestion cards, and powers a follow-up chat — all in your browser.

[![React](https://img.shields.io/badge/React-TypeScript-61dafb?style=flat-square&logo=react)](https://reactjs.org)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot-4-6db33f?style=flat-square&logo=spring)](https://spring.io/projects/spring-boot)
[![Java](https://img.shields.io/badge/Java-21-f89820?style=flat-square&logo=openjdk)](https://openjdk.org/projects/jdk/21/)
[![Groq](https://img.shields.io/badge/AI-Groq_API-f97316?style=flat-square)](https://groq.com)

---

## Features

| Feature | Description |
|---|---|
| 🎙️ **Chunked mic capture** | Audio is sliced into timed segments and gated on the frontend — silent chunks never reach the API. |
| 📝 **Live transcript stream** | Transcribed speech appears in real time. Very short accidental fragments are automatically discarded. |
| 💡 **Context-aware suggestions** | Suggestion cards refresh on every new speech event, driven by recent transcript context rather than a fixed timer. |
| 💬 **Follow-up chat panel** | Ask questions about anything said so far. The chat has full access to the running transcript. |
| 📦 **Session export** | Download the entire session — transcript, suggestions, and chat — as a single JSON file. |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Create React App, Axios |
| Backend | Spring Boot 4, Java 21, Maven 3.9+ |
| AI provider | Groq API |

---

## Project Structure

```text
live-suggestions-app/
├── frontend/                   # React + TypeScript client
│   ├── src/
│   │   ├── hooks/              # useMicRecorder, useTranscript, …
│   │   ├── services/           # api.ts — Axios wrapper (env-driven API base URL)
│   │   └── components/         # UI panels, suggestion cards, chat
│   └── .env                    # REACT_APP_API_BASE_URL, REACT_APP_CHUNK_INTERVAL_MS
│
└── backend/                    # Spring Boot 4 REST API
    ├── src/main/
    │   ├── java/               # controllers, services, config
    │   └── resources/
    │       └── application.yaml
    ├── .env                    # GROQ_API_KEY (local only — do not commit)
    └── mvnw.cmd                # Maven wrapper
```

---

## Prerequisites

Install the following before running the project:

- **Node.js 18+** and npm
- **Java 21**
- **Maven 3.9+** — or use the included Maven wrapper (`mvnw.cmd`)
- A **Groq API key** — obtain one at [console.groq.com](https://console.groq.com)

---

## Environment Setup

### Backend

The backend expects a `GROQ_API_KEY` environment variable, which `application.yaml` reads as:

```yaml
groq:
  api:
    key: ${GROQ_API_KEY}
```

Create `backend/.env` for local development (**do not commit this file**):

```env
GROQ_API_KEY=your_groq_api_key_here
```

If your IDE or shell does not load `.env` automatically, set the variable manually before starting the server:

```powershell
# PowerShell
$env:GROQ_API_KEY = "your_groq_api_key_here"
```

```bash
# bash / zsh
export GROQ_API_KEY="your_groq_api_key_here"
```

### Frontend

The frontend supports these environment variables:

```env
# Backend API base URL. Default fallback in code: http://localhost:8080
REACT_APP_API_BASE_URL=http://localhost:8080

# Controls how often microphone audio is chunked (milliseconds). Default fallback in code: 5000
REACT_APP_CHUNK_INTERVAL_MS=5000
```

For deployment, set `REACT_APP_API_BASE_URL` to your hosted backend URL before building the frontend.

Example:

```env
REACT_APP_API_BASE_URL=https://your-backend-domain.com
```

To fine-tune silence filtering, edit the thresholds in `frontend/src/hooks/useMicRecorder.ts` directly.

---

## Running Locally

Start the **backend first**, then the frontend in a separate terminal.

### 1. Start the backend

```powershell
cd backend
.\mvnw.cmd spring-boot:run
```

The REST API starts on **http://localhost:8080**. Ensure `GROQ_API_KEY` is set before this step — the server will not start without it.

### 2. Start the frontend

```powershell
cd frontend
npm install
npm start
```

The app is available at **http://localhost:3000**. Allow microphone access when prompted by the browser.

---

## Building for Production

```powershell
# Frontend — outputs a production bundle to frontend/build/
cd frontend
npm run build

# Backend — compile, run tests, and package
cd backend
.\mvnw.cmd test
```

---

## API Reference

All endpoints are served from the frontend-configured API base URL. In local development, that is usually `http://localhost:8080`.

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/transcribe` | Accepts an audio chunk as multipart form data. Returns the transcribed text segment, or an empty response for silent input. |
| `POST` | `/api/suggestions` | Generates suggestion cards from a supplied transcript string. Called automatically when new speech is appended. |
| `POST` | `/api/chat` | Answers a follow-up question using the full transcript as context. Powers the chat panel. |

---

## Troubleshooting

### Microphone is on but the transcript does not update

- Check browser microphone permissions for `localhost:3000`.
- Confirm the correct input device is selected in system settings.
- Try speaking louder or closer to the microphone.
- If speech is filtered too aggressively, lower `REACT_APP_CHUNK_INTERVAL_MS` or relax the silence thresholds in `frontend/src/hooks/useMicRecorder.ts`.

### Random or unexpected speech appears in the transcript

- Use **headphones** to prevent speaker audio from feeding back into the microphone.
- Verify the system input is a real microphone, not loopback audio.
- Close background tabs or apps that are playing audio.

### Backend fails on startup

- Verify `GROQ_API_KEY` is exported in the shell before running `mvnw.cmd spring-boot:run`.
- Check that `backend/.env` exists if your IDE loads env files automatically.

---

## Development Notes

- **API base URL**: The frontend reads `REACT_APP_API_BASE_URL`, with a fallback to `http://localhost:8080` in `frontend/src/services/api.ts`.
- **Suggestion timing**: Cards refresh on new speech — not on a fixed interval — keeping API usage proportional to actual conversation activity.
- **Frontend audio gating**: Silent and low-signal chunks are filtered before any transcription request is sent, reducing unnecessary backend calls.
- **Fragment filtering**: Very short transcript segments are discarded after transcription to prevent noise artifacts from polluting the context.
- **Separate processes**: The frontend and backend run as independent dev servers. There is no CRA proxy — both must be running simultaneously.

---

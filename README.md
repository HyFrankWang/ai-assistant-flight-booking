# Flight Booking AI Assistant

A modern AI-powered flight booking assistant using **React + TypeScript** frontend and **Python + LangChain** backend with configurable LLM provider.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              Frontend (React + TypeScript)                       │
│  ┌───────────────────────────────────────────────────────────────────────────┐  │
│  │                        App.tsx (Main Layout)                              │  │
│  │  ┌────────────────────────┐  ┌────────────────────────────────────────┐  │  │
│  │  │   ChatInterface        │  │   BookingGrid                          │  │  │
│  │  │   - Streaming chat     │  │   - Booking display                    │  │  │
│  │  │   - User messages      │  │   - Status indicators                 │  │  │
│  │  └────────────────────────┘  └────────────────────────────────────────┘  │  │
│  │                         ┌────────────────────────┐                       │  │
│  │                         │   SeatSelector         │                       │  │
│  │                         │   - Visual seat map    │                       │  │
│  │                         │   - Seat selection     │                       │  │
│  │                         └────────────────────────┘                       │  │
│  └───────────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────────┘
                                    │
                              REST API (HTTP)
                                    │
┌─────────────────────────────────────────────────────────────────────────────────┐
│                          Backend (Python + FastAPI)                             │
│  ┌───────────────────────────────────────────────────────────────────────────┐  │
│  │                            main.py                                        │  │
│  │  ┌────────────────────────────────────────────────────────────────────┐  │  │
│  │  │  Endpoints:                                                         │  │  │
│  │  │  - GET  /api/bookings           → List all bookings               │  │  │
│  │  │  - POST /api/bookings/change    → Change booking                  │  │  │
│  │  │  - POST /api/bookings/cancel    → Cancel booking                  │  │  │
│  │  │  - POST /api/chat/stream        → AI chat streaming               │  │  │
│  │  └────────────────────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────────────────────┘  │
│                                    │
│  ┌───────────────────────────────┐  ┌──────────────────────────────────────────┐ │
│  │   chat_service.py             │  │   booking_service.py                     │ │
│  │   - LangChain create_agent    │  │   - Booking CRUD operations              │ │
│  │   - init_chat_model           │  │   - Business rules validation            │ │
│  │   - RAG tool integration      │  │   - In-memory database                   │ │
│  │   - Streaming responses       │  │   - JSON file persistence                │ │
│  └───────────────────────────────┘  └──────────────────────────────────────────┘ │
│                                                                                 │
│  ┌───────────────────────────────┐  ┌──────────────────────────────────────────┐ │
│  │   tools.py                    │  │   rag_service.py                         │ │
│  │   - @Tool decorated functions │  │   - FAISS vector store                   │ │
│  │   - get_booking_details()     │  │   - Terms of service RAG                 │ │
│  │   - change_booking()          │  │   - OpenAI embeddings                    │ │
│  │   - cancel_booking()          │  │   - Semantic search                      │ │
│  │   - search_rag_policy()       │  │                                          │ │
│  └───────────────────────────────┘  └──────────────────────────────────────────┘ │
│                                                                                 │
│  ┌───────────────────────────────┐  ┌──────────────────────────────────────────┐ │
│  │   config.py                   │  │   models.py                              │ │
│  │   - Unified LLM config        │  │   - Pydantic data models                 │ │
│  │   - get_llm_config()          │  │   - Request/response schemas             │ │
│  │   - Environment variables     │  │                                          │ │
│  └───────────────────────────────┘  └──────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## Project Structure

```
ai-assistant-flight-booking/
├── backend/
│   ├── config.py              # Unified LLM settings and environment configuration
│   ├── models.py              # Pydantic data models
│   ├── booking_service.py     # Booking business logic
│   ├── tools.py               # LangChain tool definitions
│   ├── rag_service.py         # RAG/FAISS integration
│   ├── chat_service.py        # AI chat orchestration
│   ├── main.py                # FastAPI application entry point
│   ├── requirements.txt       # Python dependencies
│   ├── terms_of_service.txt   # RAG knowledge base
│   └── .env                   # Environment variables
│
├── frontend/
│   ├── src/
│   │   ├── main.tsx           # React entry point
│   │   ├── App.tsx            # Main application component
│   │   ├── App.css            # Global styles
│   │   ├── types/
│   │   │   └── index.ts       # TypeScript type definitions
│   │   ├── services/
│   │   │   └── api.ts         # API client service
│   │   └── components/
│   │       ├── index.ts       # Component exports
│   │       ├── ChatInterface.tsx/css
│   │       ├── BookingGrid.tsx/css
│   │       └── SeatSelector.tsx/css
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   ├── tsconfig.node.json
│   └── vite.config.ts
│
└── README.md
```

## Features

### AI Agent Capabilities
- **Natural Language Chat**: Conversational interface for customer support
- **LangChain Agent**: Function calling via `create_agent` framework
- **RAG (Retrieval Augmented Generation)**: Policy questions answered from knowledge base
- **Streaming Responses**: Real-time AI response streaming
- **Configurable LLM**: Switch between OpenAI, Anthropic, Google via config

### Booking Operations
- View all bookings
- Get booking details
- Change booking (date, route)
- Cancel booking
- Change seat selection

### UI Components
- **Chat Interface**: Modern chat UI with streaming support
- **Booking Grid**: Tabular display of all bookings
- **Seat Selector**: Interactive visual seat map

## Getting Started

### Prerequisites

- **Backend**: Python 3.10+, pip
- **Frontend**: Node.js 18+, npm

### 1. Setup Backend

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env  # Edit .env with your settings

# Start the server
python main.py
```

Backend will run at: `http://localhost:8000`

### 2. Setup Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend will run at: `http://localhost:3000`

## API Endpoints

### Booking API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/bookings` | Get all bookings |
| GET | `/api/bookings/{id}` | Get booking details |
| POST | `/api/bookings/change` | Change booking |
| POST | `/api/bookings/cancel` | Cancel booking |
| POST | `/api/bookings/{id}/seat` | Change seat |

### Chat API

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/chat/stream` | AI chat with streaming |

### Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |

## LLM Provider Configuration

### Environment Variables (.env)

```env
# LLM Configuration (unified across providers)
LLM_PROVIDER=openai          # openai, anthropic, google, bedrock, azure
LLM_MODEL=gpt-4o             # Model name varies by provider
LLM_API_KEY=sk-your-api-key  # Provider API key
LLM_BASE_URL=https://api.openai.com/v1  # Optional: custom endpoint

# Application
DEBUG=true
```

### Supported Providers

| Provider | `LLM_PROVIDER` | `LLM_MODEL` Example | Required Package |
|----------|----------------|---------------------|------------------|
| OpenAI | `openai` | `gpt-4o`, `gpt-4o-mini` | `langchain-openai` |
| Anthropic | `anthropic` | `claude-3-5-sonnet-20241022` | `langchain-anthropic` |
| Google | `google` | `gemini-2.0-flash-exp` | `langchain-google-*` |
| AWS Bedrock | `bedrock` | `anthropic.claude-3-5-sonnet-20241022-v1:0` | `langchain-aws` |
| Azure | `azure` | `gpt-4o` | `langchain-azure` |

### Switching Providers (No Code Change)

```bash
# OpenAI (default)
export LLM_PROVIDER=openai
export LLM_MODEL=gpt-4o
export LLM_API_KEY=sk-xxx
export LLM_BASE_URL=https://api.openai.com/v1

# Anthropic
export LLM_PROVIDER=anthropic
export LLM_MODEL=claude-3-5-sonnet-20241022
export LLM_API_KEY=sk-ant-api-xxx

# Google VertexAI
export LLM_PROVIDER=google
export LLM_MODEL=gemini-2.0-flash-exp
export LLM_API_KEY=xxx
```

## RAG System

The AI agent uses Retrieval-Augmented Generation to answer policy questions:

1. **Document Loading**: `terms_of_service.txt` loaded via `TextLoader`
2. **Text Splitting**: Documents chunked with `RecursiveCharacterTextSplitter` (1000 chars, 200 overlap)
3. **Embedding**: `OpenAIEmbeddings` creates vector representations
4. **Vector Store**: `FAISS` stores and indexes embeddings locally
5. **Retrieval**: `as_retriever()` enables similarity search
6. **Tool Integration**: `search_rag_policy` tool exposes RAG to agent

### Query Flow

```
User: "What is the baggage policy?"
     ↓
Agent decides: "Use search_rag_policy"
     ↓
Tool invokes: retriever.invoke("baggage policy")
     ↓
FAISS: Similarity search returns relevant chunks
     ↓
Tool returns: Policy context to agent
     ↓
Agent generates: Natural language answer
```

## Demo Data

The application loads 5 demo bookings on startup:

| Booking # | Customer | Route | Class |
|-----------|----------|-------|-------|
| 101 | John Doe | LAX → JFK | Economy |
| 102 | Jane Smith | SFO → LHR | Premium |
| 103 | Michael Johnson | JFK → CDG | Business |
| 104 | Sarah Williams | ARN → HEL | Economy |
| 105 | Robert Taylor | MUC → FRA | Premium |

## Technology Stack

### Backend
- **FastAPI**: Modern Python web framework
- **LangChain 1.x**: AI agent framework with `create_agent`
- **FAISS**: Local vector store for RAG
- **Pydantic**: Data validation
- **OpenAI SDK**: LLM integration via `init_chat_model`

### Frontend
- **React 18**: UI library
- **TypeScript**: Type-safe JavaScript
- **Vite**: Build tool
- **CSS Modules**: Component styling

## Acknowledgments

This project is based on the [playground-flight-booking](https://github.com/tzolov/playground-flight-booking) repository by [tzolov](https://github.com/tzolov).

Special thanks to the original author for providing the inspiration and foundation for this AI-powered flight booking assistant.

## Comparison with Original

| Aspect | Original (Java/Vaadin) | New (React/FastAPI) |
|--------|------------------------|---------------------|
| Frontend | Vaadin Flow | React + TypeScript |
| Backend | Spring Boot | FastAPI |
| AI Framework | Spring AI | LangChain |
| Vector Store | Chroma | FAISS (local) |
| LLM Integration | Hardcoded | Configurable via env |
| Language | Java | Python |
| Build Tool | Maven | pip/npm |
| UI Components | Server-side | Client-side |

## Key Differences

1. **LLM Provider**: Configurable via environment variables, no code changes needed
2. **Frontend**: React provides more modern, responsive UI
3. **Backend**: FastAPI is lighter and faster than Spring Boot
4. **AI**: LangChain with `create_agent` offers flexible tool calling
5. **RAG**: FAISS provides local vector storage without external services
6. **Configuration**: Unified `LLM_*` variables replace provider-specific settings

## License

MIT

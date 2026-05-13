# 🚀 Lumina Project Roadmap
------------------------------------------------

## Phase 1: Infrastructure & Core Setup ✅
- [x] Set up Supabase Project & Auth
- [x] Provision AWS S3 Bucket via Terraform
- [x] Configure AWS CLI & Local Environment
- [x] Project Folder Structure & Git Setup

-------------------------------------------------

## Phase 2: Backend Development & Database 🛠️
- [x] Create FastAPI PDF Upload Endpoint
- [x] Integrate Boto3 for S3 File Transfer
- [x] Connect FastAPI to Supabase (Database & Auth Secret) 
- [x] Create `documents` table with `user_id` foreign keys
- [ ] Implement FastAPI JWT Dependency for Auth Guarding - using mockuserid for now - will do when react frontend is done
- [x] Implement PDF text extraction logic (PyMuPDF)


------------------------------------------------
## Phase 3: AI Logic & Interactive PDF Engine 🧠

### 1. Foundation & API Setup
- [x] Enable pgvector and create tables/RPC in Supabase (1536 dim)
- [x] Install google-genai, openai, and langchain-text-splitters
- [x] Add GEMINI_API_KEY and OPENAI_API_KEY to .env

### 2. Path B: Precision RAG & Citations
- [x] Implement page-anchored chunking to prevent page-crossing.
- [x] Create embedding_utils.py for OpenAI text-embedding-3-small.
- [x] Sync upload flow: Extract -> Chunk -> Embed -> DB Store.

### 3. Path A: Study Tools (Gemini 3.1 Flash Lite)
- [x] Create Mega-Prompt for Summary and 10-Question Quiz. (Summary should summarize the main points and the quizzes should test user knowledge across the whole PDF using multiple choice questions)
- [x] Create Manual-Prompt for 10 Flashcards. (These flashcards contain the most likely questions that can get asked on the PDF and their given respective answers Q:A)
- [x] Build /process-document and /generate-cards endpoints.

### 4. Interactive Q&A & Dictionary Logic
- [x] Build /ask endpoint using Supabase RPC for retrieval.
- [x] Refine Q&A prompt to return Answer + Page Number + Snippet.
- [x] Add backend helper for Free Dictionary API proxy (GET /dictionary/{word}).
- [x] Standardize JSON payload for frontend PDF "jump-to-page" sync.
- [x] Add search_chunks() to db_utils.py to call match_documents RPC.
- [x] Add generate_answer() to gemini_utils.py with grounded citation prompt.
- [x] Handle graceful 404 when no relevant chunks found for a question.

-------------------------------------------------


## Phase 4: Frontend & UI 🎨
- [ ] Basic React/Next.js dashboard
- [ ] File upload drag-and-drop component
- [ ] Real-time summary display

-------------------------------------------------

## Phase 5: Production & Polish 🛡️

### Infrastructure & Deployment
- [ ] Containerize backend using Docker
- [ ] Deploy backend to AWS ECS (Fargate) via Terraform
- [ ] Deploy frontend to Vercel (auto-deploy from GitHub main branch)
- [ ] Configure environment variables in ECS task definition and Vercel project settings

### CI/CD
- [ ] Setup GitHub Actions pipeline — lint, test, build Docker image on PR
- [ ] Auto-deploy to ECS on merge to main via GitHub Actions

### Security & Auth
- [ ] Implement FastAPI JWT dependency for auth guarding (replace MOCK_USER_ID)
- [ ] Configure strict CORS policy — whitelist Vercel frontend domain only
- [ ] Enable Supabase RLS policies for all tables (documents, document_chunks, profiles)
- [ ] Rotate all API keys and move secrets to AWS Secrets Manager

### Reliability
- [ ] Add structured application logging (replace print statements with Python logging)
- [ ] Integrate error tracking (e.g. Sentry) for both frontend and backend
- [ ] Implement rate limiting on all endpoints (prevent API spam/abuse)
- [ ] Add request timeout handling for Gemini and OpenAI calls

### Performance
- [ ] Tune RAG retrieval — test match_threshold and match_count against real queries
- [ ] Add HNSW index to document_chunks.embedding for faster similarity search at scale
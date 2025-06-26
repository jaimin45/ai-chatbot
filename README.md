# 📄 AI Chatbot - Document Q&A Feature

This project extends the [Vercel AI Chatbot](https://github.com/vercel/ai-chatbot) by adding a **Document Q&A** mode.  
Users can upload `.txt` documents, ask questions about them, and get AI-generated answers with source references.

---

## Demo Video link [AI Chatbot - Document Q&A](https://drive.google.com/file/d/1d5ksBIJfAdsjMxQd6fgxI_tDgCdU8Mx4/view?usp=sharing)

## ✅ Features Implemented

| Feature                                      |
| -------------------------------------------- |
| Upload `.txt` files for Q&A                  |
| Document chunking (800-char chunks)          |
| Embedding generation (OpenAI API)            |
| SQLite database to store chunks + embeddings |
| Cosine similarity search for top-K chunks    |
| AI answer generation with source citations   |
| Handling unknown questions gracefully        |
| File upload progress + toast notifications   |
| Document list API `/api/documents`                |
| Delete document API `/api/documents`              |
| Frontend UI for Document Q&A mode            |

---


## ✅ Technologies Used

- **Next.js 15 with Turbopack**
- **TypeScript**
- **SQLite (better-sqlite3)** for storage
- **OpenAI API** for embeddings & Chat
- **Tailwind CSS** (from original ai-chatbot template)
- **Lucide React Icons** for file upload icon
- **React Hooks** for frontend state management

## 🧑‍💻 Local Setup Instructions

## ✅ How to Run Locally

```bash
# 1. Clone repo
git clone https://github.com/yourusername/ai-chatbot-document-qa.git
cd ai-chatbot-document-qa

# 2. Install dependencies
npm install

# 3. Create .env file
cp .env.example .env

```
✅ Directory Structure
```
├─ app/
│   ├─ api/
│   │   ├─ upload-doc/          # File Upload API (TXT)
│   │   ├─ docs/                # GET (list) & DELETE (by title) APIs
│   │   └─ docs-qa/             # Main AI Question Answering API
│
├─ lib/
│   ├─ db.ts                    # SQLite DB setup
│   ├─ chunking.ts              # Text chunking logic
│   └─ embedding.ts             # Embedding & similarity utils
│
├─ components/
│   └─ DocumentQA.tsx           # Frontend Document Q&A UI
│
├─ data/                        # Optional: Preloaded txt files
└─ .env.example                 # Environment vars
```

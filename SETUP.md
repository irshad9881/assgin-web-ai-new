# Marketing Search Tool - Setup Guide

## Prerequisites

- Node.js (v18 or higher)
- MongoDB (v5.0 or higher)
- Google Gemini API key

## Installation Steps

### 1. Clone and Setup

```bash
cd marketing-search-tool
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create `.env` file:
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/marketing-search
GEMINI_API_KEY=your_gemini_api_key_here
NODE_ENV=development
UPLOAD_DIR=uploads
MAX_FILE_SIZE=10485760
CORS_ORIGIN=http://localhost:3001
```

### 3. Frontend Setup

```bash
cd ../frontend
npm install
```

Create `.env` file:
```bash
cp .env.example .env
```

### 4. Database Setup

Start MongoDB:
```bash
# Windows
net start MongoDB

# macOS/Linux
sudo systemctl start mongod
```

### 5. Start Development Servers

Backend (Terminal 1):
```bash
cd backend
npm run dev
```

Frontend (Terminal 2):
```bash
cd frontend
npm run dev
```

## API Endpoints

### Documents
- `POST /api/documents/upload` - Upload document
- `GET /api/documents/search` - Search documents
- `GET /api/documents/:id` - Get document details
- `GET /api/documents/meta/categories` - Get categories
- `GET /api/documents/file/:id` - Download file

### Health Check
- `GET /health` - Server health status

## Features Implemented

✅ **Smart Document Indexing**
- Automatic content extraction from PDF, DOCX, XLSX, PPTX, TXT, images
- AI-powered embedding generation using Gemini API
- Automatic categorization and tagging

✅ **AI-Powered Search**
- Semantic search using vector similarity
- Query enhancement with AI
- Combined text and semantic search results
- Relevance scoring and ranking

✅ **Automatic Categorization**
- 8 predefined categories: campaign, brand, social-media, email, content, analytics, strategy, creative
- Team and project organization
- Tag extraction from content and filenames

✅ **File Preview & Access**
- Direct file preview in browser
- Download functionality
- File metadata display
- Search result previews

✅ **Clean UI**
- Modern React interface with Tailwind CSS
- Responsive design
- Drag-and-drop file upload
- Advanced filtering options
- Real-time search results

## Architecture

### Backend (Node.js + Express)
```
src/
├── controllers/     # Request handlers
├── models/         # MongoDB schemas
├── routes/         # API routes
├── services/       # Business logic
├── middleware/     # Request middleware
├── config/         # Configuration files
└── utils/          # Utility functions
```

### Frontend (React + Vite)
```
src/
├── components/     # React components
├── hooks/          # Custom React hooks
├── services/       # API services
├── styles/         # CSS styles
└── utils/          # Utility functions
```

## Key Technologies

- **Backend**: Node.js, Express, MongoDB, Mongoose
- **Frontend**: React, Vite, Tailwind CSS, React Query
- **AI**: Google Gemini API for embeddings
- **File Processing**: pdf-parse, mammoth, xlsx
- **Upload**: Multer with file validation

## Security Features

- File type validation
- File size limits
- Rate limiting
- CORS configuration
- Input sanitization
- Error handling

## Performance Optimizations

- Database indexing for fast queries
- Vector similarity search
- Query caching with React Query
- Compressed responses
- Optimized file serving

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check connection string in .env

2. **Gemini API Error**
   - Verify API key is correct
   - Check API quota and billing

3. **File Upload Issues**
   - Check file size limits
   - Verify upload directory permissions

4. **Search Not Working**
   - Ensure documents are properly indexed
   - Check embedding generation

### Logs

Backend logs are displayed in the console. Check for:
- Database connection status
- API request/response logs
- Error messages with stack traces
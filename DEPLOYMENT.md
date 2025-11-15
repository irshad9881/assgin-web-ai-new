# 🚀 Vercel Deployment Guide

## 📋 **Step-by-Step Deployment**

### **1. Prepare Your Repository**

```bash
# Push to GitHub first
git add .
git commit -m "Ready for Vercel deployment"
git push origin main
```

### **2. Deploy to Vercel**

#### **Option A: Vercel CLI (Recommended)**
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy from project root
vercel

# Follow prompts:
# - Link to existing project? No
# - Project name: marketing-search-tool
# - Directory: ./
# - Override settings? No
```

#### **Option B: Vercel Dashboard**
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import from GitHub
4. Select your repository
5. Configure build settings (auto-detected)

### **3. Environment Variables Setup**

In Vercel Dashboard → Project → Settings → Environment Variables:

```bash
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/marketing-search

# AI Service
GEMINI_API_KEY=your_gemini_api_key_here

# App Configuration
NODE_ENV=production
UPLOAD_DIR=/tmp/uploads
MAX_FILE_SIZE=10485760
CORS_ORIGIN=https://your-app.vercel.app

# Frontend URL (for CORS)
FRONTEND_URL=https://your-app.vercel.app
```

### **4. Build Configuration**

Vercel will auto-detect:
- **Frontend**: React build (`npm run build`)
- **Backend**: Node.js serverless functions
- **API Routes**: `/api/*` → Backend functions

### **5. Domain Configuration**

1. **Custom Domain** (Optional):
   - Vercel Dashboard → Domains
   - Add your custom domain
   - Update DNS records

2. **Update Frontend API URL**:
   ```bash
   # In frontend/.env.production
   VITE_API_URL=https://your-app.vercel.app/api
   ```

## 🔧 **How It Works on Vercel**

### **Architecture:**
```
https://your-app.vercel.app/
├── / (Frontend - React SPA)
├── /api/documents/upload (Backend API)
├── /api/documents/search (Backend API)
└── /api/documents/* (All backend routes)
```

### **Serverless Functions:**
- Each API route becomes a serverless function
- Auto-scaling based on traffic
- Cold start ~100-500ms
- No server management needed

### **File Storage:**
- **Development**: Local uploads folder
- **Production**: Use cloud storage (AWS S3, Cloudinary)
- **Temporary**: Vercel `/tmp` (limited, gets cleared)

## 🛠️ **Production Optimizations**

### **1. Database Connection**
```javascript
// Use connection pooling for MongoDB
const mongoose = require('mongoose');

const connectDB = async () => {
  if (mongoose.connections[0].readyState) {
    return; // Already connected
  }
  
  await mongoose.connect(process.env.MONGODB_URI, {
    maxPoolSize: 10, // Maintain up to 10 socket connections
    serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
    socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
  });
};
```

### **2. File Upload Strategy**
```javascript
// For production, use cloud storage
const cloudinary = require('cloudinary').v2;

// Upload to Cloudinary instead of local storage
const uploadToCloud = async (file) => {
  const result = await cloudinary.uploader.upload(file.path, {
    resource_type: "auto",
    folder: "marketing-docs"
  });
  return result.secure_url;
};
```

### **3. Environment-Specific Config**
```javascript
// Different configs for dev/prod
const config = {
  development: {
    uploadDir: './uploads',
    maxFileSize: 10 * 1024 * 1024, // 10MB
  },
  production: {
    uploadDir: '/tmp/uploads',
    maxFileSize: 50 * 1024 * 1024, // 50MB
    useCloudStorage: true
  }
};
```

## 🚨 **Common Issues & Solutions**

### **1. Cold Start Delays**
- **Problem**: First request takes 2-3 seconds
- **Solution**: Use Vercel Pro for faster cold starts

### **2. File Upload Limits**
- **Problem**: Large files fail to upload
- **Solution**: Implement chunked upload or use cloud storage

### **3. Database Connection Timeouts**
- **Problem**: MongoDB connections fail
- **Solution**: Use connection pooling and shorter timeouts

### **4. CORS Issues**
- **Problem**: Frontend can't access API
- **Solution**: Update CORS origins in server.js

## 📊 **Monitoring & Analytics**

### **Vercel Analytics:**
- Real-time performance metrics
- Function execution logs
- Error tracking
- Usage statistics

### **Custom Monitoring:**
```javascript
// Add logging for production
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console()
  ]
});

// Log API usage
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });
  next();
});
```

## ✅ **Deployment Checklist**

- [ ] Environment variables configured
- [ ] MongoDB Atlas connection string added
- [ ] CORS origins updated for production
- [ ] Frontend API URL updated
- [ ] Build scripts working locally
- [ ] All sensitive data in environment variables
- [ ] `.gitignore` properly configured
- [ ] Domain configured (if using custom domain)

## 🎯 **Post-Deployment Testing**

1. **Test all API endpoints**
2. **Upload different file types**
3. **Test search functionality**
4. **Verify file downloads work**
5. **Check mobile responsiveness**
6. **Monitor function logs for errors**

Your marketing search tool will be live at: `https://your-app.vercel.app` 🚀
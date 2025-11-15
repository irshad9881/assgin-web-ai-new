# 🔒 Security Guidelines

## ✅ **Before Pushing to GitHub**

### **1. Environment Variables**
- ✅ `.env` files are in `.gitignore`
- ✅ No API keys or passwords in code
- ✅ Use `.env.example` with placeholder values only

### **2. Database Credentials**
- ✅ MongoDB connection strings removed from public files
- ✅ Database passwords not committed
- ✅ Use local MongoDB for development

### **3. API Keys**
- ✅ Gemini API key placeholder only
- ✅ No hardcoded API keys in source code
- ✅ Environment variable references only

### **4. Upload Directory**
- ✅ `uploads/` folder in `.gitignore`
- ✅ User uploaded files not committed
- ✅ Test files excluded

## 🛡️ **Production Deployment**

### **Environment Variables to Set:**
```bash
MONGODB_URI=your_production_mongodb_uri
GEMINI_API_KEY=your_production_api_key
NODE_ENV=production
CORS_ORIGIN=your_production_domain
```

### **Security Best Practices:**
- Use environment-specific `.env` files
- Enable MongoDB authentication
- Use HTTPS in production
- Implement rate limiting
- Add input validation
- Regular security audits

## 🚨 **Never Commit:**
- Database passwords
- API keys
- Private keys
- User uploaded files
- Log files with sensitive data
- Configuration files with secrets
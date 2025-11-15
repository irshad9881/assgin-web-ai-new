const { GoogleGenerativeAI } = require('@google/generative-ai');

class AIService {
  constructor() {
    this.transformersLoaded = false;
    this.pipeline = null;
    
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'disabled') {
      console.warn('Gemini API key not configured. Using free local embeddings.');
      this.genAI = null;
      this.model = null;
    } else {
      this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      this.model = this.genAI.getGenerativeModel({ model: 'embedding-001' });
    }
  }

  async loadTransformers() {
    if (!this.transformersLoaded) {
      try {
        const { pipeline } = await import('@xenova/transformers');
        this.pipeline = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
        this.transformersLoaded = true;
        console.log('Free local embeddings loaded successfully');
      } catch (error) {
        console.error('Failed to load transformers:', error.message);
        this.transformersLoaded = false;
      }
    }
  }

  async generateFreeEmbedding(text) {
    try {
      await this.loadTransformers();
      
      if (!this.pipeline) {
        throw new Error('Transformers pipeline not loaded');
      }

      const cleanText = this.preprocessText(text);
      const output = await this.pipeline(cleanText, {
        pooling: 'mean',
        normalize: true,
      });

      // Convert tensor to array
      return Array.from(output.data);
    } catch (error) {
      console.error('Free embedding error:', error.message);
      throw error;
    }
  }

  async generateEmbedding(text) {
    try {
      // Try Gemini first if available
      if (this.model) {
        const cleanText = this.preprocessText(text);
        const result = await this.model.embedContent(cleanText);
        console.log('Using Gemini embedding for:', text.substring(0, 50) + '...');
        return result.embedding.values;
      }
    } catch (error) {
      console.error('Gemini embedding failed:', error.message);
    }

    try {
      // Try free local embeddings
      console.log('Using free local embedding for:', text.substring(0, 50) + '...');
      return await this.generateFreeEmbedding(text);
    } catch (error) {
      console.error('Free embedding failed:', error.message);
    }

    // Fallback to mock
    console.log('Using mock embedding for:', text.substring(0, 50) + '...');
    return this.generateMockEmbedding(text);
  }

  generateMockEmbedding(text) {
    // Generate a simple hash-based mock embedding
    const embedding = new Array(384).fill(0); // Match MiniLM dimensions
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    // Fill embedding with pseudo-random values based on text hash
    for (let i = 0; i < 384; i++) {
      embedding[i] = Math.sin(hash + i) * 0.5;
    }
    
    return embedding;
  }

  preprocessText(text) {
    return text
      .replace(/\s+/g, ' ')
      .replace(/[^\w\s.,!?-]/g, '')
      .trim()
      .substring(0, 512); // Limit for transformer models
  }

  calculateSimilarity(embedding1, embedding2) {
    if (!embedding1 || !embedding2 || embedding1.length !== embedding2.length) {
      return 0;
    }

    // Cosine similarity calculation
    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;

    for (let i = 0; i < embedding1.length; i++) {
      dotProduct += embedding1[i] * embedding2[i];
      norm1 += embedding1[i] * embedding1[i];
      norm2 += embedding2[i] * embedding2[i];
    }

    const magnitude = Math.sqrt(norm1) * Math.sqrt(norm2);
    return magnitude === 0 ? 0 : dotProduct / magnitude;
  }

  async findSimilarDocuments(queryEmbedding, documents, threshold = 0.3) {
    const similarities = documents.map(doc => ({
      document: doc,
      similarity: this.calculateSimilarity(queryEmbedding, doc.embedding)
    }));

    return similarities
      .filter(item => item.similarity >= threshold)
      .sort((a, b) => b.similarity - a.similarity);
  }

  async enhanceSearchQuery(query) {
    // Simple keyword expansion for now
    const expansions = {
      'marketing': 'marketing campaign advertising promotion',
      'brand': 'brand branding identity logo',
      'social': 'social media facebook twitter instagram',
      'email': 'email newsletter mailchimp campaign',
      'content': 'content blog article copy writing',
      'analytics': 'analytics metrics data performance',
      'strategy': 'strategy plan roadmap objectives',
      'creative': 'creative design visual artwork'
    };

    let enhanced = query;
    Object.keys(expansions).forEach(key => {
      if (query.toLowerCase().includes(key)) {
        enhanced += ' ' + expansions[key];
      }
    });

    return enhanced;
  }
}

module.exports = new AIService();
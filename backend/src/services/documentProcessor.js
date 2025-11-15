const fs = require('fs').promises;
const path = require('path');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const xlsx = require('xlsx');

class DocumentProcessor {
  async extractContent(filePath, fileType) {
    try {
      switch (fileType.toLowerCase()) {
        case 'pdf':
          return await this.extractPdfContent(filePath);
        case 'docx':
          return await this.extractDocxContent(filePath);
        case 'txt':
          return await this.extractTextContent(filePath);
        case 'xlsx':
          return await this.extractExcelContent(filePath);
        case 'pptx':
          return await this.extractPptxContent(filePath);
        case 'jpg':
        case 'jpeg':
        case 'png':
        case 'gif':
          return await this.extractImageContent(filePath, fileType);
        default:
          throw new Error(`Unsupported file type: ${fileType}`);
      }
    } catch (error) {
      console.error(`Error extracting content from ${filePath}:`, error.message);
      // Return more informative fallback content
      const filename = path.basename(filePath);
      const fileInfo = `File: ${filename} (${fileType.toUpperCase()})`;
      
      // Extract meaningful info from filename for better searchability
      const nameWords = filename.replace(/[._-]/g, ' ').replace(/\.[^.]*$/, '').split(' ');
      const meaningfulWords = nameWords.filter(word => word.length > 2).join(' ');
      
      return `${fileInfo}. Keywords from filename: ${meaningfulWords}. Content extraction not available for this file format or the file may be protected/corrupted.`;
    }
  }

  async extractPdfContent(filePath) {
    try {
      const dataBuffer = await fs.readFile(filePath);
      const data = await pdfParse(dataBuffer);
      
      if (data.text && data.text.trim().length > 0) {
        return this.cleanText(data.text);
      } else {
        // Fallback: extract metadata and filename info
        const filename = path.basename(filePath);
        return `PDF Document: ${filename}. This PDF may contain images or protected content that cannot be extracted as text.`;
      }
    } catch (error) {
      console.error('PDF extraction error:', error.message);
      const filename = path.basename(filePath);
      return `PDF Document: ${filename}. Content extraction failed - the PDF may be password protected, corrupted, or contain only images.`;
    }
  }

  async extractDocxContent(filePath) {
    const result = await mammoth.extractRawText({ path: filePath });
    return this.cleanText(result.value);
  }

  async extractTextContent(filePath) {
    const content = await fs.readFile(filePath, 'utf8');
    return this.cleanText(content);
  }

  async extractExcelContent(filePath) {
    const workbook = xlsx.readFile(filePath);
    let content = '';
    
    workbook.SheetNames.forEach(sheetName => {
      const worksheet = workbook.Sheets[sheetName];
      const sheetData = xlsx.utils.sheet_to_csv(worksheet);
      content += sheetData + '\n';
    });
    
    return this.cleanText(content);
  }

  async extractPptxContent(filePath) {
    // For PowerPoint, extract text using mammoth (basic support)
    try {
      const result = await mammoth.extractRawText({ path: filePath });
      return this.cleanText(result.value);
    } catch (error) {
      // Fallback: return filename-based content
      const filename = path.basename(filePath);
      return `PowerPoint presentation: ${filename}. Content extraction not fully supported for PPTX files.`;
    }
  }

  async extractImageContent(filePath, fileType) {
    // For images, return metadata and filename-based content
    const filename = path.basename(filePath);
    const stat = await fs.stat(filePath);
    return `Image file: ${filename}. File type: ${fileType}. Size: ${stat.size} bytes. Created: ${stat.birthtime}.`;
  }

  cleanText(text) {
    return text
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .replace(/\n+/g, '\n')
      .replace(/\s+/g, ' ')
      .trim();
  }

  categorizeDocument(filename, content) {
    const lowerFilename = filename.toLowerCase();
    const lowerContent = content.toLowerCase();

    // Category keywords mapping
    const categoryKeywords = {
      'campaign': ['campaign', 'advertising', 'promotion', 'launch', 'marketing campaign'],
      'brand': ['brand', 'branding', 'identity', 'logo', 'brand guide'],
      'social-media': ['social', 'facebook', 'twitter', 'instagram', 'linkedin', 'tiktok'],
      'email': ['email', 'newsletter', 'mailchimp', 'campaign monitor', 'subject line'],
      'content': ['content', 'blog', 'article', 'copy', 'copywriting', 'editorial'],
      'analytics': ['analytics', 'metrics', 'kpi', 'performance', 'data', 'report'],
      'strategy': ['strategy', 'plan', 'roadmap', 'objectives', 'goals'],
      'creative': ['creative', 'design', 'visual', 'artwork', 'graphics']
    };

    // Score each category
    const scores = {};
    Object.keys(categoryKeywords).forEach(category => {
      scores[category] = 0;
      categoryKeywords[category].forEach(keyword => {
        if (lowerFilename.includes(keyword)) scores[category] += 2;
        if (lowerContent.includes(keyword)) scores[category] += 1;
      });
    });

    // Return category with highest score, default to 'content'
    const bestCategory = Object.keys(scores).reduce((a, b) => 
      scores[a] > scores[b] ? a : b
    );
    
    return scores[bestCategory] > 0 ? bestCategory : 'content';
  }

  extractTags(content, filename) {
    const tags = new Set();
    
    // Extract from filename
    const filenameParts = path.parse(filename).name
      .split(/[-_\s]+/)
      .filter(part => part.length > 2);
    
    filenameParts.forEach(part => tags.add(part.toLowerCase()));

    // Extract common marketing terms from content
    const marketingTerms = [
      'roi', 'ctr', 'conversion', 'engagement', 'reach', 'impressions',
      'leads', 'funnel', 'acquisition', 'retention', 'churn', 'ltv',
      'seo', 'sem', 'ppc', 'cpc', 'cpm', 'organic', 'paid',
      'a/b test', 'landing page', 'call to action', 'cta'
    ];

    const lowerContent = content.toLowerCase();
    marketingTerms.forEach(term => {
      if (lowerContent.includes(term)) {
        tags.add(term);
      }
    });

    return Array.from(tags).slice(0, 10); // Limit to 10 tags
  }

  extractTeamFromPath(filePath) {
    const pathParts = filePath.split(/[/\\]/);
    
    // Look for team indicators in path
    const teamKeywords = {
      'creative': ['creative', 'design', 'graphics'],
      'content': ['content', 'editorial', 'blog'],
      'social': ['social', 'community'],
      'email': ['email', 'newsletter'],
      'analytics': ['analytics', 'data', 'reporting'],
      'strategy': ['strategy', 'planning']
    };

    for (const part of pathParts) {
      const lowerPart = part.toLowerCase();
      for (const [team, keywords] of Object.entries(teamKeywords)) {
        if (keywords.some(keyword => lowerPart.includes(keyword))) {
          return team;
        }
      }
    }

    return 'general';
  }
}

module.exports = new DocumentProcessor();
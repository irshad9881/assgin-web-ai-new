// Mock database service for when MongoDB is not available
class MockDatabase {
  constructor() {
    this.documents = [];
    this.nextId = 1;
  }

  async saveDocument(docData) {
    const document = {
      _id: this.nextId++,
      ...docData,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.documents.push(document);
    return document;
  }

  async findDocuments(filter = {}) {
    let results = this.documents.filter(doc => doc.isActive !== false);
    
    if (filter.category) {
      results = results.filter(doc => doc.category === filter.category);
    }
    if (filter.team) {
      results = results.filter(doc => doc.team === filter.team);
    }
    if (filter.project) {
      results = results.filter(doc => doc.project === filter.project);
    }
    
    return results;
  }

  async findById(id) {
    return this.documents.find(doc => doc._id == id);
  }

  async getCategories() {
    const categories = {};
    const teams = {};
    const projects = {};

    this.documents.filter(doc => doc.isActive !== false).forEach(doc => {
      categories[doc.category] = (categories[doc.category] || 0) + 1;
      teams[doc.team] = (teams[doc.team] || 0) + 1;
      projects[doc.project] = (projects[doc.project] || 0) + 1;
    });

    return {
      categories: Object.entries(categories).map(([name, count]) => ({ name, count })),
      teams: Object.entries(teams).map(([name, count]) => ({ name, count })),
      projects: Object.entries(projects).map(([name, count]) => ({ name, count }))
    };
  }

  async textSearch(query, filter = {}) {
    let results = this.documents.filter(doc => 
      doc.isActive !== false &&
      (doc.title.toLowerCase().includes(query.toLowerCase()) ||
      doc.content.toLowerCase().includes(query.toLowerCase()) ||
      doc.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase())))
    );
    
    // Apply filters
    if (filter.category) {
      results = results.filter(doc => doc.category === filter.category);
    }
    if (filter.team) {
      results = results.filter(doc => doc.team === filter.team);
    }
    if (filter.project) {
      results = results.filter(doc => doc.project === filter.project);
    }
    
    return results;
  }
}

module.exports = new MockDatabase();
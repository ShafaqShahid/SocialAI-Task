class ApiClient {
  constructor(request, baseURL) {
    this.request = request;
    this.baseURL = baseURL;
    this.token = null;
    this.lastResponse = null;
    this.lastBody = null;
  }

  async resetState() {
    await this.request.post(`${this.baseURL}/api/_debug/reset`);
  }

  setToken(token) {
    this.token = token;
  }

  async send(method, path, body) {
    const response = await this.request.fetch(`${this.baseURL}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(this.token ? { Authorization: `Bearer ${this.token}` } : {})
      },
      data: body
    });

    this.lastResponse = response;
    this.lastBody = await response.json().catch(() => null);
    return response;
  }

  async health() {
    return this.send('GET', '/api/health');
  }

  async register(payload) {
    return this.send('POST', '/api/auth/register', payload);
  }

  async login(payload) {
    return this.send('POST', '/api/auth/login', payload);
  }

  async createPost(payload) {
    return this.send('POST', '/api/posts', payload);
  }

  async listPosts(query = '') {
    return this.send('GET', `/api/posts${query}`);
  }

  async getPost(postId) {
    return this.send('GET', `/api/posts/${postId}`);
  }

  async updatePost(postId, payload) {
    return this.send('PUT', `/api/posts/${postId}`, payload);
  }

  async deletePost(postId) {
    return this.send('DELETE', `/api/posts/${postId}`);
  }

  async schedulePost(postId, payload) {
    return this.send('POST', `/api/posts/${postId}/schedule`, payload);
  }
}

module.exports = { ApiClient };

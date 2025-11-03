import type { LoginRequest, LoginResponse, ChatRequest, ChatResponse } from '@/types/api';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://semistimulating-marlen-intermittent.ngrok-free.dev/';

class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class ApiClient {
  private token: string | null = null;

  constructor() {
    // Load token from localStorage on initialization
    this.token = localStorage.getItem('auth_token');
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }
  }

  getToken(): string | null {
    return this.token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      // Clear token and redirect to login
      this.setToken(null);
      window.location.href = '/login';
      throw new ApiError('Unauthorized', 401);
    }

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new ApiError(
        data.message || `HTTP ${response.status}`,
        response.status,
        data
      );
    }

    return response.json();
  }

  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await this.request<LoginResponse>('/api/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    this.setToken(response.token);
    return response;
  }

  async chat(request: ChatRequest): Promise<ChatResponse> {
    return this.request<ChatResponse>('/api/chat', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  createStreamingChat(
    message: string,
    sections?: string[],
    topK: number = 5,
    conversationId?: string
  ): EventSource {
    const params = new URLSearchParams({
      message,
      top_k: topK.toString(),
    });

    if (sections && sections.length > 0) {
      params.append('sections', sections.join(','));
    }

    if (conversationId) {
      params.append('conversation_id', conversationId);
    }

    // Attach bearer token via query param (EventSource cannot set headers)
    const token = this.getToken();
    if (token) {
      params.append('token', token);
    }

    const url = `${API_BASE_URL}/api/chat/stream?${params.toString()}`;

    const eventSource = new EventSource(url);
    
    // Add authorization header handling for EventSource
    // Note: EventSource doesn't support custom headers, so the backend
    // should accept token via query param or handle CORS properly
    
    return eventSource;
  }

  logout() {
    this.setToken(null);
  }
}

export const apiClient = new ApiClient();

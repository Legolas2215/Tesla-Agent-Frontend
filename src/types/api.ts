export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
  };
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  citations?: Citation[];
  messageId?: string;
}

export interface Citation {
  page_number: number;
  section_name: string;
}

export interface ChatRequest {
  message: string;
  sections?: string[];
  top_k?: number;
  conversation_id?: string;
}

export interface ChatResponse {
  answer: string;
  citations: Citation[];
  messageId: string;
}

export interface SSETokenEvent {
  token: string;
}

export interface SSEDoneEvent {
  messageId: string;
  citations: Citation[];
}

export interface SSEErrorEvent {
  message: string;
}

export interface TableOfContentsEntry {
  section: string;
  page: number;
}

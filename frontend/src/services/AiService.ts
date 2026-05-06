import api from './api';
import type { AiResponse } from '../types';

export async function sendChatMessage(message: string): Promise<AiResponse> {
  const response = await api.post<AiResponse>('/ai/chat', { message });
  return response.data;
}

export async function generateAdminReport(): Promise<AiResponse> {
  const response = await api.get<AiResponse>('/ai/admin-report');
  return response.data;
}

import { AWS_CONFIG } from '../constants/config';

export interface SessionItem {
  session_id: string;
  participante_id: string;
  scene_config_id: string;
  experiencia: string;
  duracion_seg: number;
  metricas: {
    score?: number;
    avg_hr?: number;
  };
  tenant_id?: string;
}

export async function fetchSessions(token: string, participanteId: string = 'P001'): Promise<SessionItem[]> {
  const response = await fetch(`${AWS_CONFIG.API_URL}/sessions?participante_id=${participanteId}`, {
    method: 'GET',
    headers: {
      Authorization: token,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Error API Gateway: ${response.status}`);
  }

  const data = await response.json();
  return data.items || data || [];
}
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

export interface SessionData {
  session_id: string;
  participante_id: string;
  experiencia: string;
  scene_config_id: string;
  duracion_seg: number;
  timestamp?: string; // <--- NUEVO CAMPO
  metricas: any;
}

const API_BASE_URL = 'https://4gesdz7435.execute-api.us-east-1.amazonaws.com/v1';

export function useSessions(participanteId: string) {
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSessionsData = useCallback(async () => {
    try {
      setError(null);
      
      const storedSession = await AsyncStorage.getItem('user_session');
      if (!storedSession) {
        throw new Error('No existe una sesión activa.');
      }

      const { token } = JSON.parse(storedSession);
      
      const response = await fetch(`${API_BASE_URL}/scenes?participantId=${participanteId}&tenantId=habaA`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`AWS respondió con error ${response.status}`);
      }

      const data = await response.json();
      const rounds = data.items || [];

      // Agrupamos las rondas por sessionId
      const sessionsMap: Record<string, SessionData> = {};

      rounds.forEach((round: any) => {
        const sId = round.sessionId;
        
        if (!sessionsMap[sId]) {
          sessionsMap[sId] = {
            session_id: sId,
            participante_id: round.participantId,
            experiencia: 'Unity VR (Scenes v1)',
            scene_config_id: 'Evaluación Multiescena',
            duracion_seg: 0,
            timestamp: round.timestamp || new Date().toISOString(), // <--- GUARDAMOS LA FECHA
            metricas: { score: 0, detalle_escenas: [] }
          };
        }
        
        const m = round.metrics || {};
        
        sessionsMap[sId].metricas.detalle_escenas.push({
          escena: round.scenarioId,
          estado: round.status,
          resumen_ia: round.resumen_ia, // <--- GUARDAMOS EL RESUMEN DE LA IA
          ...m
        });
        
        if (m.activeTimeSeconds) {
          sessionsMap[sId].duracion_seg += m.activeTimeSeconds;
        }
      });

      // Calculamos el score y convertimos el mapa a un arreglo
      const finalSessions = Object.keys(sessionsMap).map(key => {
        const session = sessionsMap[key];
        const escenas = session.metricas.detalle_escenas;
        let totalScore = 0;
        let validScenes = 0;
        
        escenas.forEach((e: any) => {
          if (e.escena === 'memory' && e.matchingAccuracyPercent != null) {
             totalScore += e.matchingAccuracyPercent;
             validScenes++;
          } else if (e.escena === 'pigeons' && e.responseCorrect != null) {
             totalScore += e.responseCorrect ? 100 : 0;
             validScenes++;
          } else if (e.escena === 'puzzle' && e.incorrectMoves != null) {
             totalScore += e.incorrectMoves <= 3 ? 100 : 50;
             validScenes++;
          }
        });

        session.metricas.score = validScenes > 0 ? Math.round(totalScore / validScenes) : 0;
        session.duracion_seg = Math.round(session.duracion_seg);
        return session;
      });

      // Ordenamos para que las más recientes salgan primero
        finalSessions.sort((a, b) => {
        const dateA = new Date(a.timestamp || 0).getTime();
        const dateB = new Date(b.timestamp || 0).getTime();
        return dateB - dateA; 
      });

      // Actualizamos el estado con el arreglo final
      setSessions([...finalSessions]);
      
    } catch (err: any) {
      setError(err.message || 'Error al consultar sesiones');
    } finally {
      setLoading(false);
    }
  }, [participanteId]);

  useEffect(() => {
    fetchSessionsData();
  }, [fetchSessionsData]);

  return { sessions, loading, error, refetch: fetchSessionsData };
}
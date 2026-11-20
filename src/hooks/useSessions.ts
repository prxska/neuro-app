import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

export interface SessionData {
  session_id: string;
  participante_id: string;
  experiencia: string;
  scene_config_id: string;
  duracion_seg: number;
  timestamp?: string;
  metricas: any;
}

export const API_BASE_URL = 'https://ucgkiesz19.execute-api.us-east-1.amazonaws.com/v1';

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
      
      const url = `${API_BASE_URL}/scenes?participantId=${participanteId}&tenantId=habA`;
      console.log("Consultando URL:", url);

      const response = await fetch(url, {
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
      console.log("Datos recibidos de AWS:", rounds); // Esto te ayudará a ver qué manda AWS

      const sessionsMap: Record<string, SessionData> = {};

      rounds.forEach((round: any) => {
        // 🔥 EL FIX ESTÁ AQUÍ: Buscamos el ID en distintas variantes por si AWS lo cambia
        const sId = round.sessionId || round.session_id || round.tenantParticipantKey || 'sesion-desconocida';
        
        if (!sessionsMap[sId]) {
          sessionsMap[sId] = {
            session_id: sId,
            participante_id: round.participantId || round.participant_id || participanteId,
            experiencia: 'Unity VR (Scenes v1)',
            scene_config_id: 'Evaluación Multiescena',
            duracion_seg: 0,
            timestamp: round.timestamp || round.updated_at || new Date().toISOString(),
            metricas: { score: 0, detalle_escenas: [] }
          };
        }
        
        const m = round.metrics || {};
        
        sessionsMap[sId].metricas.detalle_escenas.push({
          escena: round.scenarioId || round.sceneId || 'Escena',
          estado: round.status || 'completado',
          resumen_ia: round.resumen_ia,
          ...m
        });
        
        // Si viene activeTimeMs (en milisegundos), lo pasamos a segundos
        if (m.activeTimeMs) {
          sessionsMap[sId].duracion_seg += (m.activeTimeMs / 1000);
        } else if (m.activeTimeSeconds) {
          sessionsMap[sId].duracion_seg += m.activeTimeSeconds;
        }
      });

      const finalSessions = Object.keys(sessionsMap).map(key => {
        const session = sessionsMap[key];
        const escenas = session.metricas.detalle_escenas;
        let totalScore = 0;
        let validScenes = 0;
        
        escenas.forEach((e: any) => {
          // Como migramos datos de Firebase, usamos los campos de ahí
          if (e.correctPairAttempts != null && e.totalPieces != null) {
             const scoreRonda = e.totalPieces > 0 ? (e.correctPairAttempts / e.totalPieces) * 100 : 0;
             totalScore += scoreRonda;
             validScenes++;
          }
        });

        session.metricas.score = validScenes > 0 ? Math.round(totalScore / validScenes) : 0;
        session.duracion_seg = Math.round(session.duracion_seg);
        return session;
      });

      finalSessions.sort((a, b) => {
        const dateA = new Date(a.timestamp || 0).getTime();
        const dateB = new Date(b.timestamp || 0).getTime();
        return dateB - dateA; 
      });

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
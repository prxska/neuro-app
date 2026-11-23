import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

export interface SessionData {
  session_id: string;
  participante_id: string;
  experiencia: string;
  scene_config_id: string;
  duracion_seg: number;
  timestamp?: string;
  tag?: string; // <-- NUEVO
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
      
      // Consultamos a AWS
      const url = `${API_BASE_URL}/scenes?participantId=${participanteId}&tenantId=habA`;
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

      const sessionsMap: Record<string, SessionData> = {};

      rounds.forEach((round: any) => {
        // 🔥 Adaptado a tu DynamoDB real:
        const sId = round.sessionId || 'sesion-desconocida';
        
        // Extraemos el ID del paciente de la llave (ej: habA#p-375e... -> p-375e...)
        const pId = round.tenantParticipantKey ? round.tenantParticipantKey.split('#')[1] : participanteId;
        
        if (!sessionsMap[sId]) {
          sessionsMap[sId] = {
            session_id: sId,
            participante_id: pId,
            experiencia: round.sceneId || 'Unity VR',
            scene_config_id: round.difficulty ? `Nivel ${round.difficulty}` : 'Evaluación',
            duracion_seg: 0,
            timestamp: round.migrationDate || new Date().toISOString(),
            tag: round.tag || 'Sin etiqueta', // 🔥 Leemos el TAG
            metricas: { score: 0, detalle_escenas: [] }
          };
        }
        
        // 🔥 Los datos están en la raíz de 'round', no dentro de 'round.metrics'
        sessionsMap[sId].metricas.detalle_escenas.push({
          escena: round.sceneId,
          estado: round.status || 'completado',
          ...round // Guardamos todo por si acaso
        });
        
        // Sumamos el tiempo activo (viene en milisegundos)
        if (round.activeTimeMs) {
          sessionsMap[sId].duracion_seg += (round.activeTimeMs / 1000);
        }
      });

      // Calculamos el score general
      const finalSessions = Object.keys(sessionsMap).map(key => {
        const session = sessionsMap[key];
        const escenas = session.metricas.detalle_escenas;
        let totalScore = 0;
        let validScenes = 0;
        
        escenas.forEach((e: any) => {
          // Calculamos el score basado en aciertos vs piezas totales
          if (e.correctPairAttempts != null && e.totalPieces != null && e.totalPieces > 0) {
             totalScore += (e.correctPairAttempts / e.totalPieces) * 100;
             validScenes++;
          }
        });

        session.metricas.score = validScenes > 0 ? Math.round(totalScore / validScenes) : 0;
        session.duracion_seg = Math.round(session.duracion_seg);
        return session;
      });

      // Ordenamos por fecha
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

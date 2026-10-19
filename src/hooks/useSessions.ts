import { fetchSessions, SessionItem } from '@/services/api';
import { useCallback, useEffect, useState } from 'react';

export interface SessionData extends SessionItem {
  tenant_id?: string;
}

export function useSessions(participanteId: string) {
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSessionsData = useCallback(async () => {
    try {
      setError(null);
      
      const tokenTemporal = "eyJraWQiOiI3cGtHUVJicTJXdlpZc3g0cEhpWDV6bytxeEJVSk1UbEZaeStXK3pId1ZFPSIsImFsZyI6IlJTMjU2In0.eyJ0ZW5hbnRfaWQiOiJoYWJBIiwic3ViIjoiZDQ4OGQ0NzgtYzA0MS03MGMyLWRiM2YtYmEyODUyODRiNTU2IixlY29nbml0bzpncm91cHMiOlsiU3BlY2lhbGlzdCJdLCJpc3MiOiJodHRwczovL2NvZ25pdG8taWRwLnVzLWVhc3QtMS5hbWF6b25hd3MuY29tL3VzLWVhc3QtMV9JWGVrRWhIVmkiLCJjbGllbnRfaWQiOiIxZXRvMXFrdWtmaDY4MWE3djliaWM1Nm1rYSIsIm9yaWdpbl9qdGkiOiI5OTZmMTYwZS1iOWM4LTQxYjQtYjA5Ni01NjQzNTg3NmUzZjUiLCJldmVudF9pZCI6IjBiMTc0MWNkLWEwMjItNGU1Mi05MTNiLTcwNjhiMmFiMzZiZCIsInRva2VuX3VzZSI6ImFjY2VzcyIsInNjb3BlIjoiYXdzLmNvZ25pdG8uc2lnbmluLnVzZXIuYWRtaW4iLCJhdXRoX3RpbWUiOjE3OTI0NDkzMzcsImV4cCI6MTc5MjQ1MjkzNywiaWF0IjoxNzkyNDQ5MzM3LCJqdGkiOiIwYjBiYTE0OC1lNTZmLTQ5MDItOTNmZC05YWIyMDljZTFjMmUiLCJ1c2VybmFtZSI6ImQ0ODhkNDc4LWMwNDEtNzBjMi1kYjNmLWJhMjg1Mjg0YjU1NiJ9.UyNiP5u5hasrYuziENTABbha-6quFYhY_1aveMMOooUPvvdXU-LK0NdZEAaT8idXoU7sSMMeyC_ZQ9vU1fh3PzjVZRgqWphCH0yDv03iuYDiLQopcbWZNB1xgiUaeVhmEzbYRoC94bIkL3LkYIOKHK0kdeyEdT-yw3xAIhF9E5_ZcRG6RQscMRNPWb7TbyuxMGuemXfI8TYI1c_o1zoa8HAbA5Q2h6cgSDlMCTsWVaWjiJSQESRbIwf7gzWDVpSUEOU45x3SNRlSoKmE_A-qUhEcd6JzdM5U1oNZeR4WxaeruqyIU_pV-h4hFM2AnJc-FqskzxeYSvXKsuU_pan9og";

      const data = await fetchSessions(tokenTemporal, participanteId);
      setSessions(data);
    } catch (err: any) {
      setError(err.message || 'Error al consultar sesiones protegidas en AWS');
    } finally {
      setLoading(false);
    }
  }, [participanteId]);

  useEffect(() => {
    fetchSessionsData();
  }, [fetchSessionsData]);

  return { sessions, loading, error, refetch: fetchSessionsData };
}
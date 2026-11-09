import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Easing,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { API_BASE_URL, useSessions } from '../hooks/useSessions';

type UserRole = 'Admin Plataforma' | 'Admin Institución' | 'Especialista' | 'Auditor';
type TabType = 'Métricas' | 'Sesiones VR' | 'Costos y Nube';

interface TabItem {
  key: TabType;
  label: string;
  iconActive: keyof typeof Ionicons.glyphMap;
  iconInactive: keyof typeof Ionicons.glyphMap;
}

export default function DashboardScreen() {
  const [activeRole, setActiveRole] = useState<UserRole>('Admin Plataforma');
  const [activeTab, setActiveTab] = useState<TabType>('Métricas');
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [userEmail, setUserEmail] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const { sessions, loading: sessionsLoading, error: sessionsError, refetch } = useSessions('P001');

  // Estado para manejar qué tarjeta tiene la burbuja abierta
  const [expandedSession, setExpandedSession] = useState<string | null>(null);
  const bubbleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const session = await AsyncStorage.getItem('user_session');
      if (!session) {
        router.replace('/login');
      } else {
        const parsed = JSON.parse(session);
        setUserEmail(parsed.email || '');
      }
    } catch (e) {
      router.replace('/login');
    } finally {
      setIsCheckingAuth(false);
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('user_session');
    router.replace('/login');
  };

  const onRefresh = async () => {
    setRefreshing(true);
    if (refetch) {
      await refetch();
    }
    setRefreshing(false);
  };

  const handleDeleteSession = (sessionId: string) => {
    Alert.alert(
      "Eliminar Sesión",
      "¿Seguro que quieres eliminar esta sesión de la base de datos?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              const storedSession = await AsyncStorage.getItem('user_session');
              if (!storedSession) return;
              const { token } = JSON.parse(storedSession);

              const response = await fetch(`${API_BASE_URL}/scenes?participantId=P001&tenantId=habaA&sessionId=${sessionId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
              });

              if (response.ok) {
                Alert.alert("Éxito", "Sesión eliminada correctamente");
                onRefresh();
              } else {
                Alert.alert("Error", "Error al eliminar en AWS");
              }
            } catch (error) {
              console.error(error);
              Alert.alert("Error", "Error de conexión");
            }
          }
        }
      ]
    );
  };

  const toggleAiBubble = (sessionId: string) => {
    if (expandedSession === sessionId) {
      // Primero anima la salida y después desmonta la burbuja.
      Animated.timing(bubbleAnim, {
        toValue: 0,
        duration: 180,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) setExpandedSession(null);
      });
      return;
    }

    // Reinicia la animación al cambiar de sesión.
    bubbleAnim.setValue(0);
    setExpandedSession(sessionId);
    Animated.timing(bubbleAnim, {
      toValue: 1,
      duration: 420,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  };

  const totalSesiones = sessions.length;
  const scorePromedio = totalSesiones > 0 
    ? Math.round(sessions.reduce((acc, s) => acc + (s.metricas?.score || 0), 0) / totalSesiones) 
    : 0;

  const roles: UserRole[] = ['Admin Plataforma', 'Admin Institución', 'Especialista', 'Auditor'];

  const tabItems: TabItem[] = [
    { key: 'Métricas', label: 'Métricas', iconActive: 'stats-chart', iconInactive: 'stats-chart-outline' },
    { key: 'Sesiones VR', label: 'Sesiones VR', iconActive: 'headset', iconInactive: 'headset-outline' },
    { key: 'Costos y Nube', label: 'Costos/Nube', iconActive: 'cloudy', iconInactive: 'cloudy-outline' },
  ];

  if (isCheckingAuth) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#38BDF8" />
      </View>
    );
  }

  return (
    <View style={styles.mainContainer}>
      <LinearGradient
        colors={['#0F172A', '#1E1B4B', '#020617']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
      />

      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
<StatusBar barStyle="light-content" />
        {/* Encabezado Superior */}
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>NeuroFlex VR</Text>
            <Text style={styles.headerSubtitle}>{userEmail || 'Plataforma SaaS'}</Text>
          </View>

          <View style={styles.headerActions}>
            <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
              <Ionicons name="log-out-outline" size={20} color="#EF4444" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Selector de Rol */}
        <View style={styles.roleContainer}>
          <Text style={styles.sectionLabel}>Rol Activo:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {roles.map((role) => (
              <TouchableOpacity
                key={role}
                style={[styles.roleChip, activeRole === role && styles.roleChipActive]}
                onPress={() => setActiveRole(role)}
              >
                <Text style={[styles.roleText, activeRole === role && styles.roleTextActive]}>
                  {role}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Contenido Principal */}
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.scrollPadding}
          refreshControl={
            activeTab === 'Sesiones VR' ? (
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#38BDF8" />
            ) : undefined
          }
        >
          {/* PESTAÑA DE MÉTRICAS */}
          {activeTab === 'Métricas' && (
            <View style={styles.tabContent}>
              <Text style={styles.cardHeaderTitle}>Rendimiento Global Real</Text>
              <View style={styles.grid}>
                <View style={styles.card}>
                  <Text style={styles.cardValue}>{totalSesiones}</Text>
                  <Text style={styles.cardLabel}>Sesiones Procesadas</Text>
                </View>
                <View style={styles.card}>
                  <Text style={styles.cardValue}>{scorePromedio}</Text>
                  <Text style={styles.cardLabel}>Puntaje Promedio</Text>
                </View>
              </View>

              <View style={styles.infoBox}>
                <Text style={styles.infoTitle}>Aislamiento Multi-tenant</Text>
                <Text style={styles.infoDetail}>Infraestructura: 100% Serverless AWS</Text>
                <Text style={styles.infoDetail}>Seguridad: Aislamiento por Institución</Text>
                <Text style={styles.infoDetail}>Ley 21.719: Datos cifrados en DynamoDB y S3.</Text>
              </View>
            </View>
          )}

          {/* PESTAÑA DE SESIONES VR */}
          {activeTab === 'Sesiones VR' && (
            <View style={styles.tabContent}>
              <Text style={styles.cardHeaderTitle}>
                Registro de Sesiones (P001) ({sessions.length})
              </Text>

              {sessionsLoading && !refreshing ? (
                <View style={styles.centerContent}>
                  <ActivityIndicator size="large" color="#38BDF8" />
                  <Text style={styles.loadingText}>Consultando telemetría...</Text>
                </View>
              ) : sessionsError && !refreshing ? (
                <View style={styles.errorBox}>
                  <Text style={styles.errorTitle}>Error de Conexión</Text>
                  <Text style={styles.errorText}>{sessionsError}</Text>
                </View>
              ) : sessions.length === 0 ? (
                <View style={styles.emptyCard}>
                  <Text style={styles.emptyTitle}>Sin registros en DynamoDB</Text>
                  <Text style={styles.emptySubtitle}>Inyecta una sesión para validar.</Text>
                </View>
              ) : (
                sessions.map((item: any) => {
                  const isHard = Boolean(item.scene_config_id?.includes('HARD'));
                  const hasAI = item.metricas?.detalle_escenas?.[0]?.resumen_ia;
                  const isExpanded = expandedSession === item.session_id;
                  
                  return (
                    <View
                      key={item.session_id}
                      style={[styles.sessionCard, isExpanded && styles.sessionCardExpanded]}
                    >
                      
                      {/* Cabecera: ID, Botón IA, Basurero */}
                      <View style={styles.sessionHeader}>
                        <Text 
                          style={styles.sessionCode} 
                          numberOfLines={1} 
                          ellipsizeMode="tail"
                        >
                          {item.session_id}
                        </Text>
                        
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                          {hasAI && (
                            <TouchableOpacity 
                              style={styles.aiCardButton} 
                              onPress={() => toggleAiBubble(item.session_id)}
                            >
                              <Ionicons name="sparkles" size={14} color="#38BDF8" />
                              <Text style={styles.aiCardButtonText}>IA</Text>
                            </TouchableOpacity>
                          )}
                          <TouchableOpacity onPress={() => handleDeleteSession(item.session_id)}>
                            <Ionicons name="trash-outline" size={20} color="#EF4444" />
                          </TouchableOpacity>
                        </View>
                      </View>

                      {/* Badge verde */}
                      <View style={{ flexDirection: 'row', marginBottom: 8, marginTop: 4 }}>
                        <Text style={[styles.badge, isHard ? styles.badgeHard : styles.badgeEasy]}>
                          {item.scene_config_id || 'Nivel Base'}
                        </Text>
                      </View>

                      <Text style={styles.sessionSubText}>Experiencia: {item.experiencia || 'N/A'}</Text>
                      <Text style={styles.sessionSubText}>Duración: {item.duracion_seg ?? 0} segundos</Text>

                      {item.metricas?.score !== undefined && (
                        <Text style={styles.scoreText}>Puntaje Cognitivo: {item.metricas.score} pts</Text>
                      )}

                      {/* BURBUJA IA SOBREPUESTA: flota sobre la sesión sin modificar su altura */}
                      {hasAI && isExpanded && (
                        <Animated.View
                          style={[
                            styles.inlineBubbleContainer,
                            {
                              opacity: bubbleAnim,
                              transform: [
                                { translateY: bubbleAnim.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) },
                                { scale: bubbleAnim.interpolate({ inputRange: [0, 1], outputRange: [0.96, 1] }) },
                              ],
                            },
                          ]}
                        >
                          <View style={styles.inlineBubbleArrow} />
                          
                          <View style={styles.inlineBubbleContent}>
                            <View style={styles.bubbleHeader}>
                              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                <Ionicons name="sparkles" size={16} color="#38BDF8" />
                                <Text style={styles.bubbleTitle}>Análisis Clínico IA</Text>
                              </View>
                              <TouchableOpacity onPress={() => toggleAiBubble(item.session_id)}>
                                <Ionicons name="close" size={18} color="#94A3B8" />
                              </TouchableOpacity>
                            </View>

                            {item.metricas.detalle_escenas.map((escena: any, idx: number) => (
                              <View key={idx} style={styles.bubbleSceneCard}>
                                <Text style={styles.bubbleSceneTitle}>
                                  {escena.escena === 'puzzle' ? '🧩 Puzzle' : 
                                   escena.escena === 'memory' ? '🃏 Memoria' : '🕊️ Palomas'}
                                </Text>
                                <Text style={styles.bubbleSceneText}>
                                  {escena.resumen_ia || 'Sin resumen generado.'}
                                </Text>
                              </View>
                            ))}

                            <Text style={styles.bubbleDisclaimer}>
                              * Análisis descriptivo. No constituye diagnóstico médico.
                            </Text>
                          </View>
                        </Animated.View>
                      )}

                      <View style={styles.sessionFooter}>
                        <Text style={styles.sessionStatus}>Participante: {item.participante_id}</Text>
                        <Text style={styles.sessionDate}>
                          📅 {new Date(item.timestamp || Date.now()).toLocaleString('es-CL', { 
                            day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' 
                          })}
                        </Text>
                      </View>
                    </View>
                  );
                })
              )}
            </View>
          )}

          {/* PESTAÑA DE COSTOS DINÁMICOS */}
          {activeTab === 'Costos y Nube' && (
            <View style={styles.tabContent}>
              <Text style={styles.cardHeaderTitle}>Estructura de Costos SaaS</Text>
              
              <View style={styles.costCard}>
                <Text style={styles.costTitle}>Costo Estimado por Sesión</Text>
                <Text style={styles.costAmount}>$0.000011 USD</Text>
                <Text style={styles.costDescription}>Basado en el pricing de AWS (Lambda + SQS + DynamoDB + S3 + API Gateway).</Text>
              </View>

              <View style={styles.costCard}>
                <Text style={styles.costTitle}>Costo Acumulado de Infraestructura</Text>
                <Text style={styles.costAmount}>
                  ${(totalSesiones * 0.000011).toFixed(6)} USD
                </Text>
                <Text style={styles.costDescription}>
                  Calculado sobre las {totalSesiones} sesiones registradas en tu base de datos.
                </Text>
              </View>

              <View style={styles.infoBox}>
                <Text style={styles.infoTitle}>Margen y Escalabilidad</Text>
                <Text style={styles.infoDetail}>• Costo Meta por Sesión: Máximo $0.02 USD</Text>
                <Text style={styles.infoDetail}>• Estado actual: 99.9% por debajo del límite</Text>
                <Text style={styles.infoDetail}>• Impacto: El costo variable es insignificante frente a la suscripción mensual del cliente.</Text>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Navbar Inferior */}
        <View style={styles.bottomNav}>
          {tabItems.map((item) => {
            const isActive = activeTab === item.key;
            return (
              <TouchableOpacity
                key={item.key}
                style={styles.navItem}
                onPress={() => setActiveTab(item.key)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={isActive ? item.iconActive : item.iconInactive}
                  size={22}
                  color={isActive ? '#38BDF8' : '#64748B'}
                />
                <Text style={[styles.navLabel, isActive && styles.navLabelActive]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: '#020617' },
  loadingContainer: { flex: 1, backgroundColor: '#020617', justifyContent: 'center', alignItems: 'center' },
  centerContent: { padding: 30, alignItems: 'center', justifyContent: 'center' },
  loadingText: { color: '#94A3B8', marginTop: 10, fontSize: 13 },
  
  errorBox: { backgroundColor: 'rgba(153, 27, 27, 0.3)', padding: 16, borderRadius: 10, borderWidth: 1, borderColor: '#EF4444' },
  errorTitle: { color: '#FCA5A5', fontWeight: 'bold', fontSize: 14 },
  errorText: { color: '#FECACA', fontSize: 12, marginTop: 4 },
  
  emptyCard: { backgroundColor: 'rgba(30, 41, 59, 0.4)', padding: 24, borderRadius: 10, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  emptyTitle: { color: '#E2E8F0', fontWeight: 'bold', fontSize: 14 },
  emptySubtitle: { color: '#94A3B8', fontSize: 12, textAlign: 'center', marginTop: 6 },
  
  scoreText: { color: '#4ADE80', fontSize: 12, fontWeight: '600', marginTop: 4 },

  header: { flexDirection: 'row', alignItems: 'center', padding: 20, backgroundColor: 'transparent', borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#F8FAFC' },
  headerSubtitle: { fontSize: 13, color: '#94A3B8', marginTop: 2 },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logoutButton: { padding: 8, borderRadius: 8, backgroundColor: 'rgba(239, 68, 68, 0.1)' },
  
  roleContainer: { paddingVertical: 12, paddingHorizontal: 16, backgroundColor: 'transparent', borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  sectionLabel: { fontSize: 12, color: '#94A3B8', fontWeight: '600', marginBottom: 6 },
  roleChip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, backgroundColor: 'rgba(30, 41, 59, 0.6)', marginRight: 8 },
  roleChipActive: { backgroundColor: '#0284C7' },
  roleText: { color: '#94A3B8', fontSize: 12, fontWeight: '500' },
  roleTextActive: { color: '#FFFFFF', fontWeight: 'bold' },
  
  content: { flex: 1, padding: 16 },
  scrollPadding: { paddingBottom: 20 },
  tabContent: { paddingBottom: 16 },
  cardHeaderTitle: { fontSize: 16, fontWeight: 'bold', color: '#F8FAFC', marginBottom: 12 },
  
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  card: { width: '48%', backgroundColor: 'rgba(15, 23, 42, 0.6)', padding: 14, borderRadius: 10, marginBottom: 12, borderWidth: 1, borderColor: 'rgba(56, 189, 248, 0.15)' },
  cardValue: { fontSize: 20, fontWeight: 'bold', color: '#38BDF8' },
  cardLabel: { fontSize: 11, color: '#94A3B8', marginTop: 4 },
  
  infoBox: { backgroundColor: 'rgba(15, 23, 42, 0.6)', padding: 16, borderRadius: 10, marginTop: 8, borderLeftWidth: 3, borderLeftColor: '#0EA5E9' },
  infoTitle: { fontSize: 14, fontWeight: 'bold', color: '#F8FAFC', marginBottom: 6 },
  infoDetail: { fontSize: 12, color: '#CBD5E1', marginTop: 2 },
  
  sessionCard: { position: 'relative', backgroundColor: 'rgba(15, 23, 42, 0.7)', padding: 14, borderRadius: 10, marginBottom: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  sessionCardExpanded: { zIndex: 100, elevation: 20 },
  sessionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sessionCode: { fontSize: 15, fontWeight: 'bold', color: '#F8FAFC', flex: 1, marginRight: 8 },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12, fontSize: 11, fontWeight: 'bold' },
  badgeEasy: { backgroundColor: 'rgba(22, 101, 52, 0.5)', color: '#4ADE80' },
  badgeHard: { backgroundColor: 'rgba(153, 27, 27, 0.5)', color: '#FCA5A5' },
  sessionSubText: { fontSize: 12, color: '#94A3B8', marginTop: 4 },
  sessionFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)' },
  sessionStatus: { fontSize: 11, color: '#38BDF8' },
  sessionDate: { fontSize: 11, color: '#64748B' },
  
  costCard: { backgroundColor: 'rgba(15, 23, 42, 0.6)', padding: 16, borderRadius: 10, marginBottom: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  costTitle: { fontSize: 14, fontWeight: '600', color: '#94A3B8' },
  costAmount: { fontSize: 22, fontWeight: 'bold', color: '#22C55E', marginVertical: 4 },
  costDescription: { fontSize: 12, color: '#64748B' },
  
  bottomNav: { flexDirection: 'row', backgroundColor: 'rgba(2, 6, 23, 0.8)', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)', paddingVertical: 8, paddingBottom: 16 },
  navItem: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  navLabel: { fontSize: 11, color: '#64748B', marginTop: 4, fontWeight: '500' },
  navLabelActive: { color: '#38BDF8', fontWeight: 'bold' },
  
  aiCardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  aiCardButtonText: {
    color: '#38BDF8',
    fontWeight: 'bold',
    fontSize: 12,
  },

  // --- BURBUJA IA: estilo de popoveer
  inlineBubbleContainer: {
    position: 'absolute',
    top: 42,
    right: 0,
    width: '92%',
    zIndex: 1000,
    elevation: 24,
  },
  inlineBubbleArrow: {
    position: 'absolute',
    top: -7,
    right: 28,
    width: 14,
    height: 14,
    backgroundColor: '#202D43',
    transform: [{ rotate: '45deg' }],
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.45)',
    zIndex: 2,
  },
  inlineBubbleContent: {
    backgroundColor: '#202D43',
    borderRadius: 18,
    borderTopRightRadius: 7,
    padding: 13,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.38)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.22,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 1,
  },
  bubbleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  bubbleTitle: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: 'bold',
  },
  bubbleSceneCard: {
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 2,
    borderLeftColor: '#38BDF8',
  },
  bubbleSceneTitle: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  bubbleSceneText: {
    color: '#E2E8F0',
    fontSize: 12,
    lineHeight: 18,
  },
  bubbleDisclaimer: {
    color: '#64748B',
    fontSize: 10,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 4,
  },
});
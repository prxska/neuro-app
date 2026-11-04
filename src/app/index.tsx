import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
// 1. IMPORT CORREGIDO: Usamos la librería de SafeArea para Android
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSessions } from '../hooks/useSessions';

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

  const [aiModalVisible, setAiModalVisible] = useState(false);
  const [loadingAI, setLoadingAI] = useState(false);

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

  const totalSesiones = sessions.length;
  const scorePromedio = totalSesiones > 0 
    ? Math.round(sessions.reduce((acc, s) => acc + (s.metricas?.score || 0), 0) / totalSesiones) 
    : 0;

  const getAiSummary = () => {
    return {
      title: `Análisis Ejecutivo - ${activeRole}`,
      metrics: [
        `• Sesiones procesadas en la nube: ${totalSesiones}`,
        `• Rendimiento cognitivo promedio: ${scorePromedio} pts`,
        '• Estado de la Arquitectura: 100% Serverless (AWS)',
        '• Cumplimiento: Aislamiento Multi-Tenant activo',
      ],
      insight: 'Sugerencia IA: La arquitectura asíncrona con SQS está absorbiendo correctamente los datos. Se recomienda seguir monitoreando la tasa de precisión.',
    };
  };

  const handleOpenAI = () => {
    setLoadingAI(true);
    setAiModalVisible(true);
    setTimeout(() => {
      setLoadingAI(false);
    }, 600);
  };

  const roles: UserRole[] = [
    'Admin Plataforma',
    'Admin Institución',
    'Especialista',
    'Auditor',
  ];

  const tabItems: TabItem[] = [
    { key: 'Métricas', label: 'Métricas', iconActive: 'stats-chart', iconInactive: 'stats-chart-outline' },
    { key: 'Sesiones VR', label: 'Sesiones VR', iconActive: 'headset', iconInactive: 'headset-outline' },
    { key: 'Costos y Nube', label: 'Costos/Nube', iconActive: 'cloudy', iconInactive: 'cloudy-outline' },
  ];

  const currentSummary = getAiSummary();

  if (isCheckingAuth) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#38BDF8" />
      </View>
    );
  }

  return (
    <View style={styles.mainContainer}>
      {/* FONDO GLOBAL: Azul marino muy oscuro */}
      <LinearGradient
        colors={['#0F172A', '#1E1B4B', '#020617']} 
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />

      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

        {/* Encabezado Superior */}
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>NeuroFlex VR</Text>
            <Text style={styles.headerSubtitle}>{userEmail || 'Plataforma SaaS'}</Text>
          </View>

          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.aiButton} onPress={handleOpenAI} activeOpacity={0.8}>
              <Text style={styles.aiButtonText}>IA</Text>
            </TouchableOpacity>
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
                  return (
                    <View key={item.session_id} style={styles.sessionCard}>
                      <View style={styles.sessionHeader}>
                        <Text style={styles.sessionCode}>{item.session_id}</Text>
                        <Text style={[styles.badge, isHard ? styles.badgeHard : styles.badgeEasy]}>
                          {item.scene_config_id || 'Nivel Base'}
                        </Text>
                      </View>
                      <Text style={styles.sessionSubText}>Experiencia: {item.experiencia || 'N/A'}</Text>
                      <Text style={styles.sessionSubText}>Duración: {item.duracion_seg ?? 0} segundos</Text>

                      {item.metricas?.score !== undefined && (
                        <Text style={styles.scoreText}>Puntaje Cognitivo: {item.metricas.score} pts</Text>
                      )}

                      {/* NUEVO: MOSTRAR RESUMEN DE LA IA */}
                      {item.metricas?.detalle_escenas?.[0]?.resumen_ia && (
                        <View style={styles.aiSummaryBox}>
                          <Text style={styles.aiSummaryText}>
                            🤖 {item.metricas.detalle_escenas[0].resumen_ia}
                          </Text>
                        </View>
                      )}

                      <View style={styles.sessionFooter}>
                        <Text style={styles.sessionStatus}>Participante: {item.participante_id}</Text>
                        
                        {/* NUEVO: FECHA Y HORA */}
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

      {/* Modal Desplegable de IA */}
      <Modal
        visible={aiModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setAiModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Desglose IA - {activeRole}</Text>
              <TouchableOpacity onPress={() => setAiModalVisible(false)}>
                <Ionicons name="close" size={22} color="#94A3B8" />
              </TouchableOpacity>
            </View>

            {loadingAI ? (
              <View style={styles.modalLoadingContainer}>
                <ActivityIndicator size="large" color="#38BDF8" />
                <Text style={styles.modalLoadingText}>Procesando métricas...</Text>
              </View>
            ) : (
              <ScrollView style={styles.modalBody}>
                <Text style={styles.summaryTitle}>{currentSummary.title}</Text>
                <View style={styles.metricsBox}>
                  {currentSummary.metrics.map((item, idx) => (
                    <Text key={idx} style={styles.metricItem}>{item}</Text>
                  ))}
                </View>
                <View style={styles.insightBox}>
                  <Ionicons name="bulb-outline" size={18} color="#38BDF8" style={{ marginRight: 8 }} />
                  <Text style={styles.insightText}>{currentSummary.insight}</Text>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
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
  
  aiSummaryBox: { backgroundColor: 'rgba(56, 189, 248, 0.1)', padding: 10, borderRadius: 8, marginTop: 10, borderLeftWidth: 3, borderLeftColor: '#38BDF8' },
  aiSummaryText: { fontSize: 12, color: '#E0F2FE', fontStyle: 'italic', lineHeight: 16 },

  header: { flexDirection: 'row', alignItems: 'center', padding: 20, backgroundColor: 'transparent', borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#F8FAFC' },
  headerSubtitle: { fontSize: 13, color: '#94A3B8', marginTop: 2 },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  aiButton: { backgroundColor: 'rgba(56, 189, 248, 0.1)', paddingHorizontal: 14, paddingVertical: 7, borderRadius: 8, borderWidth: 1, borderColor: '#38BDF8', justifyContent: 'center', alignItems: 'center' },
  aiButtonText: { color: '#38BDF8', fontWeight: 'bold', fontSize: 13 },
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
  
  sessionCard: { backgroundColor: 'rgba(15, 23, 42, 0.7)', padding: 14, borderRadius: 10, marginBottom: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  sessionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sessionCode: { fontSize: 15, fontWeight: 'bold', color: '#F8FAFC' },
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
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(2, 6, 23, 0.9)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { width: '100%', maxHeight: '80%', backgroundColor: '#0F172A', borderRadius: 16, borderWidth: 1, borderColor: '#38BDF8', padding: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { color: '#F8FAFC', fontSize: 16, fontWeight: 'bold' },
  modalLoadingContainer: { padding: 40, alignItems: 'center', gap: 12 },
  modalLoadingText: { color: '#94A3B8', fontSize: 14 },
  modalBody: { marginTop: 4 },
  summaryTitle: { color: '#38BDF8', fontSize: 15, fontWeight: 'bold', marginBottom: 12 },
  metricsBox: { backgroundColor: 'rgba(0,0,0,0.3)', padding: 14, borderRadius: 10, gap: 10, marginBottom: 16 },
  metricItem: { color: '#CBD5E1', fontSize: 13, lineHeight: 18 },
  insightBox: { flexDirection: 'row', backgroundColor: 'rgba(3, 105, 161, 0.15)', borderWidth: 1, borderColor: 'rgba(2, 132, 199, 0.5)', padding: 12, borderRadius: 10, alignItems: 'center' },
  insightText: { color: '#E0F2FE', fontSize: 13, flex: 1, lineHeight: 18 },
});
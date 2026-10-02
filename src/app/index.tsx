import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';

// --- Definición de Tipos e Interfaces ---
type UserRole = 'Admin Plataforma' | 'Admin Institución' | 'Especialista' | 'Auditor';
type TabType = 'Métricas' | 'Sesiones VR' | 'Costos y Nube';
type DifficultyLevel = 'Fácil' | 'Difícil';

interface SystemMetrics {
  instituciones: number;
  visoresSimultaneos: number;
  profesionalesSimultaneos: number;
  latenciaP95: string;
  disponibilidad: string;
  costoPorSesion: string;
  regionActiva: string;
  cumplimientoLey21719: string;
}

interface RecentSession {
  id: string;
  pacienteCodigo: string; // Código anónimo según Ley 21.719
  nivel: DifficultyLevel;
  scene_config_id: string; // Identificador de versión del escenario
  duracion: string;
  estado: 'Completado' | 'Sincronizado Offline' | 'En proceso';
  fecha: string;
  latencia: string;
}

export default function DashboardScreen() {
  const [activeRole, setActiveRole] = useState<UserRole>('Admin Plataforma');
  const [activeTab, setActiveTab] = useState<TabType>('Métricas');

  // Datos simulados alineados con los requerimientos de NeuroFlex VR
  const systemMetrics: SystemMetrics = {
    instituciones: 50,
    visoresSimultaneos: 842, // SLA: Soporte para 1.000 visores
    profesionalesSimultaneos: 265, // SLA: Soporte para 300 profesionales
    latenciaP95: '380 ms', // Requisito: < 500 ms en el 95% de los casos
    disponibilidad: '99.92%', // Requisito: >= 99.9%
    costoPorSesion: '$0.0094 USD', // Límite: hasta $0.02 USD por sesión
    regionActiva: 'sa-east-1 (São Paulo)',
    cumplimientoLey21719: '100% Cifrado KMS',
  };

  const roles: UserRole[] = [
    'Admin Plataforma',
    'Admin Institución',
    'Especialista',
    'Auditor',
  ];

  const recentSessions: RecentSession[] = [
    {
      id: 'SES-9081',
      pacienteCodigo: 'PAC-8842',
      nivel: 'Fácil',
      scene_config_id: 'SCENE_EASY_V1.2',
      duracion: '12 min',
      estado: 'Completado',
      fecha: '2026-10-01 14:30',
      latencia: '320 ms',
    },
    {
      id: 'SES-9082',
      pacienteCodigo: 'PAC-3109',
      nivel: 'Difícil',
      scene_config_id: 'SCENE_HARD_V1.0',
      duracion: '18 min',
      estado: 'Completado',
      fecha: '2026-10-01 14:45',
      latencia: '410 ms',
    },
    {
      id: 'SES-9083',
      pacienteCodigo: 'PAC-6521',
      nivel: 'Fácil',
      scene_config_id: 'SCENE_EASY_V1.2',
      duracion: '10 min',
      estado: 'Sincronizado Offline',
      fecha: '2026-10-01 15:10',
      latencia: '290 ms',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1A202C" />

      {/* Encabezado */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>NeuroFlex VR</Text>
        <Text style={styles.headerSubtitle}>Plataforma SaaS de Estimulación Cognitiva</Text>
      </View>

      {/* Selector de Rol de Usuario */}
      <View style={styles.roleContainer}>
        <Text style={styles.sectionLabel}>Rol Activo:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {roles.map((role) => (
            <TouchableOpacity
              key={role}
              style={[
                styles.roleChip,
                activeRole === role && styles.roleChipActive,
              ]}
              onPress={() => setActiveRole(role)}
            >
              <Text
                style={[
                  styles.roleText,
                  activeRole === role && styles.roleTextActive,
                ]}
              >
                {role}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Pestañas de Navegación */}
      <View style={styles.tabContainer}>
        {(['Métricas', 'Sesiones VR', 'Costos y Nube'] as TabType[]).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tabButton, activeTab === tab && styles.tabButtonActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Contenido Dinámico */}
      <ScrollView style={styles.content}>
        {activeTab === 'Métricas' && (
          <View style={styles.tabContent}>
            <Text style={styles.cardHeaderTitle}>Rendimiento Global y SLA</Text>

            <View style={styles.grid}>
              <View style={styles.card}>
                <Text style={styles.cardValue}>{systemMetrics.disponibilidad}</Text>
                <Text style={styles.cardLabel}>Disponibilidad (SLA &ge; 99.9%)</Text>
              </View>
              <View style={styles.card}>
                <Text style={styles.cardValue}>{systemMetrics.latenciaP95}</Text>
                <Text style={styles.cardLabel}>Latencia P95 (&lt; 500 ms)</Text>
              </View>
              <View style={styles.card}>
                <Text style={styles.cardValue}>{systemMetrics.visoresSimultaneos}</Text>
                <Text style={styles.cardLabel}>Visores Meta Quest 3</Text>
              </View>
              <View style={styles.card}>
                <Text style={styles.cardValue}>{systemMetrics.profesionalesSimultaneos}</Text>
                <Text style={styles.cardLabel}>Especialistas Conectados</Text>
              </View>
            </View>

            <View style={styles.infoBox}>
              <Text style={styles.infoTitle}>Aislamiento Multi-tenant y Celda</Text>
              <Text style={styles.infoDetail}>Región AWS: {systemMetrics.regionActiva}</Text>
              <Text style={styles.infoDetail}>Seguridad: {systemMetrics.cumplimientoLey21719}</Text>
              <Text style={styles.infoDetail}>Ley 21.719: Datos cifrados por institución con AWS KMS.</Text>
            </View>
          </View>
        )}

        {activeTab === 'Sesiones VR' && (
          <View style={styles.tabContent}>
            <Text style={styles.cardHeaderTitle}>Registro de Sesiones (Visor Quest 3)</Text>
            {recentSessions.map((session) => (
              <View key={session.id} style={styles.sessionCard}>
                <View style={styles.sessionHeader}>
                  <Text style={styles.sessionCode}>{session.pacienteCodigo}</Text>
                  <Text
                    style={[
                      styles.badge,
                      session.nivel === 'Fácil' ? styles.badgeEasy : styles.badgeHard,
                    ]}
                  >
                    Nivel {session.nivel}
                  </Text>
                </View>
                <Text style={styles.sessionSubText}>ID Versión: {session.scene_config_id}</Text>
                <Text style={styles.sessionSubText}>
                  Duración: {session.duracion} | Latencia: {session.latencia}
                </Text>
                <View style={styles.sessionFooter}>
                  <Text style={styles.sessionStatus}>Estado: {session.estado}</Text>
                  <Text style={styles.sessionDate}>{session.fecha}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {activeTab === 'Costos y Nube' && (
          <View style={styles.tabContent}>
            <Text style={styles.cardHeaderTitle}>Estructura de Costos Nube SaaS</Text>

            <View style={styles.costCard}>
              <Text style={styles.costTitle}>Suscripción Base</Text>
              <Text style={styles.costAmount}>USD $300 / mes</Text>
              <Text style={styles.costDescription}>Por institución (CESFAM, ELEAM o clínica)</Text>
            </View>

            <View style={styles.costCard}>
              <Text style={styles.costTitle}>Costo Nube por Institución</Text>
              <Text style={styles.costAmount}>USD $1.60 / mes</Text>
              <Text style={styles.costDescription}>Infraestructura Serverless en AWS</Text>
            </View>

            <View style={styles.costCard}>
              <Text style={styles.costTitle}>Costo Promedio por Sesión</Text>
              <Text style={styles.costAmount}>{systemMetrics.costoPorSesion}</Text>
              <Text style={styles.costDescription}>Meta del sistema: Máximo USD $0.02 / sesión</Text>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  header: {
    padding: 20,
    backgroundColor: '#1E293B',
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#38BDF8',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#94A3B8',
    marginTop: 2,
  },
  roleContainer: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#1E293B',
  },
  sectionLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
    marginBottom: 6,
  },
  roleChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#334155',
    marginRight: 8,
  },
  roleChipActive: {
    backgroundColor: '#0284C7',
  },
  roleText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '500',
  },
  roleTextActive: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#0F172A',
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  tabButtonActive: {
    borderBottomWidth: 3,
    borderBottomColor: '#38BDF8',
  },
  tabText: {
    color: '#64748B',
    fontSize: 13,
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#38BDF8',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  tabContent: {
    paddingBottom: 24,
  },
  cardHeaderTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#F8FAFC',
    marginBottom: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    backgroundColor: '#1E293B',
    padding: 14,
    borderRadius: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  cardValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#38BDF8',
  },
  cardLabel: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 4,
  },
  infoBox: {
    backgroundColor: '#1E293B',
    padding: 16,
    borderRadius: 10,
    marginTop: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#0EA5E9',
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#F8FAFC',
    marginBottom: 6,
  },
  infoDetail: {
    fontSize: 12,
    color: '#CBD5E1',
    marginTop: 2,
  },
  sessionCard: {
    backgroundColor: '#1E293B',
    padding: 14,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sessionCode: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#F8FAFC',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    fontSize: 11,
    fontWeight: 'bold',
  },
  badgeEasy: {
    backgroundColor: '#166534',
    color: '#4ADE80',
  },
  badgeHard: {
    backgroundColor: '#991B1B',
    color: '#FCA5A5',
  },
  sessionSubText: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 4,
  },
  sessionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  sessionStatus: {
    fontSize: 11,
    color: '#38BDF8',
  },
  sessionDate: {
    fontSize: 11,
    color: '#64748B',
  },
  costCard: {
    backgroundColor: '#1E293B',
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  costTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#94A3B8',
  },
  costAmount: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#22C55E',
    marginVertical: 4,
  },
  costDescription: {
    fontSize: 12,
    color: '#64748B',
  },
});
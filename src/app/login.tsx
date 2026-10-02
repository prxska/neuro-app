import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Svg, { Circle, Rect, Path } from 'react-native-svg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Por favor ingresa tu correo y contraseña');
      return;
    }

    setLoading(true);

    try {
      // Simulación de autenticación (Aquí luego conectarás AWS Cognito)
      const userSession = {
        email: email.trim(),
        role: 'Admin Plataforma',
        token: 'local-token-neuroflex-' + Date.now(),
        isLoggedIn: true,
      };

      // Guardar sesión en el almacenamiento local
      await AsyncStorage.setItem('user_session', JSON.stringify(userSession));

      // Redirigir al Dashboard principal
      router.replace('/');
    } catch (error) {
      Alert.alert('Error', 'No se pudo guardar la sesión local');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />

      <View style={styles.content}>
        {/* Logo / Encabezado */}
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            {/* Logo Vectorial SVG */}
            <Svg viewBox="0 0 120 120" width={70} height={70}>
              <Circle cx="60" cy="60" r="56" fill="#1E293B" stroke="#38BDF8" strokeWidth="2" />
              <Rect x="25" y="45" width="70" height="30" rx="12" fill="#0F172A" stroke="#38BDF8" strokeWidth="4" />
              <Path d="M 40 60 Q 60 40 80 60" fill="none" stroke="#0284C7" strokeWidth="4" strokeLinecap="round" />
              <Circle cx="45" cy="60" r="4" fill="#38BDF8" />
              <Circle cx="75" cy="60" r="4" fill="#38BDF8" />
            </Svg>
          </View>
          <Text style={styles.title}>NeuroFlex VR</Text>
          <Text style={styles.subtitle}>Acceso al Panel SaaS Institucional</Text>
        </View>

        {/* Formulario de Inicio de Sesión */}
        <View style={styles.form}>
          <Text style={styles.label}>Correo Electrónico</Text>
          <TextInput
            style={styles.input}
            placeholder="admin@neuroflex.cl"
            placeholderTextColor="#64748B"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={styles.label}>Contraseña</Text>
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            placeholderTextColor="#64748B"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity
            style={styles.button}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>Iniciar Sesión</Text>
            )}
          </TouchableOpacity>
        </View>


      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#38BDF8',
  },
  subtitle: {
    fontSize: 14,
    color: '#94A3B8',
    marginTop: 4,
  },
  form: {
    backgroundColor: '#1E293B',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  label: {
    fontSize: 12,
    color: '#CBD5E1',
    fontWeight: '600',
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    backgroundColor: '#0F172A',
    color: '#F8FAFC',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#334155',
    fontSize: 14,
  },
  button: {
    backgroundColor: '#0284C7',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 15,
  },
  footerNote: {
    textAlign: 'center',
    color: '#64748B',
    fontSize: 11,
    marginTop: 24,
  },
});
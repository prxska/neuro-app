
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';

import {
  ActivityIndicator,
  Alert,
  Animated,
  Easing,
  Image,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

// ==========================================
// CONFIGURACIÓN AWS COGNITO
// ==========================================

const COGNITO_REGION = 'us-east-1';
const COGNITO_CLIENT_ID = '6m7qlsodcm83ddcb3jcnp0hql6';

// ==========================================
// FONDO AURORA - OPTIMIZADO PARA ANDROID
// ==========================================

const AuroraBackground = () => {
  const opacity1 = useRef(new Animated.Value(0.65)).current;
  const opacity2 = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const animation1 = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity1, {
          toValue: 1,
          duration: 4500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(opacity1, {
          toValue: 0.35,
          duration: 4500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );

    const animation2 = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity2, {
          toValue: 0.85,
          duration: 5500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(opacity2, {
          toValue: 0.15,
          duration: 5500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );

    animation1.start();
    animation2.start();

    return () => {
      animation1.stop();
      animation2.stop();
    };
  }, [opacity1, opacity2]);

  return (
    <View
      pointerEvents="none"
      style={styles.backgroundContainer}
    >
      {/* BASE DEL FONDO */}
      <LinearGradient
        colors={[
          '#11152F',
          '#10172E',
          '#102A40',
        ]}
        locations={[0, 0.55, 1]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
      />

      {/* AURORA SUPERIOR MORADA */}
      <Animated.View
        style={[
          styles.topGlow,
          { opacity: opacity1 },
        ]}
      >
        <LinearGradient
          colors={[
            'rgba(82, 39, 255, 0.85)',
            'rgba(82, 39, 255, 0.45)',
            'rgba(82, 39, 255, 0.05)',
            'transparent',
          ]}
          locations={[0, 0.35, 0.7, 1]}
          start={{ x: 0.2, y: 0 }}
          end={{ x: 0.9, y: 1 }}
          style={styles.glowGradient}
        />
      </Animated.View>

      {/* AURORA INFERIOR ROSADA Y AZUL */}
      <Animated.View
        style={[
          styles.bottomGlow,
          { opacity: opacity2 },
        ]}
      >
        <LinearGradient
          colors={[
            'rgba(255, 159, 252, 0.55)',
            'rgba(120, 90, 255, 0.4)',
            'rgba(56, 189, 248, 0.55)',
            'transparent',
          ]}
          locations={[0, 0.35, 0.7, 1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.glowGradient}
        />
      </Animated.View>

      {/* ILUMINACIÓN AZUL ADICIONAL */}
      <View style={styles.blueGlow}>
        <LinearGradient
          colors={[
            'rgba(56, 189, 248, 0.22)',
            'transparent',
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.glowGradient}
        />
      </View>
    </View>
  );
};

// ==========================================
// PANTALLA DE LOGIN
// ==========================================

export default function LoginScreen() {
  const [email, setEmail] = useState('especialista@haba.test');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // ========================================
  // AUTENTICACIÓN AWS COGNITO
  // ========================================

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert(
        'Campos incompletos',
        'Por favor ingresa tu correo y contraseña.'
      );
      return;
    }

    if (loading) return;

    setLoading(true);

    console.log('1. Iniciando login para:', email);

    try {
      const response = await fetch(
        `https://cognito-idp.${COGNITO_REGION}.amazonaws.com/`,
        {
          method: 'POST',

          headers: {
            'X-Amz-Target':
              'AWSCognitoIdentityProviderService.InitiateAuth',

            'Content-Type':
              'application/x-amz-json-1.1',
          },

          body: JSON.stringify({
            AuthFlow: 'USER_PASSWORD_AUTH',

            ClientId: COGNITO_CLIENT_ID,

            AuthParameters: {
              USERNAME: email.trim(),
              PASSWORD: password,
            },
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.error('Error Cognito:', data);

        Alert.alert(
          'Error de autenticación',
          data.message ||
          data.Message ||
          data.__type ||
          'Credenciales incorrectas.'
        );

        return;
      }

      const accessToken =
        data.AuthenticationResult?.AccessToken;

      if (!accessToken) {
        Alert.alert(
          'Error de sesión',
          'No se obtuvo un Access Token válido de Cognito.'
        );

        return;
      }

      // GUARDAR SESIÓN
      const userSession = {
        email: email.trim(),
        role: 'Especialista',
        token: accessToken,
        isLoggedIn: true,
      };

      await AsyncStorage.setItem(
        'user_session',
        JSON.stringify(userSession)
      );

      console.log('2. Login exitoso');

      // REDIRIGIR AL PANEL
      router.replace('/');

    } catch (error: any) {
      console.error('ERROR CRÍTICO:', error);

      Alert.alert(
        'Error de conexión',
        error?.message ||
        'No fue posible conectar con el servidor.'
      );

    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // INTERFAZ
  // ========================================

  return (
    <View style={styles.container}>
   <StatusBar
        barStyle="light-content"
      />
      {/* FONDO AURORA */}
      <AuroraBackground />

      {/* CONTENIDO PRINCIPAL */}
      <SafeAreaView
        style={styles.contentContainer}
        edges={['top', 'bottom']}
      >
        <View style={styles.content}>

          {/* ENCABEZADO */}
          <View style={styles.header}>

            <View style={styles.iconContainer}>
              <Image
                source={require('../../assets/images/logo-neuroflex.webp')}
                style={styles.logoImage}
                resizeMode="contain"
              />
            </View>

            <Text style={styles.title}>
              NeuroFlex VR
            </Text>

            <Text style={styles.subtitle}>
              Acceso al Panel SaaS Institucional
            </Text>

          </View>

          {/* FORMULARIO */}
          <View style={styles.form}>

            <Text style={styles.label}>
              Correo Electrónico
            </Text>

            <TextInput
              style={styles.input}
              placeholder="especialista@haba.test"
              placeholderTextColor="#64748B"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
            />

            <Text style={styles.label}>
              Contraseña
            </Text>

            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor="#64748B"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              editable={!loading}
              onSubmitEditing={handleLogin}
              returnKeyType="done"
            />

            {/* BOTÓN LOGIN */}
            <TouchableOpacity
              style={[
                styles.button,
                loading && styles.buttonDisabled,
              ]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.buttonText}>
                  Iniciar Sesión
                </Text>
              )}
            </TouchableOpacity>

          </View>

        </View>
      </SafeAreaView>

    </View>
  );
}

// ==========================================
// ESTILOS
// ==========================================

const styles = StyleSheet.create({

  // CONTENEDOR GENERAL
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
    position: 'relative',
    overflow: 'hidden',
  },

  // ========================================
  // FONDO AURORA
  // ========================================

  backgroundContainer: {
    position: 'absolute',
    zIndex: 0,
    elevation: 0,
  },

  topGlow: {
    position: 'absolute',
    width: 540,
    height: 540,
    borderRadius: 270,
    top: -250,
    left: -150,
    overflow: 'hidden',
  },

  bottomGlow: {
    position: 'absolute',
    width: 540,
    height: 540,
    borderRadius: 270,
    bottom: -290,
    right: -270,
    overflow: 'hidden',
  },

  blueGlow: {
    position: 'absolute',
    width: 380,
    height: 380,
    borderRadius: 190,
    bottom: -180,
    left: -170,
    overflow: 'hidden',
  },

  glowGradient: {
    flex: 1,
    width: '100%',
    height: '100%',
  },

  // ========================================
  // CONTENIDO
  // ========================================

  contentContainer: {
    flex: 1,
    zIndex: 1,
    elevation: 1,
  },

  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 28,
  },

  header: {
    alignItems: 'center',
    marginBottom: 40,
  },

  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    marginTop: 40,
  },

  logoImage: {
    width: 200,
    height: 200,
  },

  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#38BDF8',
    letterSpacing: 0.5,
  },

  subtitle: {
    fontSize: 14,
    color: '#94A3B8',
    marginTop: 6,
    fontWeight: '500',
    textAlign: 'center',
  },

  // ========================================
  // FORMULARIO
  // ========================================

  form: {
    paddingHorizontal: 4,
    paddingVertical: 22,
    paddingTop: 28,
    borderRadius: 18,
    backgroundColor: 'rgba(30, 41, 59, 0.45)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },

  label: {
    fontSize: 13,
    color: '#CBD5E1',
    fontWeight: '600',
    marginBottom: 8,
    marginLeft: 4,
  },

  input: {
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    color: '#F8FAFC',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.2)',
  },

  // ========================================
  // BOTÓN
  // ========================================

  button: {
    backgroundColor: '#0284C7',
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,

    shadowColor: '#38BDF8',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },

  buttonDisabled: {
    opacity: 0.6,
  },

  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },

});

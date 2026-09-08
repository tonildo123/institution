import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useLoginLogic } from './useLoginLogic';
import styles from './styles';

/**
 * LoginScreen
 *
 * Pantalla de inicio de sesión
 * - Separa lógica (hooks) del renderizado
 * - Maneja validación de formulario
 * - Integración con Firebase Auth
 */

const LoginScreen = ({ navigation }: any) => {
  // 1️⃣ IMPORTS Y HOOKS - Toda la lógica aquí
  const {
    email,
    password,
    showPassword,
    emailError,
    passwordError,
    generalError,
    successMessage,
    isLoading,
    handleEmailChange,
    handlePasswordChange,
    handleLogin,
    setShowPassword,
    clearErrors,
  } = useLoginLogic();

  // 2️⃣ RENDERIZADO
  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Bienvenido</Text>
            <Text style={styles.subtitle}>Inicia sesión en tu cuenta</Text>
          </View>

          {/* Errores Generales */}
          {generalError && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>❌ {generalError}</Text>
            </View>
          )}

          {/* Mensaje de Éxito */}
          {successMessage && (
            <View style={styles.successContainer}>
              <Text style={styles.successText}>✅ {successMessage}</Text>
            </View>
          )}

          {/* Formulario */}
          <View style={styles.form}>
            {/* Email Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={[
                  styles.input,
                  emailError && styles.inputError,
                ]}
                placeholder="tu@email.com"
                placeholderTextColor="#999"
                value={email}
                onChangeText={handleEmailChange}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!isLoading}
                accessibilityLabel="Email input"
              />
              {emailError && (
                <Text style={styles.fieldErrorText}>{emailError}</Text>
              )}
            </View>

            {/* Password Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Contraseña</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={[
                    styles.passwordInput,
                    passwordError && styles.inputError,
                  ]}
                  placeholder="••••••••"
                  placeholderTextColor="#999"
                  value={password}
                  onChangeText={handlePasswordChange}
                  secureTextEntry={!showPassword}
                  editable={!isLoading}
                  accessibilityLabel="Password input"
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                  style={styles.showPasswordBtn}
                  accessibilityLabel="Toggle password visibility"
                >
                  <Text style={styles.showPasswordText}>
                    {showPassword ? '👁' : '👁‍🗨'}
                  </Text>
                </TouchableOpacity>
              </View>
              {passwordError && (
                <Text style={styles.fieldErrorText}>{passwordError}</Text>
              )}
            </View>

            {/* Forgot Password Link */}
            <TouchableOpacity
              onPress={() => navigation?.navigate('ForgotPassword')}
              disabled={isLoading}
              style={styles.forgotPasswordBtn}
            >
              <Text style={styles.forgotPasswordText}>
                ¿Olvidaste tu contraseña?
              </Text>
            </TouchableOpacity>
          </View>

          {/* Login Button */}
          <TouchableOpacity
            style={[
              styles.loginButton,
              isLoading && styles.loginButtonDisabled,
            ]}
            onPress={handleLogin}
            disabled={isLoading}
            activeOpacity={0.7}
            accessibilityLabel="Login button"
          >
            {isLoading ? (
              <ActivityIndicator size="large" color="#fff" />
            ) : (
              <Text style={styles.loginButtonText}>Iniciar Sesión</Text>
            )}
          </TouchableOpacity>

          {/* Signup Link */}
          <View style={styles.signupContainer}>
            <Text style={styles.signupText}>¿No tienes cuenta? </Text>
            <TouchableOpacity
              onPress={() => navigation?.navigate('SignUp')}
              disabled={isLoading}
            >
              <Text style={styles.signupLink}>Regístrate aquí</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default LoginScreen;

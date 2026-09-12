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
 * LoginScreen - SIMPLE
 *
 * Flujo:
 * 1. Ingresa email o DNI
 * 2. Ingresa contraseña
 * 3. Toca "Iniciar Sesión"
 * 4. Firebase detecta el rol automáticamente
 */

const LoginScreen = () => {
  const {
    credential,
    password,
    showPassword,
    credentialError,
    passwordError,
    generalError,
    isLoading,
    handleCredentialChange,
    handlePasswordChange,
    handleLogin,
    setShowPassword,
  } = useLoginLogic();

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
            <Text style={styles.title}>📚 Instituto</Text>
            <Text style={styles.subtitle}>Inicia sesión en tu cuenta</Text>
          </View>

          {/* Error General */}
          {generalError && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>❌ {generalError}</Text>
            </View>
          )}

          {/* Formulario */}
          <View style={styles.form}>
            {/* Email o DNI */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email o DNI</Text>
              <TextInput
                style={[
                  styles.input,
                  credentialError && styles.inputError,
                ]}
                placeholder="tu@email.com o 12345678"
                placeholderTextColor="#999"
                value={credential}
                onChangeText={handleCredentialChange}
                autoCapitalize="none"
                editable={!isLoading}
              />
              {credentialError && (
                <Text style={styles.fieldErrorText}>{credentialError}</Text>
              )}
            </View>

            {/* Contraseña */}
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
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                  style={styles.showPasswordBtn}
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
          </View>

          {/* Botón Login */}
          <TouchableOpacity
            style={[
              styles.loginButton,
              isLoading && styles.loginButtonDisabled,
            ]}
            onPress={handleLogin}
            disabled={isLoading}
            activeOpacity={0.7}
          >
            {isLoading ? (
              <ActivityIndicator size="large" color="#fff" />
            ) : (
              <Text style={styles.loginButtonText}>Iniciar Sesión</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default LoginScreen;

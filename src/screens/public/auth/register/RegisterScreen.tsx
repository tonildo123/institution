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
import { useRegisterLogic } from './useRegisterLogic';
import styles from './styles';

/**
 * RegisterScreen
 *
 * Pantalla de registro
 * - Separación lógica (hooks) y renderizado
 * - Validación de formulario
 * - Integración con Firebase Auth
 */

const RegisterScreen = ({ navigation }: any) => {
  // 1️⃣ IMPORTS Y HOOKS - Toda la lógica aquí
  const {
    displayName,
    email,
    password,
    passwordConfirm,
    showPassword,
    showPasswordConfirm,
    displayNameError,
    emailError,
    passwordError,
    passwordConfirmError,
    generalError,
    successMessage,
    isLoading,
    handleDisplayNameChange,
    handleEmailChange,
    handlePasswordChange,
    handlePasswordConfirmChange,
    handleRegister,
    setShowPassword,
    setShowPasswordConfirm,
  } = useRegisterLogic();

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
            <Text style={styles.title}>Crear Cuenta</Text>
            <Text style={styles.subtitle}>Únete a nuestra comunidad</Text>
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
            {/* Display Name Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nombre Completo</Text>
              <TextInput
                style={[styles.input, displayNameError && styles.inputError]}
                placeholder="Tu nombre completo"
                placeholderTextColor="#999"
                value={displayName}
                onChangeText={handleDisplayNameChange}
                editable={!isLoading}
              />
              {displayNameError && (
                <Text style={styles.fieldErrorText}>{displayNameError}</Text>
              )}
            </View>

            {/* Email Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={[styles.input, emailError && styles.inputError]}
                placeholder="tu@email.com"
                placeholderTextColor="#999"
                value={email}
                onChangeText={handleEmailChange}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!isLoading}
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
                  style={[styles.passwordInput, passwordError && styles.inputError]}
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

            {/* Password Confirm Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Confirmar Contraseña</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={[styles.passwordInput, passwordConfirmError && styles.inputError]}
                  placeholder="••••••••"
                  placeholderTextColor="#999"
                  value={passwordConfirm}
                  onChangeText={handlePasswordConfirmChange}
                  secureTextEntry={!showPasswordConfirm}
                  editable={!isLoading}
                />
                <TouchableOpacity
                  onPress={() => setShowPasswordConfirm(!showPasswordConfirm)}
                  disabled={isLoading}
                  style={styles.showPasswordBtn}
                >
                  <Text style={styles.showPasswordText}>
                    {showPasswordConfirm ? '👁' : '👁‍🗨'}
                  </Text>
                </TouchableOpacity>
              </View>
              {passwordConfirmError && (
                <Text style={styles.fieldErrorText}>{passwordConfirmError}</Text>
              )}
            </View>
          </View>

          {/* Register Button */}
          <TouchableOpacity
            style={[styles.registerButton, isLoading && styles.registerButtonDisabled]}
            onPress={handleRegister}
            disabled={isLoading}
            activeOpacity={0.7}
          >
            {isLoading ? (
              <ActivityIndicator size="large" color="#fff" />
            ) : (
              <Text style={styles.registerButtonText}>Crear Cuenta</Text>
            )}
          </TouchableOpacity>

          {/* Login Link */}
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>¿Ya tienes cuenta? </Text>
            <TouchableOpacity
              onPress={() => navigation?.navigate('Login')}
              disabled={isLoading}
            >
              <Text style={styles.loginLink}>Inicia sesión</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default RegisterScreen;

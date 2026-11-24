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
import { useForgotPasswordLogic } from './useForgotPasswordLogic';
import styles from './styles';

/**
 * ForgotPasswordScreen
 *
 * Pantalla de recuperación de contraseña (mismo diseño que el login)
 * - Envío de email de recuperación
 * - Mensaje de confirmación
 * - Solo se vuelve al login con el botón de arriba (sin acceso a crear cuenta)
 */

const ForgotPasswordScreen = ({ navigation }: any) => {
  // 1️⃣ HOOKS - Toda la lógica aquí
  const {
    email,
    emailError,
    generalError,
    successMessage,
    isLoading,
    handleEmailChange,
    handleSendReset,
  } = useForgotPasswordLogic();

  // 2️⃣ RENDERIZADO
  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Volver al login */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation?.goBack()}
            accessibilityRole="button"
            accessibilityLabel="Volver"
            hitSlop={8}
          >
            <Text style={styles.backButtonText}>← Volver</Text>
          </TouchableOpacity>

          {/* Encabezado */}
          <View style={styles.header}>
            <Text style={styles.title}>¿Olvidaste tu contraseña?</Text>
            <Text style={styles.subtitle}>
              Te enviaremos un email con instrucciones para recuperarla.
            </Text>
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
              <Text style={styles.successText}>{successMessage}</Text>
            </View>
          )}

          {/* Formulario */}
          {!successMessage && (
            <View>
              <Text style={styles.fieldLabel}>Email</Text>
              <TextInput
                style={[styles.input, emailError && styles.inputError]}
                placeholder="tu@email.com"
                placeholderTextColor="#9a9a9a"
                value={email}
                onChangeText={handleEmailChange}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
              />
              {emailError && (
                <Text style={styles.fieldErrorText}>{emailError}</Text>
              )}

              {/* Botón Enviar */}
              <TouchableOpacity
                style={[styles.sendButton, isLoading && styles.sendButtonDisabled]}
                onPress={handleSendReset}
                disabled={isLoading}
                accessibilityRole="button"
              >
                {isLoading ? (
                  <ActivityIndicator size="large" color="#fff" />
                ) : (
                  <Text style={styles.sendButtonText}>ENVIAR EMAIL</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ForgotPasswordScreen;

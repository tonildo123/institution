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
 * Pantalla de recuperación de contraseña
 * - Envío de email de recuperación
 * - Mensaje de confirmación
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
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header con botón atrás */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation?.goBack()}
          >
            <Text style={styles.backButtonText}>← Atrás</Text>
          </TouchableOpacity>

          {/* Main Content */}
          <View style={styles.header}>
            <Text style={styles.title}>¿Olvidaste tu contraseña?</Text>
            <Text style={styles.subtitle}>
              Te enviaremos un email con instrucciones para recuperarla
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
            <View style={styles.form}>
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

              {/* Send Reset Button */}
              <TouchableOpacity
                style={[styles.sendButton, isLoading && styles.sendButtonDisabled]}
                onPress={handleSendReset}
                disabled={isLoading}
                activeOpacity={0.7}
              >
                {isLoading ? (
                  <ActivityIndicator size="large" color="#fff" />
                ) : (
                  <Text style={styles.sendButtonText}>Enviar Email</Text>
                )}
              </TouchableOpacity>
            </View>
          )}

          {/* Spacer */}
          <View style={{ flex: 1 }} />

          {/* Footer Links */}
          <View style={styles.footer}>
            <TouchableOpacity onPress={() => navigation?.navigate('Login')}>
              <Text style={styles.footerLink}>Volver a Login</Text>
            </TouchableOpacity>
            <Text style={styles.separator}>•</Text>
            <TouchableOpacity onPress={() => navigation?.navigate('Register')}>
              <Text style={styles.footerLink}>Crear Cuenta</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ForgotPasswordScreen;

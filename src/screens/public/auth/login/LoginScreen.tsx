import React from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '@/navigation/AuthNavigator';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useLoginLogic } from './useLoginLogic';
import { styles } from './styles';

/**
 * LoginScreen - Diseño IMEP
 *
 * Flujo:
 * 1. Ingresa email o DNI
 * 2. Ingresa contraseña
 * 3. Toca "INICIAR SESIÓN"
 * 4. Firebase detecta el rol automáticamente
 */

const LoginScreen = ({ navigation }: NativeStackScreenProps<AuthStackParamList, 'Login'>) => {
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
    <SafeAreaView style={styles.safeContainer}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo IMEP */}
          <View style={styles.logoWrap}>
            <View style={styles.logoBars}>
              <View style={[styles.bar, styles.barI]}>
                <Text style={styles.barText}>I</Text>
              </View>
              <View style={[styles.bar, styles.barM]}>
                <Text style={styles.barText}>M</Text>
              </View>
              <View style={[styles.bar, styles.barE]}>
                <Text style={styles.barText}>E</Text>
              </View>
              <View style={[styles.bar, styles.barP]}>
                <Text style={styles.barText}>P</Text>
              </View>
            </View>

            <Text style={styles.tagline}>CONOCER, AMAR Y SERVIR</Text>

            <View style={styles.underline}>
              <View style={[styles.underlineBar, styles.barI]} />
              <View style={[styles.underlineBar, styles.barM]} />
              <View style={[styles.underlineBar, styles.barE]} />
              <View style={[styles.underlineBar, styles.barP]} />
            </View>
          </View>

          {/* Error General */}
          {generalError && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>❌ {generalError}</Text>
            </View>
          )}

          {/* Email o DNI */}
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Email o DNI</Text>
            <TextInput
              style={[styles.input, credentialError && styles.inputError]}
              placeholder="tu@email.com o 12345678"
              placeholderTextColor="#9a9a9a"
              value={credential}
              onChangeText={handleCredentialChange}
              autoCapitalize="none"
              editable={!isLoading}
            />
            {credentialError && (
              <Text style={styles.fieldErrorText}>{credentialError}</Text>
            )}
            <Text style={styles.fieldLabel}>Contraseña</Text>
            <View style={styles.passwordWrap}>
              <TextInput
                style={[styles.input, styles.passwordInput, passwordError && styles.inputError]}
                placeholder="••••••••"
                placeholderTextColor="#9a9a9a"
                value={password}
                onChangeText={handlePasswordChange}
                secureTextEntry={!showPassword}
                editable={!isLoading}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                disabled={isLoading}
                style={styles.eyeButton}
              >
                <Text style={styles.eyeIcon}>{showPassword ? '👁' : '👁'}</Text>
              </TouchableOpacity>
            </View>
            {passwordError && (
              <Text style={styles.fieldErrorText}>{passwordError}</Text>
            )}
          </View>


          <TouchableOpacity
            style={styles.forgotPasswordButton}
            accessibilityRole="button"
            onPress={() => navigation.navigate('ForgotPassword')}
            disabled={isLoading}
          >
            <Text style={styles.forgotPasswordText}>Olvidé mi contraseña</Text>
          </TouchableOpacity>

          {/* Botón Login */}
          <TouchableOpacity
            style={[styles.loginBtn, isLoading && styles.loginBtnDisabled]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="large" color="#fff" />
            ) : (
              <Text style={styles.loginBtnText}>INICIAR SESIÓN</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default LoginScreen;

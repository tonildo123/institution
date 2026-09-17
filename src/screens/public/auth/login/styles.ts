import { StyleSheet } from 'react-native';

/**
 * Estilos para LoginScreen - Diseño IMEP
 */

export const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#efeae2',
  },

  scrollContent: {
    paddingHorizontal: 40,
    paddingTop: 60,
    paddingBottom: 120,
    flexGrow: 1,
    justifyContent: 'space-between',
  },

  // Logo
  logoWrap: {
    alignItems: 'center',
    marginBottom: 60,
  },

  logoBars: {
    flexDirection: 'row',
    height: 118,
    marginBottom: 16,
  },

  bar: {
    width: 46,
    alignItems: 'center',
    justifyContent: 'center',
  },

  barI: {
    backgroundColor: '#d32b26',
  },

  barM: {
    backgroundColor: '#e39a0c',
  },

  barE: {
    backgroundColor: '#1f9d55',
  },

  barP: {
    backgroundColor: '#3266ad',
  },

  barText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 46,
    fontFamily: 'Georgia',
  },

  tagline: {
    color: '#2b2b2b',
    fontSize: 14,
    letterSpacing: 6,
    marginTop: 10,
    fontWeight: '600',
  },

  underline: {
    flexDirection: 'row',
    width: '100%',
    height: 4,
    marginTop: 10,
    gap: 0,
  },

  underlineBar: {
    flex: 1,
  },

  // Fields
  field: {
    marginBottom: 16,
  },

  fieldLabel: {
    color: '#1f1f1f',
    fontSize: 22,
    fontWeight: '700',
    marginVertical: 14,
    
  },

  input: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 18,
    fontSize: 16,
    color: '#333',
    borderWidth: 0,
  },

  passwordInput: {
    letterSpacing: 4,
    paddingRight: 50,
  },

  inputError: {
    borderWidth: 1,
    borderColor: '#d32b26',
  },

  passwordWrap: {
    position: 'relative',
  },

  eyeButton: {
    position: 'absolute',
    right: 18,
    top: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },

  eyeIcon: {
    fontSize: 22,
    color: '#8a8a8a',
  },

  fieldErrorText: {
    color: '#d32b26',
    fontSize: 12,
    marginTop: 8,
  },

  // Error Container
  errorContainer: {
    backgroundColor: '#fff0f0',
    borderLeftWidth: 4,
    borderLeftColor: '#d32b26',
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 20,
    borderRadius: 6,
  },

  errorText: {
    color: '#c62828',
    fontSize: 14,
    fontWeight: '500',
  },

  // Login Button
  loginBtn: {
    width: '100%',
    backgroundColor: '#0b6b57',
    borderRadius: 8,
    paddingVertical: 20,
    alignItems: 'center',
    marginTop: 10,
  },

  loginBtnDisabled: {
    opacity: 0.6,
  },

  loginBtnText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
    letterSpacing: 1,
  },
});

import { StyleSheet } from 'react-native';

/**
 * Estilos para RegisterScreen
 */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },

  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 40,
    justifyContent: 'center',
  },

  // Header
  header: {
    marginBottom: 30,
    alignItems: 'center',
  },

  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 14,
    color: '#666',
  },

  // Mensajes
  errorContainer: {
    backgroundColor: '#fee',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#f33',
  },

  errorText: {
    color: '#c00',
    fontSize: 13,
    fontWeight: '500',
  },

  successContainer: {
    backgroundColor: '#efe',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#0a0',
  },

  successText: {
    color: '#060',
    fontSize: 13,
    fontWeight: '500',
  },

  // Formulario
  form: {
    marginBottom: 24,
  },

  inputGroup: {
    marginBottom: 16,
  },

  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },

  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1a1a1a',
  },

  inputError: {
    borderColor: '#f33',
    backgroundColor: '#fff5f5',
  },

  fieldErrorText: {
    color: '#f33',
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },

  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingRight: 8,
  },

  passwordInput: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1a1a1a',
  },

  showPasswordBtn: {
    padding: 8,
  },

  showPasswordText: {
    fontSize: 16,
  },

  // Register Button
  registerButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },

  registerButtonDisabled: {
    opacity: 0.6,
  },

  registerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },

  // Login Link
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },

  loginText: {
    fontSize: 13,
    color: '#666',
  },

  loginLink: {
    fontSize: 13,
    color: '#007AFF',
    fontWeight: '700',
  },
});

export default styles;

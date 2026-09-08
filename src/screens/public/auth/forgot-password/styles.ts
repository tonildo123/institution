import { StyleSheet } from 'react-native';

/**
 * Estilos para ForgotPasswordScreen
 */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },

  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },

  // Back Button
  backButton: {
    marginBottom: 20,
  },

  backButtonText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
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
    marginBottom: 12,
  },

  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
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
    paddingVertical: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#0a0',
  },

  successText: {
    color: '#060',
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
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

  // Send Button
  sendButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },

  sendButtonDisabled: {
    opacity: 0.6,
  },

  sendButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },

  // Footer
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
  },

  footerLink: {
    fontSize: 13,
    color: '#007AFF',
    fontWeight: '600',
    marginHorizontal: 12,
  },

  separator: {
    fontSize: 13,
    color: '#ccc',
  },
});

export default styles;

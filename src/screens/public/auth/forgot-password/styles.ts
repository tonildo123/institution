import { StyleSheet } from 'react-native';

/**
 * Estilos para ForgotPasswordScreen - Diseño IMEP (mismos colores y medidas que el login)
 */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#efeae2',
  },

  flex: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 40,
    paddingTop: 24,
    paddingBottom: 120,
  },

  // Volver
  backButton: {
    alignSelf: 'flex-start',
    paddingVertical: 12,
    marginBottom: 24,
  },

  backButtonText: {
    color: '#0c6b58',
    fontSize: 16,
    fontWeight: '600',
  },

  // Encabezado
  header: {
    marginBottom: 32,
  },

  title: {
    color: '#1f1f1f',
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 12,
  },

  subtitle: {
    color: '#5a5a5a',
    fontSize: 16,
    lineHeight: 22,
  },

  // Mensajes
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

  successContainer: {
    backgroundColor: '#e6f2ee',
    borderLeftWidth: 4,
    borderLeftColor: '#0c6b58',
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 20,
    borderRadius: 6,
  },

  successText: {
    color: '#0b5a49',
    fontSize: 15,
    fontWeight: '500',
    lineHeight: 21,
  },

  // Campo
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

  inputError: {
    borderWidth: 1,
    borderColor: '#d32b26',
  },

  fieldErrorText: {
    color: '#d32b26',
    fontSize: 12,
    marginTop: 8,
  },

  // Botón Enviar (igual al de iniciar sesión)
  sendButton: {
    width: '100%',
    backgroundColor: '#0b6b57',
    borderRadius: 8,
    paddingVertical: 20,
    alignItems: 'center',
    marginTop: 28,
  },

  sendButtonDisabled: {
    opacity: 0.6,
  },

  sendButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
    letterSpacing: 1,
  },
});

export default styles;

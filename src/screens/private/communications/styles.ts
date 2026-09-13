import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    marginTop: 40,
    flex: 1,
    backgroundColor: '#f0f0f0',
  },

  // Form Styles
  formContainer: {
    padding: 16,
    backgroundColor: '#fff',
    flex: 1,
  },

  formTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 20,
    color: '#1a1a1a',
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
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1a1a1a',
  },

  textArea: {
    textAlignVertical: 'top',
  },

  attachButton: {
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  attachButtonText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },

  sendButton: {
    backgroundColor: '#25D366',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 20,
  },

  sendButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },

  // Message List Styles (WhatsApp style)
  listContent: {
    paddingVertical: 8,
  },

  messageCard: {
    backgroundColor: '#fff',
    marginHorizontal: 8,
    marginVertical: 4,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#25D366',
    marginBottom: 2,
  },

  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },

  messageSender: {
    fontSize: 13,
    fontWeight: '600',
    color: '#25D366',
  },

  messageTime: {
    fontSize: 12,
    color: '#999',
  },

  messageTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },

  messageDescription: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
    marginBottom: 6,
  },

  attachment: {
    fontSize: 16,
    marginTop: 4,
  },
});

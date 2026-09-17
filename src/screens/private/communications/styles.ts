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

  // Send Screen Styles
  sendHeader: {
    backgroundColor: '#A8E6C1',
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
  },

  sendHeaderTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },

  sendContent: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },

  alertBox: {
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    marginBottom: 12,
  },

  selectorContainer: {
    marginBottom: 16,
    gap: 8,
  },

  levelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderLeftWidth: 6,
    marginBottom: 8,
  },

  levelButtonActive: {
    backgroundColor: '#f0f0f0',
  },

  levelColorBox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    marginRight: 12,
  },

  levelText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },

  levelCheckmark: {
    fontSize: 18,
    color: '#25D366',
    fontWeight: '700',
  },

  headerBox: {
    backgroundColor: '#A8E6C1',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 12,
  },

  headerBoxTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },

  inputContainer: {
    marginBottom: 12,
  },

  titleInput: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1a1a1a',
  },

  descriptionInput: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#1a1a1a',
    textAlignVertical: 'top',
  },

  charCount: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
    paddingHorizontal: 4,
  },

  buttonsContainer: {
    marginVertical: 16,
    gap: 10,
  },

  confirmButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
  },

  confirmMessageButton: {
    backgroundColor: '#fff',
  },

  confirmDestinationButton: {
    backgroundColor: '#fff',
  },

  confirmButtonIcon: {
    fontSize: 18,
    marginRight: 8,
  },

  confirmButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1a1a1a',
  },

  sendButton: {
    flexDirection: 'row',
    backgroundColor: '#A8E6C1',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },

  sendButtonIcon: {
    fontSize: 18,
    marginRight: 8,
  },

  sendButtonText: {
    color: '#1a1a1a',
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

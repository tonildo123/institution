import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  messageComposer: { flexDirection: 'row', alignItems: 'center', marginBottom: 40 },
  composerInput: { flex: 1, minWidth: 0 },
  composerIconButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  composerIcon: { fontSize: 28, color: '#0c6b58' },
  formatHint: { fontSize: 12, color: '#59645E', marginHorizontal: 12, marginBottom: 6 },
  formatPreview: { padding: 12, marginBottom: 8, backgroundColor: '#fff', borderRadius: 8 },
  previewText: { fontSize: 15, lineHeight: 21, color: '#111' },
  container: {
    
    flex: 1,
    backgroundColor: '#f0f0f0',
  },

  // Chat Styles
  chatContainer: {
    marginTop: 40,
    flex: 1,
    backgroundColor: '#efeae2',
    display: 'flex',
    flexDirection: 'column',
  },

  chatContainerWithHeader: {
    
    flex: 1,
    backgroundColor: '#efeae2',
    display: 'flex',
    flexDirection: 'column',
  },

  // Chat Header
  chatHeader: {
    backgroundColor: '#0c6b58',
    paddingHorizontal: 16,
    paddingVertical: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },

  headerBackArrow: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
  },

  headerAvatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },

  avatarBadge: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },

  avatarBars: {
    flexDirection: 'row',
    gap: 1.5,
    marginBottom: 1,
  },

  avatarBar: {
    width: 3,
    height: 8,
  },

  avatarBadgeText: {
    color: '#fff',
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.5,
  },

  headerText: {
    flex: 1,
  },

  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },

  headerSub: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 13,
    marginTop: 2,
  },

  headerMenuDots: {
    color: '#fff',
    fontSize: 20,
    letterSpacing: 2,
  },

  chatMessages: {
    flex: 1,
    paddingHorizontal: 18,
    paddingVertical: 24,
  },

  messageRow: {
    marginBottom: 14,
  },

  chatBubble: {
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  sentBubble: {
    backgroundColor: '#b6f2c1',
    alignSelf: 'flex-end',
    maxWidth: '82%',
    borderTopRightRadius: 2,
  },

  receivedBubble: {
    backgroundColor: '#ffffff',
    alignSelf: 'flex-start',
    borderTopLeftRadius: 2,
  },

  bubbleText: {
    fontSize: 17,
    color: '#111',
    flex: 1,
    lineHeight: 22,
  },

  bubbleIcon: {
    fontSize: 18,
    flexShrink: 0,
  },

  levelSwatch: {
    width: 20,
    height: 26,
    borderRadius: 4,
    flexShrink: 0,
  },

  chevron: {
    fontSize: 15,
    color: '#29b6d8',
    flexShrink: 0,
  },

  // Input Bar
  inputBar: {
    backgroundColor: '#efeae2',
    paddingHorizontal: 12,
    paddingVertical: 18,
    paddingBottom: 24,
  },

  inputPill: {
    backgroundColor: '#ffffff',
    borderRadius: 26,
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },

  inputEmoji: {
    fontSize: 20,
    color: '#8a8a8a',
  },

  inputField: {
    flex: 1,
    fontSize: 16,
    color: '#111',
    padding: 0,
  },

  inputClip: {
    fontSize: 18,
    color: '#6b6b6b',
    transform: [{ rotate: '15deg' }],
  },

  inputCam: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#6f6f6f',
    justifyContent: 'center',
    alignItems: 'center',
  },

  inputCamIcon: {
    fontSize: 14,
    color: '#fff',
  },

  // Input Bubbles
  titleInputBubble: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: '#111',
    marginHorizontal: 0,
  },

  descriptionInputBubble: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: '#111',
    textAlignVertical: 'top',
  },

  // Send Button
  sendButtonBar: {
    backgroundColor: '#efeae2',
    paddingHorizontal: 18,
    paddingVertical: 16,
    paddingBottom: 24,
  },

  sendButtonChat: {
    backgroundColor: '#A8E6C1',
    borderRadius: 8,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },

  sendButtonChatIcon: {
    width: 26,
    height: 26,
    tintColor: '#000',
  },

  sendButtonChatText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111',
  },

  // Legacy styles (kept for backward compatibility)
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

  // Message List Styles
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

  // Receive Header (Lista de niveles)
  receiveHeader: {
    backgroundColor: '#0c6b58',
    paddingHorizontal: 16,
    paddingVertical: 18,
  },

  receiveHeaderTitle: {
    color: '#fff',
    fontSize: 26,
    fontWeight: '700',
  },

  // Level Row
  levelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.06)',
    backgroundColor: '#fff',
  },

  levelAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },

  levelAvatarText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },

  levelInfo: {
    flex: 1,
  },

  levelTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 4,
  },

  levelName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#111',
  },

  levelTime: {
    fontSize: 12.5,
    color: '#8a8a8a',
    flexShrink: 0,
  },

  levelTimeUnread: {
    color: '#0c6b58',
    fontWeight: '700',
  },

  levelBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  levelPreview: {
    fontSize: 14.5,
    color: '#6b6b6b',
    flex: 1,
  },

  levelBadge: {
    backgroundColor: '#0c6b58',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 20,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
    marginLeft: 8,
  },

  levelBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },

  levelListContent: {
    backgroundColor: '#fff',
  },
});

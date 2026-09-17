import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#efeae2',
  },

  // Header
  header: {
    backgroundColor: '#d21f1a',
    paddingHorizontal: 16,
    paddingVertical: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },

  backArrow: {
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
  },

  avatarBadge: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  avatarBars: {
    flexDirection: 'row',
    gap: 1.5,
    marginBottom: 2,
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

  menuDots: {
    color: '#fff',
    fontSize: 20,
    letterSpacing: 2,
  },

  // Chat Area
  chatArea: {
    flex: 1,
    paddingHorizontal: 18,
    paddingVertical: 24,
  },

  // Notice Card
  noticeCard: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 20,
    marginBottom: 16,
  },

  noticeContent: {
    fontSize: 16,
    lineHeight: 24,
    color: '#111',
    marginBottom: 12,
    fontWeight: '500',
  },

  leerMas: {
    color: '#d21f1a',
    fontWeight: '700',
    fontSize: 14,
  },

  // Confirmation
  confirmationRow: {
    justifyContent: 'flex-end',
    marginBottom: 16,
  },

  confirmationBubble: {
    backgroundColor: '#b6f2c1',
    borderRadius: 8,
    paddingHorizontal: 18,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    maxWidth: '82%',
  },

  checkmark: {
    fontSize: 18,
    color: '#111',
    fontWeight: '700',
  },

  confirmationText: {
    fontSize: 16,
    color: '#111',
    fontWeight: '600',
  },

  // Stats Bar
  statsBar: {
    backgroundColor: '#efeae2',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },

  statsText: {
    fontSize: 14,
    color: '#1a1a1a',
    fontWeight: '600',
  },
});

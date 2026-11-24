import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#efeae2',
  },

  // Header
  header: {
    backgroundColor: '#0c6b58',
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

  // Ícono de IMEP (icon_round.png ya trae el círculo blanco)
  headerAvatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
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
  },

  chatContent: {
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

  noticeTitle: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '500',
    color: '#111',
    marginBottom: 12,
  },

  noticeContent: {
    fontSize: 16,
    lineHeight: 24,
    color: '#111',
    marginBottom: 12,
    fontWeight: '500',
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

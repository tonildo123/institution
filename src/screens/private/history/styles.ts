import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  header: { backgroundColor: '#0c6b58', paddingLeft: 16, paddingRight: 8, paddingVertical: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#fff' },
  searchButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  searchIcon: { width: 20, height: 20 },
  searchCircle: { width: 13, height: 13, borderRadius: 7, borderWidth: 1.6, borderColor: '#fff' },
  searchHandle: { position: 'absolute', left: 11, top: 13, width: 7, height: 1.6, backgroundColor: '#fff', transform: [{ rotate: '45deg' }] },
  closeSearch: { fontSize: 28, color: '#fff' },
  searchContainer: { paddingHorizontal: 16, paddingBottom: 12, backgroundColor: '#0c6b58' },
  searchInput: { backgroundColor: '#fff', borderRadius: 22, paddingHorizontal: 16, paddingVertical: 10, minHeight: 44, fontSize: 14, color: '#202B3B' },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },

  listContent: {
    paddingHorizontal: 8,
    paddingVertical: 8,
  },

  communicationItem: {
    backgroundColor: '#fff',
    marginHorizontal: 8,
    marginVertical: 8,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },

  communicationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 6,
  },

  communicationDate: {
    fontSize: 12,
    color: '#999',
  },

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

  // Legacy styles (kept for compatibility)
  historyItem: {
    backgroundColor: '#fff',
    marginHorizontal: 8,
    marginVertical: 6,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },

  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },

  titleContainer: {
    flex: 1,
    marginRight: 12,
  },

  itemTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 4,
  },

  itemRecipient: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '500',
  },

  itemDate: {
    fontSize: 12,
    color: '#999',
    fontWeight: '500',
  },

  itemDescription: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
    marginBottom: 10,
  },

  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },

  statusLabel: {
    fontSize: 12,
    fontWeight: '600',
  },

  detailsButton: {
    paddingHorizontal: 8,
  },

  detailsButtonText: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '600',
  },

  // Styles for level-based message display (matching CommunicationsScreen)
  levelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },

  levelAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
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

  levelListContent: {
    paddingVertical: 8,
  },
});

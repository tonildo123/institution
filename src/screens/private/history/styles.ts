import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
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

import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 40,
    backgroundColor: '#f0f0f0',
  },

  listContent: {
    paddingVertical: 8,
  },

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
});

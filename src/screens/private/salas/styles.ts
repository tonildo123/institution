import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
  cursoButton: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    marginTop: 8, marginLeft: 16, padding: 14, borderRadius: 8,
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },

  content: {
    padding: 16,
    gap: 12,
  },

  salaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },

  colorBox: {
    width: 40,
    height: 40,
    borderRadius: 8,
    marginRight: 16,
  },

  salaLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },

  dropdown: {
    fontSize: 14,
    color: '#00A8E8',
    fontWeight: '700',
  },

  // Modal styles
  modalContent: {
    flex: 1,
    backgroundColor: '#fff',
    marginTop: 40,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
  },

  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },

  modalTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
  },

  closeButton: {
    fontSize: 24,
    color: '#999',
  },

  searchInput: {
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1a1a1a',
    marginBottom: 16,
  },

  usersInSalaContainer: {
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },

  usersInSalaTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },

  usersList: {
    gap: 8,
  },

  userItem: {
    backgroundColor: '#f9f9f9',
    padding: 10,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#25D366',
  },

  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
  },

  userEmail: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },

  userDni: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },

  searchResultsContainer: {
    flex: 1,
  },

  searchResultsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },

  noResultsText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    paddingVertical: 20,
  },

  userSearchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#eee',
  },

  userSearchInfo: {
    flex: 1,
  },

  userSearchName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
  },

  userSearchEmail: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },

  userSearchDni: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },

  addButton: {
    fontSize: 20,
    fontWeight: '700',
    color: '#007AFF',
    paddingHorizontal: 12,
  },
});

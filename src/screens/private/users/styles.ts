import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ECE6DE' },
  header: { backgroundColor: '#0c6b58', paddingHorizontal: 16, paddingVertical: 16, flexDirection: 'row', alignItems: 'center', gap: 8 },
  backButton: { minWidth: 24, minHeight: 40, justifyContent: 'center' },
  backText: { color: '#fff', fontSize: 30 },
  headerTitle: { flex: 1, fontSize: 18, fontWeight: '700', color: '#fff' },
  addButton: { backgroundColor: '#fff', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  addButtonText: { color: '#D92323', fontWeight: '700', fontSize: 13 },
  statsContainer: { flexDirection: 'row', paddingHorizontal: 8, paddingVertical: 15, backgroundColor: '#fff' },
  statItem: { flex: 1, alignItems: 'center', borderRightWidth: StyleSheet.hairlineWidth, borderRightColor: '#EEE' },
  statNumber: { fontSize: 22, fontWeight: '700', color: '#D92323' },
  statLabel: { fontSize: 12, color: '#85858F', marginTop: 2 },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 24, marginHorizontal: 16, marginTop: 12, marginBottom: 8, paddingHorizontal: 16 },
  searchInput: { flex: 1, minHeight: 40, paddingVertical: 8, paddingHorizontal: 8, fontSize: 14, color: '#202B3B' },
  searchIcon: { width: 16, height: 16 },
  searchCircle: { width: 11, height: 11, borderWidth: 1.5, borderColor: '#949BA5', borderRadius: 6 },
  searchHandle: { position: 'absolute', left: 10, top: 10, width: 6, height: 1.5, backgroundColor: '#949BA5', transform: [{ rotate: '45deg' }] },
  listContent: { paddingHorizontal: 12, paddingBottom: 20 },
  userCard: { backgroundColor: '#fff', marginVertical: 5, paddingHorizontal: 14, paddingVertical: 12, borderRadius: 16, flexDirection: 'row', alignItems: 'center', gap: 6 },
  userInfo: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#EEECEA', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  avatarHead: { width: 8, height: 8, borderRadius: 4, borderWidth: 1.5, borderColor: '#949BA5', marginBottom: 2 },
  avatarShoulders: { width: 16, height: 8, borderWidth: 1.5, borderBottomWidth: 0, borderTopLeftRadius: 8, borderTopRightRadius: 8, borderColor: '#949BA5' },
  userDetails: { flex: 1 },
  userName: { fontSize: 15, fontWeight: '700', color: '#202B3B', marginBottom: 4 },
  badgeContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  roleBadge: { paddingHorizontal: 9, paddingVertical: 2, borderRadius: 12 },
  roleBadgeText: { fontSize: 11, fontWeight: '700' },
  statusBadge: { paddingHorizontal: 9, paddingVertical: 2, borderRadius: 12 },
  statusBadgeText: { fontSize: 11, fontWeight: '700' },
  actions: { flexDirection: 'row', gap: 6 },
  actionButton: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#F5F4F2', justifyContent: 'center', alignItems: 'center' },
  deleteButton: { backgroundColor: '#F5F4F2' },
  actionButtonText: { fontSize: 22, color: '#536073' },
  trashLid: { width: 12, height: 2, backgroundColor: '#D92323', marginBottom: 2 },
  trashBody: { width: 8, height: 10, borderWidth: 1.3, borderColor: '#D92323', borderBottomLeftRadius: 2, borderBottomRightRadius: 2, alignSelf: 'center' },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },

  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 16,
  },

  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
  },

  closeButton: {
    fontSize: 24,
    color: '#999',
  },

  formContainer: {
    maxHeight: '80%',
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

  roleButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  roleButton: {
    width: '48%',
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    alignItems: 'center',
  },

  roleButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },

  roleButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },

  roleButtonActiveText: {
    color: '#fff',
  },

  toggleButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },

  toggleButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12,
  },

  saveButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 20,
  },

  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});

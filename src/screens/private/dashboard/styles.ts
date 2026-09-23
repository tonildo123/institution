import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },

  // Header
  header: {
    backgroundColor: '#0c6b58',
    paddingHorizontal: 20,
    paddingVertical: 30,
    alignItems: 'center',
  },

  welcomeTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 12,
    textAlign: 'center',
  },

  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },

  userRole: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },

  // Description
  descriptionContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#fff',
    marginHorizontal: 12,
    marginVertical: 12,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#667eea',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },

  // Contenido
  contentContainer: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },

  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 16,
  },

  menuItem: {
    paddingVertical: 14,
    paddingHorizontal: 14,
    marginBottom: 10,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#667eea',
  },

  menuItemText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1a1a1a',
  },

  // Logout Button
  logoutButton: {
    marginHorizontal: 20,
    marginVertical: 20,
    paddingVertical: 14,
    backgroundColor: '#e74c3c',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#e74c3c',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },

  logoutButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
});

export default styles;

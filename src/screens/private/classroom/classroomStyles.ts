import { StyleSheet } from 'react-native';

/** Paleta propia de Classroom (morado), distinta de Mensajes (verde). */
export const classroomColors = {
  primary: '#5B4FBF',
  primaryText: '#4B3FA8',
  surface: '#ECE9F8',
  pill: '#DDD8F7',
  pillText: '#3F3592',
  border: '#C9C2F0',
  card: '#FFFFFF',
  muted: '#6B6790',
};

export const classroomStyles = StyleSheet.create({
  // Recepción (familia)
  surface: { flex: 1, backgroundColor: classroomColors.surface },
  sectionLabel: { fontSize: 12, fontWeight: '700', letterSpacing: 1, color: classroomColors.primaryText, paddingHorizontal: 20, paddingTop: 16, paddingBottom: 10 },
  card: {
    flexDirection: 'row', backgroundColor: classroomColors.card, borderRadius: 16, marginHorizontal: 16, marginBottom: 12, padding: 14,
    shadowColor: '#2b2470', shadowOpacity: 0.08, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  cardAvatar: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  cardBody: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#1d1a33' },
  cardDate: { fontSize: 12, color: classroomColors.muted, marginTop: 2 },
  cardTag: { alignSelf: 'flex-start', borderWidth: 1, borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2, marginTop: 8 },
  cardTagText: { fontSize: 11, fontWeight: '700' },
  dueChip: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', gap: 6, backgroundColor: classroomColors.pill, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4, marginTop: 8 },
  dueChipText: { fontSize: 12, fontWeight: '700', color: classroomColors.pillText },
  cardText: { fontSize: 14, color: '#4a4670', marginTop: 8 },
  moreButton: {
    marginHorizontal: 16, marginBottom: 16, paddingVertical: 14, borderRadius: 14, borderWidth: 1,
    borderColor: classroomColors.border, backgroundColor: classroomColors.card, alignItems: 'center',
  },
  moreButtonText: { fontSize: 15, fontWeight: '700', color: classroomColors.primary },
  emptyTitle: { fontSize: 16, fontWeight: '600', color: classroomColors.muted, marginBottom: 6 },
  emptyText: { fontSize: 13, color: '#8a86a8', textAlign: 'center' },

  // Detalle de publicación
  detailHeader: { backgroundColor: classroomColors.primary, paddingHorizontal: 16, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', gap: 12 },
  detailBack: { fontSize: 24, color: '#fff', paddingRight: 4 },
  detailBadge: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  detailHeaderText: { flex: 1 },
  detailHeaderTitle: { fontSize: 17, fontWeight: '700', color: '#fff' },
  detailHeaderSub: { fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 1 },
  detailAction: { fontSize: 20 },
  detailCard: {
    backgroundColor: classroomColors.card, borderRadius: 16, marginHorizontal: 16, marginTop: 16, padding: 18,
    shadowColor: '#2b2470', shadowOpacity: 0.08, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  detailTitle: { fontSize: 20, fontWeight: '700', color: '#1d1a33' },
  detailDate: { fontSize: 12, color: classroomColors.muted, marginTop: 4, marginBottom: 12 },
  detailText: { fontSize: 15, lineHeight: 22, color: '#3a3760' },

  // Envío (admin y preceptor)
  form: { flex: 1, backgroundColor: classroomColors.surface },
  formContent: { padding: 16, paddingBottom: 24 },
  pill: { backgroundColor: classroomColors.pill, borderRadius: 12, paddingVertical: 12, paddingHorizontal: 14, marginTop: 16, marginBottom: 10, marginLeft:50 },
  pillText: { fontSize: 15, fontWeight: '700', color: classroomColors.pillText },
  hint: { fontSize: 13, color: classroomColors.muted, marginBottom: 8 },
  optionCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: classroomColors.card, borderRadius: 12, borderWidth: 1,
    borderColor: 'transparent', paddingVertical: 14, paddingHorizontal: 14, marginBottom: 8,
  },
  optionCardSelected: { borderColor: classroomColors.primary, borderWidth: 2 },
  optionSwatch: { width: 18, height: 18, borderRadius: 4, marginRight: 12 },
  optionLabel: { flex: 1, fontSize: 15, fontWeight: '600', color: '#1d1a33' },
  optionCheck: { fontSize: 16, fontWeight: '700', color: classroomColors.primary },
  subOption: { marginLeft: 20 },
  inputBox: {
    backgroundColor: classroomColors.card, borderRadius: 12, borderWidth: 1, borderColor: classroomColors.border,
    paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: '#1d1a33', minHeight: 48,
  },
  contentBox: { minHeight: 150, textAlignVertical: 'top' },
  toolRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 12 },
  toolButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: classroomColors.card, borderWidth: 1, borderColor: classroomColors.border, alignItems: 'center', justifyContent: 'center' },
  toolIcon: { fontSize: 20, color: classroomColors.primary },
  publishBar: { padding: 16, backgroundColor: classroomColors.surface, borderTopWidth: 1, borderTopColor: classroomColors.border },
  publishButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: classroomColors.primary, borderRadius: 14, paddingVertical: 15 },
  publishButtonText: { fontSize: 16, fontWeight: '700', color: '#fff' },
  disabled: { opacity: 0.5 },
});

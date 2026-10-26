jest.mock('../src/services/firebase/firebaseConfig', () => ({ db: {}, auth: { currentUser: { uid: 'uid1' }, app: { options: { projectId: 'p' } } } }));
jest.mock('firebase/firestore', () => ({ collection: jest.fn(), doc: jest.fn(), getDocFromServer: jest.fn(), getDocsFromServer: jest.fn() }));
jest.mock('../src/services/messageImages', () => ({ uploadMessageFile: jest.fn() }));
jest.mock('../src/services/messageVideo', () => ({ validateVideo: jest.fn(), MAX_VIDEO_SIZE: 50 * 1024 * 1024 }));
jest.mock('../src/services/audioTypes', () => ({ validateAudio: jest.fn(), MAX_AUDIO_SIZE: 20 * 1024 * 1024 }));

import { submissionPath, validateSubmissionVideo, validateSubmissionAudio } from '../src/services/firebase/classroomSubmissions';

test('mueve cada adjunto a classroom-submissions/{uid}/{tarea}/{archivo}', () => {
  expect(submissionPath('communication-images/uid1/abc123', 't1', 'uid1')).toBe('classroom-submissions/uid1/t1/abc123');
  expect(submissionPath('communication-documents/uid1/id9/Informe final.pdf', 't1', 'uid1')).toBe('classroom-submissions/uid1/t1/Informe final.pdf');
});

test('rechaza videos y audios por encima del límite', () => {
  expect(() => validateSubmissionVideo({ contentType: 'video/mp4', size: 51 * 1024 * 1024 })).toThrow('50 MB');
  expect(() => validateSubmissionAudio({ name: 'nota.m4a', size: 21 * 1024 * 1024 })).toThrow('20 MB');
});

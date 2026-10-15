import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import { collection, doc } from 'firebase/firestore';
import { auth, db } from './firebase/firebaseConfig';
import { MessageImage, uploadMessageFile } from './messageImages';
import { imageContentType } from './imageContentType';

export async function pickProfilePhoto(camera = false): Promise<MessageImage | null> {
  await auth.authStateReady();
  if (!auth.currentUser) throw new Error('Volvé a iniciar sesión para cambiar tu foto.');
  const result = camera
    ? await launchCamera({ mediaType: 'photo', cameraType: 'front', saveToPhotos: false, maxWidth: 768, maxHeight: 768, quality: 0.8 })
    : await launchImageLibrary({ mediaType: 'photo', selectionLimit: 1, maxWidth: 768, maxHeight: 768, quality: 0.8, assetRepresentationMode: 'compatible' });
  if (result.didCancel) return null;
  if (result.errorCode) throw new Error(result.errorCode === 'permission' ? 'Permití el acceso a la cámara o fotos en Ajustes.' : 'No se pudo obtener la foto.');
  const asset = result.assets?.[0];
  const contentType = imageContentType(asset?.type);
  if (!asset?.uri || !['image/jpeg', 'image/png', 'image/webp'].includes(contentType)) throw new Error('Seleccioná una foto JPG, PNG o WebP.');
  if ((asset.fileSize || 0) > 5 * 1024 * 1024) throw new Error('La foto debe pesar menos de 5 MB.');
  return { uri: asset.uri, contentType, path: `profile-photos/${auth.currentUser.uid}/${doc(collection(db, 'users')).id}` };
}
export async function uploadProfilePhoto(photo: MessageImage): Promise<void> {
  await uploadMessageFile(photo, 'profile-photos', 5 * 1024 * 1024);
}

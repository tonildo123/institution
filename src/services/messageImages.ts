import { launchImageLibrary } from 'react-native-image-picker';
import { ref, getDownloadURL } from 'firebase/storage';
import { doc, collection } from 'firebase/firestore';
import { auth, db, storage } from './firebase/firebaseConfig';

export interface MessageImage {
  uri: string;
  contentType: string;
  path: string;
}

export async function pickMessageImage(): Promise<MessageImage | null> {
  const result = await launchImageLibrary({
    mediaType: 'photo', selectionLimit: 1,
    maxWidth: 1600, maxHeight: 1600, quality: 0.8,
    assetRepresentationMode: 'compatible',
  });
  if (result.didCancel) return null;
  if (result.errorCode) throw new Error(result.errorMessage || 'No se pudo abrir la galería');
  const asset = result.assets?.[0];
  if (!asset?.uri) throw new Error('No se pudo leer la imagen');
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(asset.type || '')) {
    throw new Error('Seleccioná una imagen JPG, PNG o WebP');
  }
  if ((asset.fileSize || 0) > 5 * 1024 * 1024) throw new Error('La imagen debe pesar menos de 5 MB');
  return {
    uri: asset.uri, contentType: asset.type!,
    path: `communication-images/${auth.currentUser?.uid || 'pending'}/${doc(collection(db, 'communications')).id}`,
  };
}

export async function uploadMessageImage(image: MessageImage): Promise<string> {
  await auth.authStateReady();
  if (!auth.currentUser) {
    throw new Error('Cerrá sesión e ingresá con tu cuenta habilitada en Firebase Auth para enviar imágenes.');
  }
  if (!image.path.startsWith(`communication-images/${auth.currentUser.uid}/`)) {
    throw new Error('Volvé a seleccionar la imagen con la sesión actual.');
  }
  const token = await auth.currentUser.getIdToken();
  const imageRef = ref(storage, image.path);
  // React Native admite blobs de archivo nativos, pero no construirlos desde ArrayBuffer.
  const blob = await readImageBlob(image.uri);
  try {
    const response = await fetch(
      `https://firebasestorage.googleapis.com/v0/b/${encodeURIComponent(imageRef.bucket)}/o?uploadType=media&name=${encodeURIComponent(image.path)}`,
      {
        method: 'POST',
        headers: { Authorization: `Firebase ${token}`, 'Content-Type': image.contentType },
        body: blob,
      },
    );
    if (!response.ok) {
      throw new Error(response.status === 403
        ? 'No tenés permiso para subir esta imagen.'
        : `No se pudo subir la imagen (HTTP ${response.status}). Intentá nuevamente.`);
    }
    return await getDownloadURL(imageRef);
  } finally {
    // Liberar el archivo nativo después de completar la petición.
    (blob as Blob & { close?: () => void }).close?.();
  }
}

function readImageBlob(uri: string): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open('GET', uri, true);
    request.responseType = 'blob';
    request.timeout = 30000;
    request.onload = () => {
      if ((request.status === 0 || request.status === 200) && request.response) resolve(request.response);
      else reject(new Error('No se pudo leer la imagen seleccionada. Volvé a elegirla.'));
    };
    request.onerror = () => reject(new Error('No se pudo leer la imagen seleccionada.'));
    request.ontimeout = () => reject(new Error('La lectura de la imagen tardó demasiado.'));
    request.send();
  });
}

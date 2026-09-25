import { launchImageLibrary, launchCamera, ImagePickerResponse } from 'react-native-image-picker';
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
  return imageFromResult(result);
}

export async function captureMessageImage(): Promise<MessageImage | null> {
  const result = await launchCamera({
    mediaType: 'photo', cameraType: 'back', saveToPhotos: false,
    maxWidth: 1600, maxHeight: 1600, quality: 0.8,
  });
  return imageFromResult(result);
}

function imageFromResult(result: ImagePickerResponse): MessageImage | null {
  if (result.didCancel) return null;
  if (result.errorCode === 'permission') throw new Error('Permití el acceso a la cámara en Ajustes para sacar una foto.');
  if (result.errorCode === 'camera_unavailable') throw new Error('No hay una cámara disponible en este dispositivo.');
  if (result.errorCode) throw new Error('No se pudo obtener la foto. Intentá nuevamente.');
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
  return uploadMessageFile(image, 'communication-images', 5 * 1024 * 1024);
}

export async function uploadMessageFile(file: MessageImage, folder: 'communication-images' | 'communication-documents', maxSize: number): Promise<string> {
  await auth.authStateReady();
  if (!auth.currentUser) {
    throw new Error('Cerrá sesión e ingresá con tu cuenta habilitada en Firebase Auth para enviar archivos.');
  }
  if (!file.path.startsWith(`${folder}/${auth.currentUser.uid}/`)) {
    throw new Error('Volvé a seleccionar el archivo con la sesión actual.');
  }
  const token = await auth.currentUser.getIdToken();
  const imageRef = ref(storage, file.path);
  // React Native admite blobs de archivo nativos, pero no construirlos desde ArrayBuffer.
  const blob = await readFileBlob(file.uri);
  try {
    if (blob.size <= 0 || blob.size > maxSize) throw new Error('El archivo está vacío o supera el tamaño permitido.');
    const response = await fetch(
      `https://firebasestorage.googleapis.com/v0/b/${encodeURIComponent(imageRef.bucket)}/o?uploadType=media&name=${encodeURIComponent(file.path)}`,
      {
        method: 'POST',
        headers: { Authorization: `Firebase ${token}`, 'Content-Type': file.contentType },
        body: blob,
      },
    );
    if (!response.ok) {
      throw new Error(response.status === 403
        ? 'No tenés permiso para subir este archivo.'
        : `No se pudo subir el archivo (HTTP ${response.status}). Intentá nuevamente.`);
    }
    return await getDownloadURL(imageRef);
  } finally {
    // Liberar el archivo nativo después de completar la petición.
    (blob as Blob & { close?: () => void }).close?.();
  }
}

function readFileBlob(uri: string): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open('GET', uri, true);
    request.responseType = 'blob';
    request.timeout = 30000;
    request.onload = () => {
      if ((request.status === 0 || request.status === 200) && request.response) resolve(request.response);
      else reject(new Error('No se pudo leer el archivo seleccionado. Volvé a elegirlo.'));
    };
    request.onerror = () => reject(new Error('No se pudo leer el archivo seleccionado.'));
    request.ontimeout = () => reject(new Error('La lectura del archivo tardó demasiado.'));
    request.send();
  });
}

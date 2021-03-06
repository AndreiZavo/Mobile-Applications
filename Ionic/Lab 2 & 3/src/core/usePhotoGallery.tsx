import {useEffect, useState} from "react";
import {Photo} from "../pages/MovieProps";
import {useCamera} from "@ionic/react-hooks/camera";
import {CameraPhoto, CameraResultType, CameraSource, FilesystemDirectory} from "@capacitor/core";
import {PHOTO_STORAGE} from "./index";
import {base64FromPath, useFilesystem} from "@ionic/react-hooks/filesystem";
import {useStorage} from "@ionic/react-hooks/storage";
import { Plugins} from '@capacitor/core';
const { Camera } = Plugins;
export function usePhotoGallery() {
  const { getPhoto } = useCamera();
  const [photos, setPhotos] = useState<Photo[]>([]);

  const takePhoto = async () => {
    const cameraPhoto = await Camera.getPhoto({
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera,
      quality: 100

    });
    const fileName = new Date().getTime() + '.jpeg';
    const savedFileImage = await savePicture(cameraPhoto, fileName);
    const newPhotos = [savedFileImage, ...photos];
    setPhotos(newPhotos);
    set(PHOTO_STORAGE, JSON.stringify(newPhotos));
    return savedFileImage;
  };

  const { deleteFile, readFile, writeFile } = useFilesystem();
  const savePicture = async (photo: CameraPhoto, fileName: string): Promise<Photo> => {
    const base64Data = await base64FromPath(photo.webPath!);
    await writeFile({
      path: fileName,
      data: base64Data,
      directory: FilesystemDirectory.Data
    });

    return {
      filepath: fileName,
      webviewPath: base64Data
    };
  };

  const writePictureFromServer = async (photo: Photo): Promise<void> => {
    if (photo.webviewPath) {
      await writeFile({
        path: photo.filepath,
        data: photo.webviewPath,
        directory: FilesystemDirectory.Data
      });
      const newPhotos = [...photos, photo]
      setPhotos(newPhotos)
      set(PHOTO_STORAGE, JSON.stringify(newPhotos));
    }
  }

  const { get, set } = useStorage();
  useEffect(() => {
    const loadSaved = async () => {
      const photosString = await get(PHOTO_STORAGE);
      const photos = (photosString ? JSON.parse(photosString) : []) as Photo[];
      for (let photo of photos) {
        const file = await readFile({
          path: photo.filepath,
          directory: FilesystemDirectory.Data
        });
        photo.webviewPath = `data:image/jpeg;base64,${file.data}`;
      }
      setPhotos(photos);
    };
    loadSaved();
  }, [get, readFile]);

  const deletePhoto = async (photo: Photo) => {
    const newPhotos = photos.filter(p => p.filepath !== photo.filepath);
    set(PHOTO_STORAGE, JSON.stringify(newPhotos));
    const filename = photo.filepath.substr(photo.filepath.lastIndexOf('/') + 1);
    await deleteFile({
      path: filename,
      directory: FilesystemDirectory.Data
    });
    setPhotos(newPhotos);
  };

  return {
    photos,
    takePhoto,
    deletePhoto,
    writePictureFromServer
  };
}

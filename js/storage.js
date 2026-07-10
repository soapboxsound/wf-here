import { storage } from "/js/firebase.js";
import {
  getDownloadURL,
  ref,
  uploadBytes
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

const MAX_PHOTO_BYTES = 10 * 1024 * 1024;
const ALLOWED_PHOTO_TYPES = new Set(["image/jpeg", "image/png"]);

function sanitizeFileName(name = "photo") {
  return name.replace(/[^a-zA-Z0-9._-]/g, "-");
}

export function validatePhotoFile(file) {
  if (!ALLOWED_PHOTO_TYPES.has(file.type)) {
    return "Only JPG and PNG photos are supported.";
  }

  if (file.size > MAX_PHOTO_BYTES) {
    return "Each photo must be 10MB or smaller.";
  }

  return null;
}

export async function uploadSubmissionPhotos(submissionId, files = []) {
  if (!submissionId || !files.length) {
    return [];
  }

  const uploads = files.map(async (file, index) => {
    const fileName = `${Date.now()}-${index}-${sanitizeFileName(file.name)}`;
    const storageRef = ref(storage, `submissions/${submissionId}/${fileName}`);
    const snapshot = await uploadBytes(storageRef, file, {
      contentType: file.type
    });

    return getDownloadURL(snapshot.ref);
  });

  return Promise.all(uploads);
}

import { MAX_IMAGE_DIMENSION } from "./constants";

const getOutputMimeType = (originalType) => {
  if (originalType === "image/png") return "image/png";
  if (originalType === "image/webp") return "image/webp";
  return "image/jpeg";
};

export const downscaleToDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    const objectUrl = URL.createObjectURL(file);

    image.onload = () => {
      try {
        URL.revokeObjectURL(objectUrl);
        const longest = Math.max(image.width, image.height);
        const scale =
          longest > MAX_IMAGE_DIMENSION ? MAX_IMAGE_DIMENSION / longest : 1;
        const targetWidth = Math.max(1, Math.round(image.width * scale));
        const targetHeight = Math.max(1, Math.round(image.height * scale));
        const canvas = document.createElement("canvas");
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const context = canvas.getContext("2d");
        if (!context) {
          reject(new Error("Canvas 2D context unavailable."));
          return;
        }
        context.drawImage(image, 0, 0, targetWidth, targetHeight);
        const mimeType = getOutputMimeType(file.type);
        const quality = mimeType === "image/jpeg" ? 0.85 : undefined;
        const dataUrl = canvas.toDataURL(mimeType, quality);
        resolve({
          dataUrl,
          naturalWidth: targetWidth,
          naturalHeight: targetHeight,
        });
      } catch (error) {
        reject(error);
      }
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error(`Failed to load image: ${file.name}`));
    };

    image.src = objectUrl;
  });

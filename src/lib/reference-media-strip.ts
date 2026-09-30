// Claves que pueden transportar una imagen de referencia (data URL, base64 o
// ruta de archivo). Se eliminan SIEMPRE antes de llegar al proveedor de imagen o
// vídeo: si un cliente las adjunta, el modelo de Gemini las rechaza con
// "this model does not support image input" y solo admitimos texto como entrada.
export const REFERENCE_MEDIA_KEYS = ['referenceImage', 'reference_image', 'imageBase64', 'base64Image', 'image', 'media', 'attachment'];

export function stripReferenceMedia(input: Record<string, unknown>): Record<string, unknown> {
  const output: Record<string, unknown> = { ...input };
  for (const key of REFERENCE_MEDIA_KEYS) {
    if (key in output) delete output[key];
  }
  return output;
}
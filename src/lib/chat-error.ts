export function friendlyError(message: string): string {
  const lower = message.toLowerCase();
  if (/does not support image input|model does not support image|cannot read\b.*(\.(png|jpe?g|webp|heic|gif)|image \d+|\w+\.\w+)/i.test(lower)) {
    return 'El modelo seleccionado no admite una imagen de referencia. Quita la imagen adjunta o usa un modelo que acepte imágenes; la generación reenvía únicamente el texto del prompt.';
  }
  return message;
}
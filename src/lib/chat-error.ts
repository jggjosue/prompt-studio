export function friendlyError(message: string): string {
  if (/does not support image input|Cannot read/i.test(message)) {
    return 'The selected model does not support a reference image. Switch to an image generation model or remove the image.';
  }
  return message;
}
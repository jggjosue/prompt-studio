import { PlaceHolderImages, type ImagePlaceholder } from '@/lib/placeholder-images';
import type { VideoProp } from '@/lib/placeholder-videos';

type GalleryItem = ImagePlaceholder | VideoProp;

export function isRenderableVideoUrl(url: string, type: string) {
  const cleanUrl = (url || '').split('?')[0].toLowerCase();
  const hasVideoExt =
    cleanUrl.endsWith('.mp4') || cleanUrl.endsWith('.webm') || cleanUrl.endsWith('.ogg');
  return type === 'video' && hasVideoExt;
}

export function resolveRenderableMediaUrl(entry: GalleryItem) {
  if (!entry.imageUrl) return '';
  if (!isRenderableVideoUrl(entry.imageUrl, entry.type)) return entry.imageUrl;

  // Fallback image when an entry points to a video URL.
  const sameTitleImage = PlaceHolderImages.find(
    p => p.title === entry.title && p.imageUrl && !isRenderableVideoUrl(p.imageUrl, p.type)
  );
  return sameTitleImage?.imageUrl || entry.imageUrl;
}

import sharp from 'sharp';

export type ModernImageFormat = 'avif' | 'webp' | 'original';

const RASTER_EXT = /\.(jpe?g|png)$/i;

/** Negocia AVIF > WebP según Accept (codificación predictiva + cuantización en sharp). */
export function pickModernImageFormat(
  acceptHeader: string | null | undefined
): ModernImageFormat {
  if (!acceptHeader) return 'webp';
  const accept = acceptHeader.toLowerCase();
  if (accept.includes('image/avif')) return 'avif';
  if (accept.includes('image/webp')) return 'webp';
  return 'original';
}

export function isRasterImageFilename(filename: string): boolean {
  return RASTER_EXT.test(filename);
}

export type TranscodeImageOptions = {
  format: ModernImageFormat;
  width?: number;
  quality?: number;
};

/**
 * Convierte JPEG/PNG a AVIF o WebP (menor peso, calidad perceptual similar).
 * SVG/GIF/WebP/AVIF se devuelven sin re-codificar.
 */
export async function transcodeRasterImage(
  input: Buffer,
  filename: string,
  options: TranscodeImageOptions
): Promise<{ buffer: Buffer; contentType: string }> {
  const lower = filename.toLowerCase();
  if (lower.endsWith('.svg')) {
    return { buffer: input, contentType: 'image/svg+xml' };
  }
  if (lower.endsWith('.gif')) {
    return { buffer: input, contentType: 'image/gif' };
  }
  if (lower.endsWith('.webp')) {
    return { buffer: input, contentType: 'image/webp' };
  }
  if (lower.endsWith('.avif')) {
    return { buffer: input, contentType: 'image/avif' };
  }

  const { format, width, quality = 75 } = options;

  if (format === 'original' || !isRasterImageFilename(filename)) {
    return {
      buffer: input,
      contentType: contentTypeFromFilename(filename),
    };
  }

  let pipeline = sharp(input, { failOn: 'none' }).rotate();

  if (width && width > 0) {
    pipeline = pipeline.resize(width, undefined, {
      withoutEnlargement: true,
      fit: 'inside',
    });
  }

  if (format === 'avif') {
    const buffer = await pipeline
      .avif({ quality: Math.min(quality, 80), effort: 4 })
      .toBuffer();
    return { buffer, contentType: 'image/avif' };
  }

  const buffer = await pipeline.webp({ quality }).toBuffer();
  return { buffer, contentType: 'image/webp' };
}

function contentTypeFromFilename(filename: string): string {
  const lower = filename.toLowerCase();
  if (lower.endsWith('.png')) return 'image/png';
  if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return 'image/jpeg';
  if (lower.endsWith('.webp')) return 'image/webp';
  if (lower.endsWith('.avif')) return 'image/avif';
  if (lower.endsWith('.gif')) return 'image/gif';
  if (lower.endsWith('.svg')) return 'image/svg+xml';
  return 'application/octet-stream';
}

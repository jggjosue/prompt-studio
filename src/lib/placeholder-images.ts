import data from './placeholder-images.json';

export type ImagePlaceholder = {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  imageHint: string;
  type: 'image' | 'video';
  tags: string[];
};

export const PlaceHolderImages: ImagePlaceholder[] = (data.placeholderImages as any[]).map((image) => {
  // Extraemos la URL y el ID para el objeto de metadatos del prompt
  const { imageUrl, id, ...cleanMetadata } = image;
  
  return {
    ...image,
    // La descripción ahora es el JSON stringificado de los metadatos (incluyendo la descripción original)
    description: JSON.stringify(cleanMetadata, null, 2),
  };
});

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

export const PlaceHolderImages: ImagePlaceholder[] = (data.placeholderImages as any[]).map((image, index) => {
  const generatedId = `img-${index + 1}`;
  
  // Create prompt JSON including description but excluding imageUrl
  const { imageUrl, ...cleanMetadata } = image;
  
  return {
    ...image,
    id: generatedId,
    description: JSON.stringify(cleanMetadata, null, 2),
  };
});

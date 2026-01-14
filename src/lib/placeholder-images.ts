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

export const PlaceHolderImages: ImagePlaceholder[] = data.placeholderImages;
    
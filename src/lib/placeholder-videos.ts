import data from './placeholder-videos.json';

export type VideoProp = {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  imageHint: string;
  type: 'video';
  tags: string[];
};

export const PlaceHolderVideos: VideoProp[] = data.placeholderVideos;

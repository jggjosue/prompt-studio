
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

export const PlaceHolderVideos: VideoProp[] = (data.placeholderVideos as any[]).map((video, index) => {
  // Exclude imageUrl from the description JSON as requested
  const { imageUrl, ...rest } = video;
  
  return {
    ...video,
    // Generate unique ID based on index to avoid Console errors with duplicate keys
    id: `v-${index + 1}`,
    // Set description as a pretty-printed JSON of metadatos (excluding imageUrl)
    description: JSON.stringify(rest, null, 2),
    type: 'video' as const
  };
});

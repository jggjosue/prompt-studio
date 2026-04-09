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
  const generatedId = `v-${index + 1}`;
  
  // Create prompt JSON including description but excluding internal IDs and image URL
  const { id: _sourceId, randomId: _randomId, imageUrl, ...cleanMetadata } = video;
  
  return {
    ...video,
    id: generatedId,
    description: JSON.stringify(cleanMetadata, null, 2),
    type: 'video' as const
  };
});

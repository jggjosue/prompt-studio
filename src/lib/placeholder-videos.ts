
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
  // Excluimos imageUrl y la propia descripción vacía para el prompt limpio
  const { imageUrl, description, ...rest } = video;
  
  return {
    ...video,
    // Generamos ID único basado en el índice
    id: `v-${index + 1}`,
    // La descripción ahora es un JSON stringificado (sin la URL de imagen)
    description: JSON.stringify(rest, null, 2),
    type: 'video' as const
  };
});

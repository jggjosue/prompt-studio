
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
  // Generamos un ID único y determinista para evitar errores de claves duplicadas
  const generatedId = `v-${index + 1}`;
  
  // Excluimos imageUrl y el campo original de descripción para generar el prompt limpio
  const { imageUrl, description, id, ...cleanMetadata } = video;
  
  return {
    ...video,
    id: generatedId,
    // La descripción ahora es un JSON stringificado estrictamente (sin la URL de imagen)
    description: JSON.stringify(cleanMetadata, null, 2),
    type: 'video' as const
  };
});

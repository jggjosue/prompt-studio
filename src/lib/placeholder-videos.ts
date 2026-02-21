
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
  // Generamos un ID único y determinista basado en el índice para evitar duplicados
  const generatedId = `v-${index + 1}`;
  
  // Excluimos imageUrl para el bloque de descripción JSON (el prompt)
  const { imageUrl, description, id, ...cleanMetadata } = video;
  
  return {
    ...video,
    id: generatedId,
    // La descripción es ahora el JSON stringificado de los metadatos creativos
    description: JSON.stringify(cleanMetadata, null, 2),
    type: 'video' as const
  };
});

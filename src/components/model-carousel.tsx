'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from '@/components/ui/carousel';
import { AiModels } from '@/lib/models-data';
import { OptimizedImage } from '@/components/optimized-image';

export default function ModelCarousel() {
  return (
    <Carousel
      opts={{
        align: 'start',
        loop: true,
      }}
      className="w-full"
    >
      <CarouselContent>
        {AiModels.map(model => (
          <CarouselItem key={model.id} className="md:basis-1/2 lg:basis-1/3">
            <Card className="overflow-hidden group">
              <CardContent className="p-0 relative">
                <OptimizedImage
                  src={model.imageUrl}
                  alt={model.name}
                  width={600}
                  height={400}
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="w-full h-auto object-cover aspect-[3/2] transition-transform duration-300 group-hover:scale-105"
                  data-ai-hint={model.imageHint}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                <div className="absolute top-4 left-4">
                  <Badge variant="secondary">{model.provider}</Badge>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                  <h3 className="text-xl font-bold font-headline">
                    {model.name}
                  </h3>
                  <p className="text-sm text-white/80 line-clamp-2 mt-1">
                    {model.description}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {model.tags.map(tag => (
                      <Badge
                        key={tag}
                        variant="outline"
                        className="bg-white/10 border-white/20 text-white backdrop-blur-sm"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="absolute left-[-20px] top-1/2 -translate-y-1/2" />
      <CarouselNext className="absolute right-[-20px] top-1/2 -translate-y-1/2" />
    </Carousel>
  );
}

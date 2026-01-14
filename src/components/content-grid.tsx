'use client';

import { useState, useMemo } from 'react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Image from 'next/image';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, PlayCircle } from 'lucide-react';

export default function ContentGrid() {
  const [filter, setFilter] = useState('all');
  const [sort, setSort] = useState('popular');

  const filteredContent = useMemo(() => {
    let content = [...PlaceHolderImages];

    if (filter !== 'all') {
      content = content.filter(item => item.type === filter);
    }

    if (sort === 'newest') {
      content.sort((a, b) => parseInt(b.id) - parseInt(a.id));
    } else if (sort === 'oldest') {
      content.sort((a, b) => parseInt(a.id) - parseInt(b.id));
    }

    return content;
  }, [filter, sort]);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-semibold font-headline">
          Community Gallery
        </h3>
        <div className="flex gap-4">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="image">Images</SelectItem>
              <SelectItem value="video">Videos</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="popular">Popular</SelectItem>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="oldest">Oldest</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredContent.map(item => (
          <Card key={item.id} className="overflow-hidden group">
            <CardContent className="p-0">
              <div className="relative">
                <Image
                  src={item.imageUrl}
                  alt={item.description}
                  width={600}
                  height={400}
                  className="w-full h-auto object-cover aspect-[3/2] transition-transform duration-300 group-hover:scale-105"
                  data-ai-hint={item.imageHint}
                />
                 {item.type === 'video' && (
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <PlayCircle className="w-12 h-12 text-white/80" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                  <p className="text-white text-sm line-clamp-2">
                    {item.description}
                  </p>
                  <button className="absolute top-2 right-2 p-1.5 bg-white/20 rounded-full text-white hover:bg-white/30 hover:text-red-500 transition-colors">
                    <Heart className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

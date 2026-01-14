'use client';

import { PlaceHolderImages, type ImagePlaceholder } from '@/lib/placeholder-images';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Clipboard, Heart, PlayCircle } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/layout/header';

export default function GalleryDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { toast } = useToast();
  const item: ImagePlaceholder | undefined = PlaceHolderImages.find(
    p => p.id === params.id
  );

  if (!item) {
    notFound();
  }

  const handleCopyToClipboard = () => {
    if (item.description) {
      navigator.clipboard.writeText(item.description);
      toast({
        title: 'Copied to clipboard!',
        description: 'The prompt has been copied.',
      });
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Header />
      <main className="flex-1 py-12 md:py-16 lg:py-20">
        <div className="container">
          <div className="mb-8">
            <Button variant="outline" asChild>
              <Link href="/#gallery">
                <ArrowLeft className="mr-2" />
                Back to Gallery
              </Link>
            </Button>
          </div>
          <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            <div className="relative aspect-video rounded-lg overflow-hidden border">
              {item.type === 'video' ? (
                <>
                  <Image
                    src={item.imageUrl}
                    alt={item.description}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <PlayCircle className="w-20 h-20 text-white/80" />
                  </div>
                </>
              ) : (
                <Image
                  src={item.imageUrl}
                  alt={item.description}
                  fill
                  className="object-cover"
                  data-ai-hint={item.imageHint}
                />
              )}
            </div>
            <div className="flex flex-col justify-center">
              <Card>
                <CardHeader>
                  <CardTitle className="font-headline">Prompt Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="relative rounded-md border bg-muted p-4">
                    <p className="text-muted-foreground">{item.description}</p>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 h-8 w-8"
                      onClick={handleCopyToClipboard}
                    >
                      <Clipboard className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-4">
                    <Button>
                      <Heart className="mr-2" />
                      Like
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      1,234 Likes
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

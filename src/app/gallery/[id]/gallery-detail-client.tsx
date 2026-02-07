'use client';

import Footer from '@/components/layout/footer';
import Header from '@/components/layout/header';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useFirebase } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import {
  PlaceHolderImages,
  type ImagePlaceholder,
} from '@/lib/placeholder-images';
import {
  PlaceHolderVideos,
  type VideoProp,
} from '@/lib/placeholder-videos';
import { doc, getDoc, onSnapshot, runTransaction, serverTimestamp } from 'firebase/firestore';
import { ArrowLeft, Copy, Heart, Loader2, Wand2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';


function LikeButton({ contentId, className }: { contentId: string, className?: string }) {
  const { firestore, user, isUserLoading } = useFirebase();
  const { toast } = useToast();

  const [likeCount, setLikeCount] = useState<number | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [mounted, setMounted] = useState(false);

  const isVideo = useMemo(() => PlaceHolderVideos.some(v => v.id === contentId), [contentId]);
  const collectionName = isVideo ? 'placeholderVideos' : 'placeholderImages';

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!firestore || !mounted) return;

    const docRef = doc(firestore, collectionName, contentId);
    const unsubscribe = onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        const likes = data.metadata?.likes ?? data.count ?? data.likes ?? 0;
        setLikeCount(likes);
      } else {
        setLikeCount(0);
      }
    });
    return () => unsubscribe();
  }, [firestore, contentId, collectionName, mounted]);

  useEffect(() => {
    if (!firestore || !user || !mounted) {
        setIsLiked(false);
        return;
    };
    const checkLikeStatus = async () => {
        const userLikeRef = doc(firestore, `user-likes/${user.uid}/items/${contentId}`);
        const docSnap = await getDoc(userLikeRef);
        setIsLiked(docSnap.exists());
    }
    checkLikeStatus();
    
    // Also listen for realtime changes in case it's updated elsewhere
    const userLikeRef = doc(firestore, `user-likes/${user.uid}/items/${contentId}`);
    const unsubscribe = onSnapshot(userLikeRef, (docSnap) => {
        setIsLiked(docSnap.exists());
    });

    return () => unsubscribe();

  }, [firestore, user, contentId, collectionName, mounted]);

  const handleLike = useCallback(async (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();

    if (!firestore || !user) {
      toast({
        title: 'Authentication required',
        description: 'Please sign in to like content.',
        variant: 'destructive',
      });
      return;
    }
    if (isLiking) return;
    setIsLiking(true);

    try {
        await runTransaction(firestore, async (transaction) => {
            const docRef = doc(firestore, collectionName, contentId);
            const userLikeRef = doc(firestore, `user-likes/${user.uid}/items/${contentId}`);
    
            const docSnap = await transaction.get(docRef);
            const userLikeSnap = await transaction.get(userLikeRef);
    
            if (!docSnap.exists()) {
                transaction.set(userLikeRef, { likedAt: serverTimestamp() });
                transaction.set(docRef, { metadata: { likes: 1 } }, { merge: true });
                return;
            }
    
            const docData = docSnap.data();
            const currentLikes = docData.metadata?.likes ?? docData.count ?? docData.likes ?? 0;
            
            if (userLikeSnap.exists()) {
                // Unlike
                transaction.delete(userLikeRef);
                const newLikes = Math.max(0, currentLikes - 1);
                transaction.set(docRef, { metadata: { likes: newLikes } }, { merge: true });
            } else {
                // Like
                transaction.set(userLikeRef, { likedAt: serverTimestamp() });
                const newLikes = currentLikes + 1;
                transaction.set(docRef, { metadata: { likes: newLikes } }, { merge: true });
            }
        });
    } catch (error) {
        console.error("Like transaction failed: ", error);
        toast({
            title: 'Error',
            description: 'Could not update like status. Please try again.',
            variant: 'destructive',
        });
    } finally {
        setIsLiking(false);
    }
  }, [firestore, user, contentId, isLiking, toast, collectionName]);

  if (!mounted) {
    return (
      <div className="flex items-center gap-1">
        <Loader2 className="h-4 w-4 animate-spin" />
        <Button size="icon" variant="ghost" className={className} disabled>
          <Heart className="w-4 h-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1">
      {likeCount !== null ? <span className="text-xs font-semibold">{likeCount.toLocaleString()}</span> : <Loader2 className="h-4 w-4 animate-spin" />}
      <Button size="icon" variant="ghost" className={className} onClick={handleLike} disabled={isLiking || isUserLoading}>
        <Heart fill={isLiked ? 'currentColor' : 'none'} className={isLiked ? 'text-red-500' : ''} />
      </Button>
    </div>
  );
}


export default function GalleryDetailClient({ item }: { item: ImagePlaceholder | VideoProp }) {
  const otherItems = useMemo(() => [
    ...PlaceHolderImages.filter(p => p.id !== item.id && p.imageUrl),
    ...PlaceHolderVideos.filter(p => p.id !== item.id && p.imageUrl),
  ].slice(0, 3), [item.id]);
  
  const { toast } = useToast();

  const handleCopy = () => {
    navigator.clipboard.writeText(item.description).then(() => {
        toast({
            title: "Copied!",
            description: "Prompt copied to clipboard.",
        });
    });
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Header />
      <main className="flex-1 py-8 md:py-12">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12">
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold font-headline mb-2">
                  {item.title}
                </h1>
                <p className="text-muted-foreground">{item.description}</p>
                <div className="flex flex-wrap gap-2 mt-4">
                  {item.tags?.map(tag => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="relative aspect-[3/4] rounded-lg overflow-hidden border group">
                {item.type === 'video' ? (
                  <video
                    src={item.imageUrl}
                    playsInline
                    controls
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <>
                    <Image
                      src={item.imageUrl}
                      alt={item.description}
                      fill
                      unoptimized={item.imageUrl?.includes('meta.ai')}
                      className="object-cover"
                      data-ai-hint={item.imageHint}
                    />
                    <div className="absolute bottom-4 right-4 flex items-start gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <LikeButton contentId={item.id} className="text-white bg-black/20 hover:text-white hover:bg-black/40" />
                      <Button size="sm" variant="secondary" asChild>
                        <Link href="https://aistudio.google.com/" target="_blank" rel="noopener noreferrer">
                            <Wand2 className="mr-2" />
                            Use this prompt
                        </Link>
                      </Button>
                    </div>
                  </>
                )}
              </div>

              <Accordion type="single" collapsible defaultValue="item-1">
                <AccordionItem value="item-1">
                  <AccordionTrigger className="text-lg font-semibold font-headline">
                    View Prompt
                  </AccordionTrigger>
                  <AccordionContent className="relative text-base text-muted-foreground bg-muted/50 p-4 pr-12 rounded-md">
                    {item.description}
                    <Button variant="ghost" size="icon" className="absolute top-2 right-2" onClick={handleCopy}>
                      <Copy className="h-4 w-4" />
                      <span className="sr-only">Copy prompt</span>
                    </Button>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              <div>
                <h3 className="text-2xl font-bold font-headline mt-8 mb-4">
                  Optimization Tips
                </h3>
                <div className="space-y-6 text-muted-foreground">
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">
                      1. Decode Success Factors
                    </h4>
                    <p>
                      <strong>Engaging Content:</strong> The use of relatable
                      themes resonated with the audience.
                    </p>
                    <p>
                      <strong>High-Quality Visuals:</strong> AI tools enhanced
                      the visual appeal significantly.
                    </p>
                    <p>
                      <strong>Targeted Promotion:</strong> Social media
                      strategies broadened reach effectively.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">
                      2. How to Replicate This Success
                    </h4>
                    <p>
                      <strong>Choose the Right Tool:</strong> Utilize AI video
                      generators like RunwayML or Pictory. I found that these
                      platforms provided intuitive interfaces and impressive
                      output quality.
                    </p>
                    <p>
                      <strong>Develop Scripts Using Prompts:</strong> Create
                      engaging scripts with video generation prompts
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <aside className="space-y-8">
              <h3 className="text-2xl font-bold font-headline">
                Discover More
              </h3>
              <div className="space-y-6">
                {otherItems.map(other => (
                  <Link
                    key={other.id}
                    href={`/gallery/${other.id}`}
                    className="group block"
                  >
                    <Card className="overflow-hidden">
                      <CardContent className="p-0">
                        <div className="relative aspect-[3/4]">
                          {other.type === 'video' ? (
                            <video
                              src={other.imageUrl}
                              playsInline
                              muted
                              className="object-cover transition-transform group-hover:scale-105 w-full h-full"
                            />
                          ) : (
                            <Image
                              src={other.imageUrl}
                              alt={other.description}
                              fill
                              unoptimized={other.imageUrl?.includes('meta.ai')}
                              className="object-cover transition-transform group-hover:scale-105"
                            />
                          )}
                        </div>
                        <div className="p-4">
                          <p className="font-semibold line-clamp-1">
                            {other.title}
                          </p>
                          <div className="flex justify-between items-center mt-2">
                            <span className="text-sm text-muted-foreground">
                              By AI Artist
                            </span>
                            <LikeButton contentId={other.id} className="w-6 h-6" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </aside>
          </div>
          <div className="mt-12 flex justify-center">
            <Button variant="ghost" asChild size="sm">
              <Link href="/#gallery">
                <ArrowLeft className="mr-2" />
                Back to Gallery
              </Link>
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

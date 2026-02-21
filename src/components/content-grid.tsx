
'use client';

import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Heart, Tag, Wand2, Loader2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useState, useEffect, useCallback, Suspense } from 'react';
import { doc, getDoc, runTransaction, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { useFirebase } from '@/firebase';
import { useToast } from '@/hooks/use-toast';

function LikeButton({ contentId, contentType }: { contentId: string; contentType: string }) {
  const { firestore, user, isUserLoading } = useFirebase();
  const { toast } = useToast();

  const [likeCount, setLikeCount] = useState<number | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [mounted, setMounted] = useState(false);

  const collection = contentType === 'video' ? 'placeholderVideos' : 'placeholderImages';

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!firestore || !mounted) return;
    const countDocRef = doc(firestore, collection, contentId);
    const unsubscribe = onSnapshot(countDocRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        const likes = data.metadata?.likes ?? data.count ?? data.likes ?? 0;
        setLikeCount(likes);
      } else {
        setLikeCount(0);
      }
    });
    return () => unsubscribe();
  }, [firestore, contentId, collection, mounted]);

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

    const userLikeRef = doc(firestore, `user-likes/${user.uid}/items/${contentId}`);
    const unsubscribe = onSnapshot(userLikeRef, (docSnap) => {
        setIsLiked(docSnap.exists());
    });

    return () => unsubscribe();

  }, [firestore, user, contentId, collection, mounted]);

  const handleLike = useCallback(async () => {
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
            const countDocRef = doc(firestore, collection, contentId);
            const userLikeRef = doc(firestore, `user-likes/${user.uid}/items/${contentId}`);

            const docSnap = await transaction.get(countDocRef);
            const userLikeDoc = await transaction.get(userLikeRef);
            const docData = docSnap.exists() ? docSnap.data() : {};
            const currentLikes = docData.metadata?.likes ?? docData.count ?? docData.likes ?? 0;

            if (userLikeDoc.exists()) {
                transaction.delete(userLikeRef);
                const newLikes = Math.max(0, currentLikes - 1);
                transaction.set(countDocRef, { metadata: { likes: newLikes } }, { merge: true });
            } else {
                transaction.set(userLikeRef, { likedAt: serverTimestamp() });
                const newLikes = currentLikes + 1;
                transaction.set(countDocRef, { metadata: { likes: newLikes } }, { merge: true });
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
  }, [firestore, user, contentId, isLiking, toast, collection]);

  if (!mounted) {
    return (
      <div className="flex items-center gap-1 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        <Button variant="ghost" size="icon" className="w-8 h-8" disabled>
          <Heart className="w-4 h-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 text-muted-foreground">
        {likeCount !== null ? <span>{likeCount.toLocaleString()}</span> : <Loader2 className="h-4 w-4 animate-spin" />}
       <Button variant="ghost" size="icon" className="w-8 h-8" onClick={handleLike} disabled={isLiking || isUserLoading}>
        <Heart className="w-4 h-4" fill={isLiked ? 'currentColor' : 'none'} />
      </Button>
    </div>
  );
}


function ContentGridContent() {
  const content = useMemo(() => {
    return PlaceHolderImages.filter(item => item.imageUrl).slice(0, 9);
  }, []);

  return (
    <div className="space-y-4 md:space-y-8">
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-semibold font-headline">
          Community Gallery
        </h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {content.map(item => (
          <Card
            key={item.id}
            className="overflow-hidden group h-full flex flex-col"
          >
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="font-headline text-lg sm:text-xl">
                {item.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0 space-y-4 flex-grow">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Tag className="w-4 h-4" />
                <span className="truncate">{item.tags.join(', ')}</span>
              </div>
              <div className="relative aspect-[3/4] rounded-md overflow-hidden">
                <Image
                  src={item.imageUrl}
                  alt={item.title}
                  fill
                  unoptimized={item.imageUrl?.includes('meta.ai')}
                  className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
                  data-ai-hint={item.imageHint}
                />
              </div>
              {item.type === 'video' && (
                <p className="text-sm text-muted-foreground">
                  Duration: 5 seconds
                </p>
              )}
            </CardContent>
            <CardFooter className="bg-muted/50 p-4 border-t flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Button size="sm" asChild>
                    <Link href="https://aistudio.google.com/" target="_blank" rel="noopener noreferrer">
                        <Wand2 className="w-4 h-4 mr-2" />
                        Use this prompt
                    </Link>
                  </Button>
                   <Button
                    variant="secondary"
                    size="sm"
                    asChild
                  >
                    <Link href={`/gallery/${item.id}`}>View</Link>
                  </Button>
                </div>
                <div className="flex items-center gap-1">
                  <LikeButton contentId={String(item.id)} contentType={item.type} />
                </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default function ContentGrid() {
  return (
    <Suspense fallback={<div className="flex w-full justify-center py-10"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>}>
      <ContentGridContent />
    </Suspense>
  );
}

'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Heart, Tag, Wand2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useState, useEffect, useCallback } from 'react';
import { doc, getDoc, runTransaction, increment, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { useFirebase } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';


function LikeButton({ contentId }: { contentId: string }) {
  const { firestore, user, isUserLoading } = useFirebase();
  const { toast } = useToast();

  const [likeCount, setLikeCount] = useState<number | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [isLiking, setIsLiking] = useState(false);

  useEffect(() => {
    if (!firestore) return;
    const countDocRef = doc(firestore, 'count-likes', contentId);
    const unsubscribe = onSnapshot(countDocRef, (snapshot) => {
      setLikeCount(snapshot.exists() ? snapshot.data().count : 0);
    });
    return () => unsubscribe();
  }, [firestore, contentId]);

  useEffect(() => {
    if (!firestore || !user) {
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
  }, [firestore, user, contentId]);

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

    const countDocRef = doc(firestore, 'count-likes', contentId);
    const userLikeRef = doc(firestore, `user-likes/${user.uid}/items/${contentId}`);

    try {
        await runTransaction(firestore, async (transaction) => {
            const userLikeDoc = await transaction.get(userLikeRef);

            if (userLikeDoc.exists()) {
                transaction.delete(userLikeRef);
                transaction.set(countDocRef, { count: increment(-1) }, { merge: true });
            } else {
                transaction.set(userLikeRef, { likedAt: serverTimestamp() });
                transaction.set(countDocRef, { count: increment(1) }, { merge: true });
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
  }, [firestore, user, contentId, isLiking, toast]);

  return (
    <div className="flex items-center gap-1 text-muted-foreground">
        {likeCount !== null ? <span>{likeCount.toLocaleString()}</span> : <Loader2 className="h-4 w-4 animate-spin" />}
       <Button variant="outline" size="icon" className="w-8 h-8" onClick={handleLike} disabled={isLiking || isUserLoading}>
        <Heart className="w-4 h-4" fill={isLiked ? 'currentColor' : 'none'} />
      </Button>
    </div>
  );
}

export default function ImageExamples() {
  const imageContent = useMemo(() => {
    return PlaceHolderImages.filter(
      item => item.type === 'image' && item.imageUrl
    ).slice(0, 9);
  }, []);

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {imageContent.map(item => (
          <Card
            key={item.id}
            className="overflow-hidden group h-full flex flex-col bg-card"
          >
            <CardHeader className="p-4">
              <CardTitle className="font-headline text-lg">
                {item.title}
              </CardTitle>
              <CardDescription className="line-clamp-3 h-auto">
                {item.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-4 flex-grow">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Tag className="w-4 h-4" />
                <span className="truncate">{item.tags.join(', ')}</span>
              </div>
              <div className="relative aspect-[3/4] rounded-md overflow-hidden">
                <Image
                  src={item.imageUrl}
                  alt={item.description}
                  fill
                  unoptimized={item.imageUrl?.includes('meta.ai')}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  data-ai-hint={item.imageHint}
                />
              </div>
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
                  <LikeButton contentId={item.id} />
                </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </>
  );
}

    
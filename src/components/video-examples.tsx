
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
import { useFirebase } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { PlaceHolderVideos } from '@/lib/placeholder-videos';
import { doc, getDoc, onSnapshot, runTransaction, serverTimestamp } from 'firebase/firestore';
import { Heart, Loader2, Tag, Wand2 } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';

function LikeButton({ contentId }: { contentId: string }) {
  const { firestore, user, isUserLoading } = useFirebase();
  const { toast } = useToast();

  const [likeCount, setLikeCount] = useState<number | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!firestore || !mounted) return;
    // Read from placeholderVideos collection
    const docRef = doc(firestore, 'placeholderVideos', contentId);
    const unsubscribe = onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        // Support both old structure (count) and new structure (metadata.likes)
        const likes = data.metadata?.likes ?? data.count ?? 0;
        setLikeCount(likes);
      } else {
        setLikeCount(0);
      }
    });
    return () => unsubscribe();
  }, [firestore, contentId, mounted]);

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

  }, [firestore, user, contentId, mounted]);

  const handleLike = useCallback(async () => {
    if (isLiking) return;
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'Please sign in to like content.',
        variant: 'destructive',
      });
      return;
    }
    setIsLiking(true);

    try {
      await runTransaction(firestore, async (transaction) => {
        const docRef = doc(firestore, 'placeholderVideos', contentId);
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
    } catch (error: any) {
      console.error("Like transaction failed: ", error);
      toast({
        title: 'Error',
        description: 'Could not update like status. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLiking(false);
    }
  }, [isLiking, user, contentId, toast, firestore]);

  if (!mounted) {
    return (
      <div className="flex items-center gap-1 text-muted-foreground">
        <span className="text-xs">-</span>
        <Button variant="outline" size="icon" className="w-8 h-8" disabled>
          <Heart className="w-4 h-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 text-muted-foreground">
        {likeCount !== null ? <span>{likeCount.toLocaleString()}</span> : <Loader2 className="h-4 w-4 animate-spin" />}
       <Button variant="outline" size="icon" className="w-8 h-8" onClick={handleLike} disabled={isLiking || isUserLoading}>
        <Heart className="w-4 h-4" fill={isLiked ? 'currentColor' : 'none'} />
      </Button>
    </div>
  );
}

export default function VideoExamples() {
  const videoContent = useMemo(() => {
    return PlaceHolderVideos.slice(0, 9);
  }, []);

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {videoContent.map(item => (
          <Card
            key={item.id}
            className="overflow-hidden group h-full flex flex-col bg-card"
          >
            <CardHeader className="p-4">
              <CardTitle className="font-headline text-lg">
                {item.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-4 flex-grow">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Tag className="w-4 h-4" />
                <span className="truncate">{item.tags.join(', ')}</span>
              </div>
              <div className="relative aspect-[3/4] rounded-md overflow-hidden">
                <video
                  src={item.imageUrl}
                  playsInline
                  controls
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="text-sm text-muted-foreground">Duration: 5 seconds</p>
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
                    <Link href={`/gallery-videos/${item.id}`}>View</Link>
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

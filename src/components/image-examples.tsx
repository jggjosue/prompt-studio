
'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useFirebase } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { doc, getDoc, onSnapshot, runTransaction, serverTimestamp } from 'firebase/firestore';
import { Heart, Loader2, Tag, Wand2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';


function LikeButtonContent({ contentId, contentType }: { contentId: string; contentType: string }) {
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
    const docRef = doc(firestore, collection, contentId);
    const unsubscribe = onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        const likes = data.metadata?.likes ?? data.likes ?? 0;
        setLikeCount(likes);
      } else {
        setLikeCount(0);
      }
    });
    return () => unsubscribe();
  }, [firestore, contentId, mounted, collection]);

  useEffect(() => {
    if (!firestore || !user || !mounted) {
        setIsLiked(false);
        return;
    };
    const checkLikeStatus = async () => {
        const userLikeRef = doc(firestore, `${collection}/${user.uid}/items/${contentId}`);
        const docSnap = await getDoc(userLikeRef);
        setIsLiked(docSnap.exists());
    }
    checkLikeStatus();

    const userLikeRef = doc(firestore, `${collection}/${user.uid}/items/${contentId}`);
    const unsubscribe = onSnapshot(userLikeRef, (docSnap) => {
        setIsLiked(docSnap.exists());
    });

    return () => unsubscribe();
  }, [firestore, user, contentId, mounted, collection]);

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
        const docRef = doc(firestore, collection, contentId);
        const userLikeRef = doc(firestore, `${collection}/${user.uid}/items/${contentId}`);

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
  }, [isLiking, user, contentId, toast, firestore, collection]);

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

function LikeButton({ contentId, contentType }: { contentId: string; contentType: string }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  return <LikeButtonContent contentId={contentId} contentType={contentType} />;
}

function ImageExamplesContent() {
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
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-4 flex-grow">
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
                  <LikeButton contentId={item.id} contentType={item.type} />
                </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </>
  );
}

export default function ImageExamples() {
  return (
    <Suspense fallback={<div className="flex w-full justify-center py-10"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>}>
      <ImageExamplesContent />
    </Suspense>
  );
}

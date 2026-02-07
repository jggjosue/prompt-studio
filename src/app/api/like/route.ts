// src/app/api/like/route.ts
import { db } from '@/firebase/config';
import { doc, runTransaction, serverTimestamp } from 'firebase/firestore';
import { NextResponse } from 'next/server';

// IMPORTANT: This endpoint is missing proper authentication.
// In a real application, you must verify the user's identity before allowing them to like content.
// This typically involves:
// 1. The client sending an ID token in the Authorization header.
// 2. The server verifying this token using Firebase Admin SDK.
// 3. Getting the user's UID from the verified token.

// The `userId` is currently passed in the request body from the client, which is INSECURE for a production app.
// It is used here as a placeholder for a proper server-side authentication mechanism.

export async function POST(request: Request) {
  // This is a placeholder for proper server-side user authentication.
  const { docId, collectionName, userId } = await request.json();

  if (!userId) {
    return NextResponse.json({ message: 'Unauthorized: userId is missing.' }, { status: 401 });
  }

  if (!docId || !collectionName || !['placeholderImages', 'placeholderVideos'].includes(collectionName)) {
    return NextResponse.json({ message: 'Invalid request body. "docId" and "collectionName" are required.' }, { status: 400 });
  }

  try {
    const newLikesCount = await runTransaction(db, async (transaction) => {
      const docRef = doc(db, collectionName, docId);
      const userLikeRef = doc(db, `user-likes/${userId}/items/${docId}`);

      const docSnap = await transaction.get(docRef);
      const userLikeSnap = await transaction.get(userLikeRef);

      // If document doesn't exist, create it with initial like
      if (!docSnap.exists()) {
        console.log(`[Like] Document ${collectionName}/${docId} does not exist. Creating with initial like.`);
        transaction.set(userLikeRef, { likedAt: serverTimestamp() });
        transaction.set(docRef, { 
          metadata: { likes: 1 } 
        }, { merge: true });
        return 1;
      }

      const docData = docSnap.data();
      // Support both old structure (count/likes) and new structure (metadata.likes)
      const currentLikes = docData.metadata?.likes ?? docData.count ?? docData.likes ?? 0;
      let newLikes;

      if (userLikeSnap.exists()) {
        // User has already liked this, so "unlike" it.
        transaction.delete(userLikeRef);
        newLikes = currentLikes - 1;
        // Ensure likes don't go below zero.
        if (newLikes < 0) {
          newLikes = 0;
        }
        // Update only metadata.likes using set with merge to handle missing metadata field
        transaction.set(docRef, { metadata: { likes: newLikes } }, { merge: true });
      } else {
        // User has not liked this yet, so "like" it.
        transaction.set(userLikeRef, { likedAt: serverTimestamp() });
        newLikes = currentLikes + 1;
        // Update only metadata.likes using set with merge to handle missing metadata field
        transaction.set(docRef, { metadata: { likes: newLikes } }, { merge: true });
      }
      
      return newLikes;
    });

    return NextResponse.json({ likes: newLikesCount });

  } catch (error: any) {
    console.error('Error in /api/like:', error);
    // Return a more generic error message to the client.
    return NextResponse.json({ message: 'An internal error occurred while updating like status.', error: error.message }, { status: 500 });
  }
}

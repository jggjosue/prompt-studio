// scripts/sync-likes.ts
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore';
import { firebaseConfig } from '../src/firebase/config';
import * as fs from 'fs/promises';
import * as path from 'path';

// This script synchronizes the 'likes' count from Firestore back to the local JSON files.
// It iterates through the local JSON data, finds the corresponding document in Firestore by 'title',
// and updates the 'likes' field in the JSON file with the value from the database.

// --- Firebase Initialization ---
// Make sure the firebaseConfig is correct and you have access to the project.
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// --- File Paths (bundled JSON lives under public/prompts) ---
const imagesJsonPath = path.resolve(__dirname, '../public/prompts/placeholder-images.json');
const videosJsonPath = path.resolve(__dirname, '../public/prompts/placeholder-videos.json');

type PlaceholderImagesFile = { placeholderImages: Array<Record<string, unknown> & { title: string; likes?: number }> };
type PlaceholderVideosFile = { placeholderVideos: Array<Record<string, unknown> & { title: string; likes?: number }> };

async function syncLikes() {
  console.log('Starting likes synchronization...');

  // --- Sync Images ---
  try {
    console.log('Syncing placeholderImages...');
    const imagesJsonContent = await fs.readFile(imagesJsonPath, 'utf-8');
    const imagesPayload = JSON.parse(imagesJsonContent) as PlaceholderImagesFile;

    if (!Array.isArray(imagesPayload.placeholderImages)) {
      throw new Error('Invalid placeholder-images.json: missing placeholderImages array');
    }

    const imagesCollectionRef = collection(db, 'placeholderImages');

    for (const image of imagesPayload.placeholderImages) {
      const q = query(imagesCollectionRef, where('title', '==', image.title));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const firestoreDoc = querySnapshot.docs[0];
        const firestoreLikes = firestoreDoc.data().likes || 0;

        if (image.likes !== firestoreLikes) {
          console.log(`Updating likes for image "${image.title}": ${image.likes ?? 0} -> ${firestoreLikes}`);
          image.likes = firestoreLikes;
        }
      } else {
        console.warn(`No document found in Firestore for image with title: "${image.title}"`);
      }
    }

    await fs.writeFile(imagesJsonPath, JSON.stringify(imagesPayload, null, 2) + '\n');
    console.log('Finished syncing placeholderImages.');
  } catch (error) {
    console.error('Error syncing images:', error);
  }

  // --- Sync Videos ---
  try {
    console.log('Syncing placeholderVideos...');
    const videosJsonContent = await fs.readFile(videosJsonPath, 'utf-8');
    const videosPayload = JSON.parse(videosJsonContent) as PlaceholderVideosFile;

    if (!Array.isArray(videosPayload.placeholderVideos)) {
      throw new Error('Invalid placeholder-videos.json: missing placeholderVideos array');
    }

    const videosCollectionRef = collection(db, 'placeholderVideos');

    for (const video of videosPayload.placeholderVideos) {
      const q = query(videosCollectionRef, where('title', '==', video.title));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const firestoreDoc = querySnapshot.docs[0];
        const firestoreLikes = firestoreDoc.data().likes || 0;

        if (video.likes !== firestoreLikes) {
          console.log(`Updating likes for video "${video.title}": ${video.likes ?? 0} -> ${firestoreLikes}`);
          video.likes = firestoreLikes;
        }
      } else {
        console.warn(`No document found in Firestore for video with title: "${video.title}"`);
      }
    }

    await fs.writeFile(videosJsonPath, JSON.stringify(videosPayload, null, 2) + '\n');
    console.log('Finished syncing placeholderVideos.');
  } catch (error) {
    console.error('Error syncing videos:', error);
  }

  console.log('Likes synchronization completed.');
  process.exit(0);
}

syncLikes();

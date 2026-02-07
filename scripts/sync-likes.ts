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

// --- File Paths ---
const imagesJsonPath = path.resolve(__dirname, '../src/lib/placeholder-images.json');
const videosJsonPath = path.resolve(__dirname, '../src/lib/placeholder-videos.json');


async function syncLikes() {
  console.log('Starting likes synchronization...');

  // --- Sync Images ---
  try {
    console.log('Syncing placeholderImages...');
    const imagesJsonContent = await fs.readFile(imagesJsonPath, 'utf-8');
    const imagesData = JSON.parse(imagesJsonContent);

    const imagesCollectionRef = collection(db, 'placeholderImages');

    for (const image of imagesData) {
      const q = query(imagesCollectionRef, where('title', '==', image.title));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        // Assuming titles are unique, take the first result.
        const firestoreDoc = querySnapshot.docs[0];
        const firestoreLikes = firestoreDoc.data().likes || 0;
        
        if (image.likes !== firestoreLikes) {
          console.log(`Updating likes for image "${image.title}": ${image.likes || 0} -> ${firestoreLikes}`);
          image.likes = firestoreLikes;
        }
      } else {
        console.warn(`No document found in Firestore for image with title: "${image.title}"`);
      }
    }

    await fs.writeFile(imagesJsonPath, JSON.stringify(imagesData, null, 2));
    console.log('Finished syncing placeholderImages.');

  } catch (error) {
    console.error('Error syncing images:', error);
  }


  // --- Sync Videos ---
  try {
    console.log('Syncing placeholderVideos...');
    const videosJsonContent = await fs.readFile(videosJsonPath, 'utf-8');
    const videosData = JSON.parse(videosJsonContent);

    const videosCollectionRef = collection(db, 'placeholderVideos');

    for (const video of videosData) {
      const q = query(videosCollectionRef, where('title', '==', video.title));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const firestoreDoc = querySnapshot.docs[0];
        const firestoreLikes = firestoreDoc.data().likes || 0;

        if (video.likes !== firestoreLikes) {
          console.log(`Updating likes for video "${video.title}": ${video.likes || 0} -> ${firestoreLikes}`);
          video.likes = firestoreLikes;
        }
      } else {
        console.warn(`No document found in Firestore for video with title: "${video.title}"`);
      }
    }

    await fs.writeFile(videosJsonPath, JSON.stringify(videosData, null, 2));
    console.log('Finished syncing placeholderVideos.');

  } catch (error) {
    console.error('Error syncing videos:', error);
  }

  console.log('Likes synchronization completed.');
  // The script will exit, but since we are using Node v18+ it should exit automatically
  // even with the open Firebase connection. If not, this process needs to be killed manually (Ctrl+C).
  // For a more robust solution, you can call process.exit(0) or close the db connection.
  process.exit(0);
}

syncLikes();

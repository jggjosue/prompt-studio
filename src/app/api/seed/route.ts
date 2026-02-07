'use server';

import { NextResponse } from 'next/server';
import { db } from '@/firebase/config';
import { collection, doc, writeBatch } from 'firebase/firestore';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { PlaceHolderVideos } from '@/lib/placeholder-videos';

export async function GET() {
  console.log('Seeding database...');
  try {
    const batch = writeBatch(db);

    // Seed Images
    const placeholderImagesCollection = collection(db, 'placeholderImages');
    PlaceHolderImages.forEach((image) => {
      const docRef = doc(placeholderImagesCollection, image.id);
      batch.set(docRef, { title: image.title });
    });

    // Seed Videos
    const placeholderVideosCollection = collection(db, 'placeholderVideos');
    PlaceHolderVideos.forEach((video) => {
      const docRef = doc(placeholderVideosCollection, video.id);
      batch.set(docRef, { title: video.title, likes: 0 });
    });

    await batch.commit();
    console.log('Database seeded successfully with images and videos!');
    return NextResponse.json({
      message: 'Database seeded successfully with images and videos!',
    });
  } catch (error: any) {
    console.error('Error seeding database:', error);
    return NextResponse.json(
      { message: 'Error seeding database.', error: error.message },
      { status: 500 }
    );
  }
}

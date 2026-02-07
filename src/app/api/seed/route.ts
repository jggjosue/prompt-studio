'use server';

import { NextResponse } from 'next/server';
import { db } from '@/firebase/config';
import { collection, doc, writeBatch } from 'firebase/firestore';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export async function GET() {
  console.log('Seeding database...');
  try {
    const placeholderImagesCollection = collection(db, 'placeholderImages');
    const batch = writeBatch(db);

    PlaceHolderImages.forEach((image) => {
      // Use image.id as the document ID
      const docRef = doc(placeholderImagesCollection, image.id);
      batch.set(docRef, { title: image.title });
    });

    await batch.commit();
    console.log('Database seeded successfully!');
    return NextResponse.json({ message: 'Database seeded successfully!' });
  } catch (error: any) {
    console.error('Error seeding database:', error);
    return NextResponse.json(
      { message: 'Error seeding database.', error: error.message },
      { status: 500 }
    );
  }
}

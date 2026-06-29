import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongoose';
import NewUser from '@/models/NewUser';
import { upsertLoopsContact, sendLoopsEvent } from '@/lib/loops';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Correo electrónico no válido' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Check if user already exists
    const existingUser = await NewUser.findOne({ email });
    if (!existingUser) {
      await NewUser.create({ email });
    }

    await upsertLoopsContact({
      email,
      source: 'free-email-gate',
      subscribed: true,
      userGroup: 'free-leads',
    }).catch(error => {
      console.error('Failed to sync free lead to Loops:', error);
    });

    await sendLoopsEvent({
      email,
      eventName: 'prompt_studio_download',
      eventProperties: {
        source: 'free-email-gate',
      },
      mailingLists: {
        resources: true,
      },
    }, email).catch(error => {
      console.error('Failed to send free lead event to Loops:', error);
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving new user:', error);
    return NextResponse.json(
      { error: 'Error al guardar el usuario' },
      { status: 500 }
    );
  }
}

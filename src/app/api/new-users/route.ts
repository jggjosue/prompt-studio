import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongoose';
import NewUser from '@/models/NewUser';

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

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving new user:', error);
    return NextResponse.json(
      { error: 'Error al guardar el usuario' },
      { status: 500 }
    );
  }
}

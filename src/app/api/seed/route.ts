'use server';

import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json(
    { message: 'Seed API disabled: Firebase integration was removed.' },
    { status: 501 }
  );
}

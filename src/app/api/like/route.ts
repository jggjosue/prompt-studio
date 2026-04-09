import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  void request;
  return NextResponse.json(
    { message: 'Like API disabled: Firebase integration was removed.' },
    { status: 501 }
  );
}

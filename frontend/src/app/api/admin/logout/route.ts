import { NextRequest, NextResponse } from 'next/server';
import { buildLogoutResponse } from '@/lib/auth/logoutHelper';

export async function POST(request: NextRequest) {
  try {
    return await buildLogoutResponse(request, 'admin');
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json({ detail: 'Error del servidor' }, { status: 500 });
  }
}

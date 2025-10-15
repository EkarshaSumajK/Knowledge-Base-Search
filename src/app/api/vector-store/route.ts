import { NextResponse } from 'next/server';
import { getVectorStoreStats } from '@/lib/vector-store';

export async function GET() {
  const stats = getVectorStoreStats();
  return NextResponse.json(stats);
}

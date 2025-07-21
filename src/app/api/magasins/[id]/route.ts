import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Magasin from '@/models/Magasin';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  await dbConnect();
  const { id } = params;
  const deleted = await Magasin.findByIdAndDelete(id);
  if (!deleted) {
    return NextResponse.json({ error: 'Magasin non trouvé.' }, { status: 404 });
  }
  return NextResponse.json({ success: true });
} 
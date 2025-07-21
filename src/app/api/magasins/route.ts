import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Magasin from '@/models/Magasin';

export async function GET() {
  await dbConnect();
  const magasins = await Magasin.find();
  return NextResponse.json(magasins);
}

export async function POST(req: NextRequest) {
  await dbConnect();
  const { nom, code } = await req.json();
  if (!nom || !code) {
    return NextResponse.json({ error: 'Nom et code requis.' }, { status: 400 });
  }
  const exists = await Magasin.findOne({ code });
  if (exists) {
    return NextResponse.json({ error: 'Code magasin déjà utilisé.' }, { status: 409 });
  }
  const magasin = await Magasin.create({ nom, code });
  return NextResponse.json(magasin, { status: 201 });
} 
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import User from '@/models/User';
import { hashPassword } from '@/lib/auth';
import { verifyJwt } from '@/lib/auth';

export async function GET(req: NextRequest) {
  await dbConnect();
  const auth = req.headers.get('authorization');
  if (!auth) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  const token = auth.replace('Bearer ', '');
  const payload = verifyJwt(token);
  if (!payload || payload.role !== 'admin') return NextResponse.json({ error: 'Admin uniquement' }, { status: 403 });
  const users = await User.find({ role: 'responsable' }).populate('magasinId');
  return NextResponse.json(users);
}

export async function POST(req: NextRequest) {
  await dbConnect();
  const auth = req.headers.get('authorization');
  if (!auth) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  const token = auth.replace('Bearer ', '');
  const payload = verifyJwt(token);
  if (!payload || payload.role !== 'admin') return NextResponse.json({ error: 'Admin uniquement' }, { status: 403 });
  const { email, password, magasinId } = await req.json();
  if (!email || !password || !magasinId) {
    return NextResponse.json({ error: 'Champs requis manquants.' }, { status: 400 });
  }
  const exists = await User.findOne({ email });
  if (exists) {
    return NextResponse.json({ error: 'Email déjà utilisé.' }, { status: 409 });
  }
  const hash = await hashPassword(password);
  const user = await User.create({ email, password: hash, role: 'responsable', magasinId });
  return NextResponse.json(user, { status: 201 });
} 
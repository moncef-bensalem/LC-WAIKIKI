import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import User from '@/models/User';
import { hashPassword, verifyJwt } from '@/lib/auth';

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  await dbConnect();
  const auth = req.headers.get('authorization');
  if (!auth) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  const token = auth.replace('Bearer ', '');
  const payload = verifyJwt(token);
  if (!payload || payload.role !== 'admin') return NextResponse.json({ error: 'Admin uniquement' }, { status: 403 });
  const deleted = await User.findOneAndDelete({ _id: params.id, role: 'responsable' });
  if (!deleted) return NextResponse.json({ error: 'Utilisateur non trouvé.' }, { status: 404 });
  return NextResponse.json({ success: true });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  await dbConnect();
  const auth = req.headers.get('authorization');
  if (!auth) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  const token = auth.replace('Bearer ', '');
  const payload = verifyJwt(token);
  if (!payload || payload.role !== 'admin') return NextResponse.json({ error: 'Admin uniquement' }, { status: 403 });
  const { email, password, magasinId } = await req.json();
  const update: any = {};
  if (email) update.email = email;
  if (password) update.password = await hashPassword(password);
  if (magasinId) update.magasinId = magasinId;
  const user = await User.findOneAndUpdate({ _id: params.id, role: 'responsable' }, update, { new: true });
  if (!user) return NextResponse.json({ error: 'Utilisateur non trouvé.' }, { status: 404 });
  return NextResponse.json(user);
} 
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import User from '@/models/User';
import { comparePassword, signJwt } from '@/lib/auth';

export async function POST(req: NextRequest) {
  await dbConnect();
  const { email, password } = await req.json();
  if (!email || !password) {
    return NextResponse.json({ error: 'Email et mot de passe requis.' }, { status: 400 });
  }
  const user = await User.findOne({ email });
  if (!user) {
    return NextResponse.json({ error: 'Utilisateur non trouvé.' }, { status: 401 });
  }
  const valid = await comparePassword(password, user.password);
  if (!valid) {
    return NextResponse.json({ error: 'Mot de passe incorrect.' }, { status: 401 });
  }
  const token = signJwt({ id: user._id, role: user.role, magasinId: user.magasinId });
  return NextResponse.json({ token, user: { id: user._id, email: user.email, role: user.role, magasinId: user.magasinId } });
} 
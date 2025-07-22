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
  if (
    !payload ||
    typeof payload !== "object" ||
    payload === null ||
    !("role" in payload)
  ) {
    return NextResponse.json({ error: "Admin uniquement" }, { status: 403 });
  }
  const jwtPayload = payload as { role: string };
  if (jwtPayload.role !== "admin") {
    return NextResponse.json({ error: "Admin uniquement" }, { status: 403 });
  }
  try {
    const deleted = await User.findOneAndDelete({ _id: params.id, role: 'responsable' });
    if (!deleted) return NextResponse.json({ error: 'Utilisateur non trouvé.' }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    if (err instanceof Error) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'Une erreur interne est survenue.' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  await dbConnect();
  const auth = req.headers.get('authorization');
  if (!auth) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  const token = auth.replace('Bearer ', '');
  const payload = verifyJwt(token);
  if (
    !payload ||
    typeof payload !== "object" ||
    payload === null ||
    !("role" in payload)
  ) {
    return NextResponse.json({ error: "Admin uniquement" }, { status: 403 });
  }
  const jwtPayload = payload as { role: string };
  if (jwtPayload.role !== "admin") {
    return NextResponse.json({ error: "Admin uniquement" }, { status: 403 });
  }
  try {
    const { email, password, magasinId } = await req.json();
    // Remplacer 'unknown' par un type explicite pour update
    const update: Record<string, any> = {};
    if (email) update.email = email;
    if (password) update.password = await hashPassword(password);
    if (magasinId) update.magasinId = magasinId;
    const user = await User.findOneAndUpdate({ _id: params.id, role: 'responsable' }, update, { new: true });
    if (!user) return NextResponse.json({ error: 'Utilisateur non trouvé.' }, { status: 404 });
    return NextResponse.json(user);
  } catch (err: unknown) {
    if (err instanceof Error) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'Une erreur interne est survenue.' }, { status: 500 });
  }
} 
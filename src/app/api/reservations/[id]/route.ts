import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Reservation from '@/models/Reservation';
import { verifyJwt } from '@/lib/auth';

export async function PATCH(req: NextRequest, context: { params: { id: string } }) {
  await dbConnect();
  const auth = req.headers.get('authorization');
  if (!auth) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  const token = auth.replace('Bearer ', '');
  const payload = verifyJwt(token);
  if (!payload) return NextResponse.json({ error: 'Token invalide' }, { status: 401 });

  const { statut } = await req.json();
  if (!['en attente', 'confirmee', 'recuperee', 'annulee'].includes(statut)) {
    return NextResponse.json({ error: 'Statut invalide.' }, { status: 400 });
  }
  const id = context.params.id;
  const reservation = await Reservation.findById(id);
  if (!reservation) {
    return NextResponse.json({ error: 'Réservation non trouvée.' }, { status: 404 });
  }
  // Seul le créateur, un admin ou le responsable du magasin source peut changer le statut
  if (
    payload.role !== 'admin' &&
    String(reservation.creePar) !== String(payload.id) &&
    String(reservation.magasinSource) !== String(payload.magasinId)
  ) {
    return NextResponse.json({ error: 'Non autorisé.' }, { status: 403 });
  }
  reservation.statut = statut;
  await reservation.save();
  return NextResponse.json(reservation);
} 
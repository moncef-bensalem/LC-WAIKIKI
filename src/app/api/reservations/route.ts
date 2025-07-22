import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Reservation from '@/models/Reservation';
import { verifyJwt } from '@/lib/auth';
import mongoose from 'mongoose';

export async function GET(req: NextRequest) {
  await dbConnect();
  const auth = req.headers.get('authorization');
  if (!auth) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  const token = auth.replace('Bearer ', '');
  const payload = verifyJwt(token);
  if (!payload) return NextResponse.json({ error: 'Token invalide' }, { status: 401 });

  let filter = {};
  const url = new URL(req.url);
  const type = url.searchParams.get('type');

  if (
    typeof payload === "object" &&
    payload !== null &&
    "role" in payload &&
    "magasinId" in payload &&
    "id" in payload
  ) {
    const jwtPayload = payload as { role: string; magasinId: string; id: string };
    if (jwtPayload.role === "responsable") {
      if (type === "a_traiter") {
        // Réservations à traiter dans mon magasin (magasin source = mon magasin)
        filter = { magasinSource: new mongoose.Types.ObjectId(jwtPayload.magasinId) };
      } else {
        // Réservations créées par moi (magasin destination = mon magasin)
        filter = { magasinDestination: new mongoose.Types.ObjectId(jwtPayload.magasinId), creePar: jwtPayload.id };
      }
    }
  }
  // Admin : voit tout
  const reservations = await Reservation.find(filter)
    .populate('magasinSource')
    .populate('magasinDestination')
    .populate('creePar');
  return NextResponse.json(reservations);
}

export async function POST(req: NextRequest) {
  await dbConnect();
  const auth = req.headers.get('authorization');
  if (!auth) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  const token = auth.replace('Bearer ', '');
  const payload = verifyJwt(token);
  if (!payload) return NextResponse.json({ error: 'Token invalide' }, { status: 401 });

  // Vérification stricte du type de payload pour POST
  let jwtPayload: { id: string } | null = null;
  if (typeof payload === "object" && payload !== null && "id" in payload) {
    jwtPayload = payload as { id: string };
  }

  const { referenceArticle, nomClient, telephone, magasinSource, magasinDestination } = await req.json();
  if (!referenceArticle || !nomClient || !telephone || !magasinSource || !magasinDestination) {
    return NextResponse.json({ error: 'Champs requis manquants.' }, { status: 400 });
  }
  const reservation = await Reservation.create({
    referenceArticle,
    nomClient,
    telephone,
    magasinSource,
    magasinDestination,
    creePar: jwtPayload ? jwtPayload.id : undefined,
    statut: 'en attente',
  });
  return NextResponse.json(reservation, { status: 201 });
} 
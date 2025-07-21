import mongoose, { Schema, Document, models, model } from 'mongoose';

export interface IReservation extends Document {
  referenceArticle: string;
  nomClient: string;
  telephone: string;
  magasinSource: mongoose.Types.ObjectId;
  magasinDestination: mongoose.Types.ObjectId;
  creePar: mongoose.Types.ObjectId;
  statut: 'en attente' | 'confirmee' | 'recuperee';
}

const ReservationSchema = new Schema<IReservation>({
  referenceArticle: { type: String, required: true },
  nomClient: { type: String, required: true },
  telephone: { type: String, required: true },
  magasinSource: { type: Schema.Types.ObjectId, ref: 'Magasin', required: true },
  magasinDestination: { type: Schema.Types.ObjectId, ref: 'Magasin', required: true },
  creePar: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  statut: { type: String, enum: ['en attente', 'confirmee', 'recuperee'], default: 'en attente' },
}, { timestamps: true });

export default models.Reservation || model<IReservation>('Reservation', ReservationSchema); 
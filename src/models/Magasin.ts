import mongoose, { Schema, Document, models, model } from 'mongoose';

export interface IMagasin extends Document {
  nom: string;
  code: string;
}

const MagasinSchema = new Schema<IMagasin>({
  nom: { type: String, required: true },
  code: { type: String, required: true, unique: true },
});

export default models.Magasin || model<IMagasin>('Magasin', MagasinSchema); 
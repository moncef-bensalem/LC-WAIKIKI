import mongoose, { Schema, Document, models, model } from 'mongoose';

export interface IUser extends Document {
  email: string;
  password: string;
  role: 'admin' | 'responsable';
  magasinId: mongoose.Types.ObjectId;
}

const UserSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'responsable'], required: true },
  magasinId: { type: Schema.Types.ObjectId, ref: 'Magasin', required: function() { return this.role === 'responsable'; } },
});

export default models.User || model<IUser>('User', UserSchema); 
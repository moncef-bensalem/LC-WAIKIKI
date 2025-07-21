const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config({ path: './.env' }); // Lancer ce script depuis la racine du projet !
console.log('DEBUG MONGODB_URI:', process.env.MONGODB_URI);

async function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

// Schéma User minimal pour création d'admin
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'responsable'], required: true },
  magasinId: { type: mongoose.Schema.Types.ObjectId, ref: 'Magasin' },
});
const User = mongoose.models.User || mongoose.model('User', userSchema);

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  const email = 'AdminLc@gmail.com';
  const password = 'LC12123';
  const hash = await hashPassword(password);
  const exists = await User.findOne({ email });
  if (exists) {
    console.log('Un utilisateur avec cet email existe déjà.');
    process.exit(1);
  }
  await User.create({ email, password: hash, role: 'admin' });
  console.log('Admin créé avec succès.');
  process.exit(0);
}

main(); 
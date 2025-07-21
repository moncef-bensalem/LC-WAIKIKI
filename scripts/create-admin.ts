const mongoose = require('mongoose');
const readline = require('readline');
const dotenv = require('dotenv');
const { hashPassword } = require('../src/lib/auth');
const User = require('../src/models/User').default;

dotenv.config({ path: '../.env.local' });

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function ask(question) {
  return new Promise(resolve => rl.question(question, resolve));
}

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  const email = await ask('Email admin: ');
  const password = await ask('Mot de passe: ');
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
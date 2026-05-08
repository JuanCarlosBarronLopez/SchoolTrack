import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../models/User.js';

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/schooltrack');
    console.log('✅ Conectado a MongoDB');

    await User.collection.createIndex({ 'profile.currentLocation': '2dsphere' }, { background: true });
    console.log('🧭 Índice 2dsphere creado en profile.currentLocation');

    process.exit(0);
  } catch (err) {
    console.error('❌ Error creando índices:', err);
    process.exit(1);
  }
})();

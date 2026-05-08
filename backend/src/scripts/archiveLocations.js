import 'dotenv/config';
import mongoose from 'mongoose';
import Location from '../models/Location.js';

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const cutoff = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    const old = await Location.find({ timestamp: { $lt: cutoff } }).lean();

    if (!old.length) {
      console.log('🗂️ No hay ubicaciones antiguas para archivar.');
      process.exit(0);
    }

    const db = mongoose.connection.db;
    await db.collection('locations_archive').insertMany(old);
    await Location.deleteMany({ _id: { $in: old.map(d => d._id) } });

    console.log(`✅ Archivadas ${old.length} ubicaciones antiguas.`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Error archivando ubicaciones:', err);
    process.exit(1);
  }
})();

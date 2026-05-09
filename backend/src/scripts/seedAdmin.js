import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import User from '../models/User.js';
import connectDB from '../config/db.js';

// Cargar variables de entorno
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../../../.env') });

const createAdmin = async () => {
  try {
    await connectDB();

    const adminEmail = process.env.DEFAULT_ADMIN_EMAIL || 'admin@schooltrack.com';
    const adminPassword = process.env.DEFAULT_ADMIN_PASSWORD || 'Admin123!';

    // Verificar si ya existe un admin con ese correo
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (existingAdmin) {
      console.log(`⚠️ El administrador ${adminEmail} ya existe en la base de datos.`);
      process.exit(0);
    }

    // Crear el nuevo usuario administrador
    const newAdmin = new User({
      firstName: 'Super',
      lastName: 'Admin',
      email: adminEmail,
      password: adminPassword,
      role: 'admin',
      status: 'active',
      isVerified: true
    });

    await newAdmin.save();
    console.log(`✅ Administrador creado exitosamente.`);
    console.log(`📧 Email: ${adminEmail}`);
    console.log(`🔑 Contraseña: ${adminPassword}`);
    console.log(`⚠️ Se recomienda cambiar la contraseña después del primer inicio de sesión.`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error al crear administrador:', error.message);
    process.exit(1);
  }
};

createAdmin();

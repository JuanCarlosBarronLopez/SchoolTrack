#!/usr/bin/env node

/**
 * Script para crear el primer administrador en la base de datos.
 * Uso: node seed-admin.js <email> <password>
 */

require('dotenv').config();

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { Profile, User, UserRole } = require('./models');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/schooltrack';

async function seedAdmin() {
  try {
    await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Conectado a MongoDB');

    const email = process.argv[2];
    const password = process.argv[3];

    if (!email || !password) {
      console.error('Uso: node seed-admin.js <email> <password>');
      process.exit(1);
    }

    // Verificar si el usuario ya existe
    const existing = await User.findOne({ email });
    if (existing) {
      console.error('Error: El usuario ya existe');
      process.exit(1);
    }

    // Crear perfil
    const profile = new Profile({ email, full_name: 'Administrador' });
    await profile.save();
    console.log(`Perfil creado: ${profile._id}`);

    // Crear usuario con hash de contraseña
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    const user = new User({ email, passwordHash: hash, profile_id: profile._id });
    await user.save();
    console.log(`Usuario creado: ${user._id}`);

    // Asignar rol de administrador
    const role = new UserRole({ user_id: profile._id, role: 'admin' });
    await role.save();
    console.log(`Rol admin asignado`);

    console.log(`\nAdministrador creado exitosamente:`);
    console.log(`Email: ${email}`);
    console.log(`Contraseña: ${password}`);

    await mongoose.connection.close();
    console.log('\nConexión cerrada');
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

seedAdmin();

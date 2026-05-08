import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    // Usar MONGODB_URI (de Render) primero, luego MONGO_URI como fallback
    const uri = process.env.MONGODB_URI || process.env.MONGO_URI;

    if (!uri) {
      console.warn('⚠️ Aviso: MONGODB_URI o MONGO_URI no están definidas.');
      console.warn('   El servidor arrancará en modo degradado sin conexión a DB.');
      console.warn('   Para habilitar la DB, añade MONGODB_URI en las variables de entorno.');
      return null;
    }

    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });

    console.log(`✅ MongoDB conectado en: ${conn.connection.host}`);
    console.log(`   Base de datos: ${conn.connection.name}`);

    return conn;
  } catch (error) {
    console.error(`❌ Error conectando MongoDB:`);
    console.error(`   ${error.message}`);

    if (error.message && error.message.includes('ECONNREFUSED')) {
      console.error(`   💡 MongoDB no está ejecutándose localmente`);
      console.error(`   💡 Si necesitas DB, configura MONGODB_URI en Render`);
    }

    console.warn('⚠️ Continuando sin conexión a la base de datos (modo degradado).');
    return null;
  }
};

export default connectDB;
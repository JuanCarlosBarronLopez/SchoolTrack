import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI || process.env.MONGO_URI;

    if (!uri) {
      console.warn('⚠️ MONGODB_URI no definida. Modo degradado.');
      return null;
    }

    // Log sanitizado (ocultar password)
    const sanitized = uri.replace(/:([^@]+)@/, ':****@');
    console.log(`🔌 Intentando conectar a MongoDB: ${sanitized}`);

    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 15000,
      socketTimeoutMS: 45000,
    });

    console.log(`✅ MongoDB conectado en: ${conn.connection.host}`);
    console.log(`   Base de datos: ${conn.connection.name}`);
    return conn;

  } catch (error) {
    console.error(`❌ Error conectando MongoDB:`);
    console.error(`   Tipo: ${error.name}`);
    console.error(`   Mensaje: ${error.message}`);
    
    if (error.reason) {
      console.error(`   Razón: ${JSON.stringify(error.reason)}`);
    }

    // Intentar reconexión después de 5 segundos
    console.log('🔄 Reintentando conexión en 5 segundos...');
    await new Promise(r => setTimeout(r, 5000));
    
    try {
      const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
      const conn = await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 30000,
        socketTimeoutMS: 45000,
      });
      console.log(`✅ MongoDB conectado en reintento: ${conn.connection.host}`);
      return conn;
    } catch (retryError) {
      console.error(`❌ Reintento fallido: ${retryError.message}`);
      console.warn('⚠️ Continuando sin conexión a la base de datos.');
      return null;
    }
  }
};

export default connectDB;
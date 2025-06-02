import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors'
import authRoutes from './routes/authRoutes';
import roomRoutes from './routes/roomRoutes';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (_, res) => {
  res.send('MiCasaHoy API funcionando con TypeScript');
});

app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);

const start = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI as string);
    console.log('✅ MongoDB conectado');

    const port = process.env.PORT || 5000;
    app.listen(port, () => {
      console.log(`🚀 Servidor corriendo en puerto ${port}`);
    });
  } catch (error) {
    console.error('❌ Error al conectar a MongoDB', error);
    process.exit(1);
  }
};

export default start;
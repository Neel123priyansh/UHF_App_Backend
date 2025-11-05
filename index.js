import express from 'express'
import { connect } from 'mongoose'
import pkg from 'body-parser'
import cors from 'cors'
import Student from './models/Student.js'
import mongoose from "mongoose";


const app = express()
const {json} = pkg
app.use(cors())
app.use(json({ limit: '5mb' }))


const PORT = 4000


async function start() {
    const MONGO_URI = "mongodb+srv://Face:oKQwggoEZUxEmJgP@faceemb.phgcpis.mongodb.net/?appName=FaceEmb";
    mongoose.connect(MONGO_URI || "mongodb://localhost:27017/").then(() => console.log("MongoDB Connected")).catch(err => console.log("MongoDB Connection Error:", err));

  // enroll endpoint
  app.post('/students/enroll', async (req, res) => {
  try {
    const { studentId, name, classId, parentPhone, embedding } = req.body;
    if (!studentId) return res.status(400).json({ error: 'missing studentId' });
    if (!embedding || !Array.isArray(embedding)) return res.status(400).json({ error: 'missing or invalid embedding (must be array)' });

    const len = embedding.length;
    if (![128, 512].includes(len)) {
      return res.status(400).json({ error: 'embedding must be 128 or 512 floats', got: len });
    }

    await Student.updateOne(
      { studentId },
      { studentId, name, classId, parentPhone, embedding, embeddingDim: len, createdAt: new Date() },
      { upsert: true }
    );

    return res.json({ ok: true, embeddingDim: len });
  } catch (e) {
    console.error('ENROLL ERROR', e);
    return res.status(500).json({ error: e.message || 'server error' });
  }
});

  // get class students (minimal)
  app.get('/students/class/:classId', async (req, res) => {
    try {
      const students = await Student
        .find({ classId: req.params.classId }, { studentId: 1, name: 1, embedding: 1 })
        .lean();
      return res.json({ students });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ error: 'server error' });
    }
  });

  app.listen(PORT, () => console.log('Server listening on', PORT));
}

start().catch((err) => {
  console.error(err);
  process.exit(1);
});
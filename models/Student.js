import { Schema, model } from 'mongoose'


const StudentSchema = new Schema({
studentId: { type: String, required: true, unique: true },
name: { type: String },
classId: { type: String },
parentPhone: { type: String },
embedding: { type: [Number], default: [] }, // will store 512 floats
createdAt: { type: Date, default: Date.now }
})


export default model('Student', StudentSchema)
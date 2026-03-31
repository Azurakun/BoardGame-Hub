import mongoose from 'mongoose';

const LocalizedStringSchema = new mongoose.Schema({
    en: { type: String, required: true },
    id: { type: String, required: true }
}, { _id: false });

const CategorySchema = new mongoose.Schema({
    name: { type: LocalizedStringSchema, required: true },
    type: { type: String, enum: ['card', 'wiki', 'mechanic'], default: 'card' }
}, { timestamps: true });

export const CategoryModel = mongoose.model('Category', CategorySchema);

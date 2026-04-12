import mongoose from 'mongoose';

const LocalizedStringSchema = new mongoose.Schema({
    en: { type: String, required: true },
    id: { type: String, required: true }
}, { _id: false });

const CardSchema = new mongoose.Schema({
    gameId: { type: String, required: true, index: true },
    name: { type: LocalizedStringSchema, required: true },
    type: { type: LocalizedStringSchema, required: true },
    effect: { type: LocalizedStringSchema, required: true },
    lore: { type: LocalizedStringSchema, required: false },
    imageUrl: { type: String, default: '' },
    color: { type: String, default: '#6366f1' },
    hp: { type: Number, required: false },
    mana: { type: Number, required: false },
    attack: { type: Number, required: false },
    defense: { type: Number, required: false }
}, { timestamps: true });

export const CardModel = mongoose.model('Card', CardSchema);

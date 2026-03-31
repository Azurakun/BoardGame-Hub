import mongoose from 'mongoose';

const LocalizedStringSchema = new mongoose.Schema({
    en: { type: String, required: true },
    id: { type: String, required: true }
}, { _id: false });

const LocalizedArraySchema = new mongoose.Schema({
    en: [{ type: String }],
    id: [{ type: String }]
}, { _id: false });

const GameSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    name: { type: LocalizedStringSchema, required: true },
    category: [{ type: String }],
    shortDescription: { type: LocalizedStringSchema, required: true },
    description: { type: LocalizedStringSchema, required: true },
    minPlayers: { type: Number, required: true },
    maxPlayers: { type: Number, required: true },
    playTime: { type: Number, required: true },
    complexity: { type: Number, min: 1, max: 5 },
    designer: { type: String },
    yearPublished: { type: Number },
    mechanics: [{ type: String }],
    imageUrl: { type: String, required: true },
    howToPlay: { type: LocalizedArraySchema },
    rules: [{ type: Object }], // Can be structured better later
    faq: [{ type: Object }], // Can be structured better later
    videoUrl: { type: String, default: '' }
}, { timestamps: true });

export const GameModel = mongoose.model('Game', GameSchema);

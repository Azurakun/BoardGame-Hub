import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { createClient } from '@supabase/supabase-js';
import { CardModel } from './models/Card.js';
import { GameModel } from './models/Game.js';
import { CategoryModel } from './models/Category.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(process.cwd(), 'public')));

// Setup upload directory for multer
const uploadDir = path.join(process.cwd(), 'public', 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer Storage Configuration
const storage = multer.memoryStorage(); // Use memory storage since we send it to Supabase immediately
const upload = multer({ storage: storage });

// Supabase Configuration
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_KEY || '';
// Initialize only if keys exist (prevents crashing if user forgets to add them)
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/boardgame-companion';

mongoose.connect(MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// --- UPLOAD ROUTE ---
app.post('/api/upload', upload.single('image'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }
    
    try {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        // Replace spaces with underscores to prevent URL issues
        const safeName = req.file.originalname.replace(/\s+/g, '_');
        const fileName = `${uniqueSuffix}-${safeName}`;

        if (!supabase) {
            console.log('Supabase env vars missing. Saving upload to local storage...');
            const filePath = path.join(uploadDir, fileName);
            await fs.promises.writeFile(filePath, req.file.buffer);
            return res.status(201).json({ url: `/uploads/${fileName}` });
        }
        
        const { data, error } = await supabase.storage
            .from('boardgame-assets') // Make sure you create this bucket in Supabase!
            .upload(fileName, req.file.buffer, {
                contentType: req.file.mimetype,
                upsert: false
            });

        if (error) {
            console.error('Supabase upload error:', error.message);
            return res.status(500).json({ error: 'Failed to upload to cloud storage' });
        }

        const { data: publicUrlData } = supabase.storage
            .from('boardgame-assets')
            .getPublicUrl(fileName);

        // Return the full public URL from Supabase
        res.status(201).json({ url: publicUrlData.publicUrl });
    } catch (err) {
        console.error('Unexpected upload error:', err);
        res.status(500).json({ error: 'Failed to process upload' });
    }
});

// --- CARD ROUTES ---
app.get('/api/cards', async (req, res) => {
    try {
        const cards = await CardModel.find();
        // Rename _id to id for frontend compatibility
        const formattedCards = cards.map(c => ({ ...c.toObject(), id: c._id.toString() }));
        res.json(formattedCards);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch cards' });
    }
});

app.post('/api/cards', async (req, res) => {
    try {
        const newCard = new CardModel(req.body);
        const savedCard = await newCard.save();
        res.status(201).json({ ...savedCard.toObject(), id: savedCard._id.toString() });
    } catch (error: any) {
        res.status(400).json({ error: 'Failed to create card', details: error.message || error });
    }
});

app.put('/api/cards/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updatedCard = await CardModel.findByIdAndUpdate(id, req.body, { new: true });
        if (!updatedCard) return res.status(404).json({ error: 'Card not found' });
        res.json({ ...updatedCard.toObject(), id: updatedCard._id.toString() });
    } catch (error: any) {
        res.status(400).json({ error: 'Failed to update card', details: error.message || error });
    }
});

app.delete('/api/cards/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await CardModel.findByIdAndDelete(id);
        res.status(204).send();
    } catch (error) {
        res.status(400).json({ error: 'Failed to delete card' });
    }
});

// --- GAME ROUTES ---
app.get('/api/games', async (req, res) => {
    try {
        const games = await GameModel.find();
        res.json(games);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch games' });
    }
});

app.post('/api/games', async (req, res) => {
    try {
        const newGame = new GameModel(req.body);
        const savedGame = await newGame.save();
        res.status(201).json(savedGame);
    } catch (error: any) {
        res.status(400).json({ error: 'Failed to create game', details: error.message || error });
    }
});

app.put('/api/games/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updatedGame = await GameModel.findOneAndUpdate({ id }, req.body, { new: true });
        if (!updatedGame) return res.status(404).json({ error: 'Game not found' });
        res.json(updatedGame);
    } catch (error: any) {
        res.status(400).json({ error: 'Failed to update game', details: error.message || error });
    }
});

app.delete('/api/games/:id', async (req, res) => {
    try {
        await GameModel.findOneAndDelete({ id: req.params.id });
        res.status(204).send();
    } catch (error) {
        res.status(400).json({ error: 'Failed to delete game' });
    }
});

// --- CATEGORY ROUTES ---
app.get('/api/categories', async (req, res) => {
    try {
        const categories = await CategoryModel.find();
        const formattedCats = categories.map(c => ({ ...c.toObject(), id: c._id.toString() }));
        res.json(formattedCats);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch categories' });
    }
});

app.post('/api/categories', async (req, res) => {
    try {
        const newCat = new CategoryModel({ name: req.body.name, type: req.body.type || 'card' });
        const savedCat = await newCat.save();
        res.status(201).json({ ...savedCat.toObject(), id: savedCat._id.toString() });
    } catch (error) {
        res.status(400).json({ error: 'Failed to create category' });
    }
});

app.delete('/api/categories/:id', async (req, res) => {
    try {
        await CategoryModel.findByIdAndDelete(req.params.id);
        res.status(204).send();
    } catch (error) {
        res.status(400).json({ error: 'Failed to delete category' });
    }
});

// --- DASHBOARD ROUTE ---
app.get('/api/dashboard/stats', async (req, res) => {
    try {
        const games = await GameModel.countDocuments();
        const cards = await CardModel.countDocuments();
        const categories = await CategoryModel.countDocuments();
        // Since we don't have a tracking service hooked up yet, simulate visitors
        const visitors = Math.floor(Math.random() * 300) + 100;
        res.json({ games, cards, categories, visitors });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch dashboard stats' });
    }
});

// --- SEED DATA ---
// Initial data seeded into MongoDB on first run (only if collection is empty).
// To re-seed, clear the MongoDB collections and restart the server.
const seedCards = [
    {
        gameId: "hts",
        name: { en: "The Piercing Howl", id: "Lolongan Menembus" },
        type: { en: "Fighter Hero", id: "Pahlawan Petarung" },
        effect: {
            en: "Each time you roll to ATTACK, you may +1 or -1 to your roll.",
            id: "Setiap kali Anda melempar dadu untuk MENYERANG, Anda dapat +1 atau -1 pada hasil."
        },
        lore: {
            en: "A guardian of the frozen peaks, their battle cry shatters the icy silence.",
            id: "Penjaga puncak beku, teriakan perang mereka memecah keheningan es."
        },
        imageUrl: "https://placehold.co/400x600/1e1b4b/e0e7ff.png?text=Fighter+Hero",
        color: "#ef4444"
    },
    {
        gameId: "hts",
        name: { en: "Mellow Dee", id: "Melo Di" },
        type: { en: "Bard Hero", id: "Pahlawan Penyair" },
        effect: {
            en: "Once per turn, you may DISCARD a card to draw a card.",
            id: "Sekali setiap giliran, Anda dapat MEMBUANG satu kartu untuk menarik satu kartu."
        },
        lore: {
            en: "Known for their soothing tunes that can mend wounds or break hearts.",
            id: "Dikenal akan nada menenangkannya yang dapat menyembuhkan luka atau mematahkan hati."
        },
        imageUrl: "https://placehold.co/400x600/312e81/e0e7ff.png?text=Bard+Hero",
        color: "#6366f1"
    },
    {
        gameId: "hts",
        name: { en: "Slippery Ninja", id: "Ninja Licin" },
        type: { en: "Thief Hero", id: "Pahlawan Pencuri" },
        effect: {
            en: "You cannot be CHALLENGED.",
            id: "Anda tidak dapat DITANTANG."
        },
        lore: {
            en: "Stealth is not an act, it is a way of life in the shadows.",
            id: "Siluman bukanlah tindakan, melainkan jalan hidup dalam bayangan."
        },
        imageUrl: "https://placehold.co/400x600/064e3b/d1fae5.png?text=Thief+Hero",
        color: "#059669"
    },
    {
        gameId: "hts",
        name: { en: "Plundering Puma", id: "Puma Penjarah" },
        type: { en: "Thief Hero", id: "Pahlawan Pencuri" },
        effect: {
            en: "Each time you play a Modifier card, you may pull a card from another player's hand.",
            id: "Setiap kali Anda memainkan kartu Modifikator, Anda dapat mengambil satu kartu dari tangan pemain lain."
        },
        lore: {
            en: "Agile and cunning, they strike when least expected, taking what belongs to others.",
            id: "Gesit dan licik, mereka menyerang saat tidak terduga, mengambil apa yang menjadi milik orang lain."
        },
        imageUrl: "https://placehold.co/400x600/14532d/d1fae5.png?text=Thief+Hero",
        color: "#047857"
    }
];

const seedGames = [
    {
        id: 'here-to-slay',
        name: { en: 'Here to Slay', id: 'Here to Slay' },
        category: ['Card Game', 'Party', 'Fantasy'],
        shortDescription: { en: 'A competitive role-playing fantasy card game.', id: 'Permainan kartu fantasi kompetitif.' },
        description: {
            en: 'Here to Slay is a competitive role-playing fantasy card game that is all about assembling a party of Heroes and slaying monsters (and sometimes sabotaging your friends) from the creators of Unstable Unicorns.',
            id: 'Here to Slay adalah permainan kartu fantasi kompetitif tentang mengumpulkan party Pahlawan dan membunuh monster (serta menyabotase teman Anda) dari pembuat Unstable Unicorns.'
        },
        minPlayers: 2,
        maxPlayers: 6,
        playTime: 30,
        complexity: 2,
        designer: 'Ramy Badie',
        yearPublished: 2020,
        mechanics: ['Hand Management', 'Dice Rolling', 'Set Collection'],
        imageUrl: 'https://placehold.co/800x600/1e1b4b/e0e7ff.png?text=Here+to+Slay',
        howToPlay: {
            en: ['Each player chooses a Party Leader.', 'Draw 5 cards to start your hand.', 'On your turn, you have 3 Action Points to spend.', 'Win by either: slaying 3 Monsters OR assembling a full Party with 6 different classes.'],
            id: ['Setiap pemain memilih satu Pemimpin Party.', 'Tarik 5 kartu untuk memulai tangan Anda.', 'Pada giliran Anda, Anda memiliki 3 Poin Aksi.', 'Menang dengan cara: membunuh 3 Monster ATAU mengumpulkan Party penuh dengan 6 kelas yang berbeda.']
        },
        rules: [
            { title: { en: 'Action Points', id: 'Poin Aksi' }, content: { en: 'You have 3 Action Points per turn. Draw a card (1), Play a Hero/Item/Magic (1), Attack a Monster (2), Discard your hand to draw 5 new cards (3).', id: 'Anda memiliki 3 Poin Aksi per giliran. Tarik kartu (1), Mainkan Pahlawan/Item/Sihir (1), Serang Monster (2), Buang tangan Anda dan tarik 5 kartu baru (3).' } },
            { title: { en: 'Slaying Monsters', id: 'Membunuh Monster' }, content: { en: 'To attack, you must meet the Monster requirement. Spend 2 Action points, roll two dice. If your total equals or exceeds the requirement, you slay it.', id: 'Untuk menyerang, Anda harus memenuhi syarat Monster. Gunakan 2 Poin Aksi, lempar 2 dadu. Jika total sama atau lebih, Anda membunuhnya.' } }
        ],
        faq: [{ q: { en: 'Can I play a Hero even if its class doesn\'t match my Party Leader?', id: 'Bisakah saya memainkan Pahlawan meskipun kelasnya tidak cocok dengan Pemimpin Party saya?' }, a: { en: 'Yes. Your party leader just acts as a permanent class member.', id: 'Ya. Pemimpin party Anda hanya bertindak sebagai anggota kelas permanen.' } }]
    },
    {
        id: 'catan',
        name: { en: 'Catan', id: 'Catan' },
        category: ['Strategy', 'Resource Management'],
        shortDescription: { en: 'Trade, build, and settle the Island of Catan.', id: 'Berdagang, membangun, dan menetap di Pulau Catan.' },
        description: { en: 'In Catan, players try to be the dominant force on the island of Catan by building settlements, cities, and roads.', id: 'Di Catan, pemain mencoba mendominasi pulau dengan membangun pemukiman, kota, dan jalan.' },
        minPlayers: 3,
        maxPlayers: 4,
        playTime: 60,
        complexity: 3,
        designer: 'Klaus Teuber',
        yearPublished: 1995,
        mechanics: ['Trading', 'Modular Board', 'Network Building'],
        imageUrl: 'https://placehold.co/800x600/7c2d12/ffedd5.png?text=Catan',
        howToPlay: {
            en: ['Set up the hex board randomly or using the beginner layout.', 'Place initial settlements and roads.', 'On your turn: Roll the production dice.', 'Trade resources with other players.', 'Build roads, settlements, cities, or buy development cards.'],
            id: ['Siapkan papan hex secara acak atau gunakan tata letak pemula.', 'Tempatkan pemukiman dan jalan awal.', 'Pada giliran Anda: Lempar dadu produksi.', 'Berdagang sumber daya dengan pemain lain.', 'Bangun jalan, pemukiman, kota, atau beli kartu pengembangan.']
        },
        rules: [
            { title: { en: 'Winning the Game', id: 'Memenangkan Permainan' }, content: { en: 'The first player to reach 10 Victory Points wins. Settlements are worth 1 VP, Cities 2 VP.', id: 'Pemain pertama yang mencapai 10 Poin Kemenangan memenangkan permainan. Pemukiman 1 VP, Kota 2 VP.' } },
            { title: { en: 'The Robber', id: 'Si Perampok' }, content: { en: 'If a 7 is rolled, no resources are produced. Anyone with more than 7 cards must discard half. The player who rolled must move the Robber.', id: 'Jika angka 7 muncul, tidak ada sumber daya yang dihasilkan. Siapapun dengan lebih dari 7 kartu harus membuang setengahnya.' } }
        ],
        faq: [{ q: { en: 'Can I build a settlement anywhere on the coast?', id: 'Bisakah saya membangun pemukiman di mana saja di pantai?' }, a: { en: 'Yes, as long as it follows the Distance Rule (2 spaces away from another settlement).', id: 'Ya, asalkan mengikuti Aturan Jarak.' } }]
    },
    {
        id: 'monopoly',
        name: { en: 'Monopoly', id: 'Monopoli' },
        category: ['Classic', 'Economic', 'Family'],
        shortDescription: { en: 'The classic fast-dealing property trading game.', id: 'Permainan klasik jual-beli properti yang cepat.' },
        description: { en: 'Monopoly is a multi-player economics-themed board game where players roll dice to move around the board, buying and trading properties.', id: 'Monopoli adalah permainan papan bertema ekonomi di mana pemain melempar dadu untuk bergerak di sekitar papan, membeli dan menukar properti.' },
        minPlayers: 2,
        maxPlayers: 8,
        playTime: 120,
        complexity: 2,
        designer: 'Lizzie Magie, Charles Darrow',
        yearPublished: 1935,
        mechanics: ['Roll and Move', 'Set Collection', 'Trading'],
        imageUrl: 'https://placehold.co/800x600/065f46/d1fae5.png?text=Monopoly',
        howToPlay: {
            en: ['Each player starts with $1500.', 'Roll the dice to move your token forward.', 'Buy unowned properties you land on.', 'Pay rent when landing on others\' properties.', 'Build houses and hotels to increase rent.'],
            id: ['Setiap pemain mulai dengan $1500.', 'Lempar dadu untuk memindahkan bidak Anda.', 'Beli properti yang belum dimiliki saat Anda mendarat.', 'Bayar sewa saat mendarat di properti orang lain.', 'Bangun rumah dan hotel untuk meningkatkan sewa.']
        },
        rules: [
            { title: { en: 'Bankruptcy', id: 'Kebangkrutan' }, content: { en: 'If you owe more money than you can pay, you are bankrupt and eliminated. The last player wins.', id: 'Jika Anda berhutang lebih dari yang bisa dibayar, Anda bangkrut dan tereliminasi. Pemain terakhir menang.' } },
            { title: { en: 'Jail', id: 'Penjara' }, content: { en: 'Go to Jail by landing on "Go to Jail", drawing a card, or rolling doubles 3 times. Pay $50, roll doubles, or use a "Get Out of Jail Free" card to escape.', id: 'Masuk Penjara dengan mendarat di "Masuk Penjara", menarik kartu, atau melempar ganda 3 kali. Bayar $50 atau gunakan kartu Bebas Penjara.' } }
        ],
        faq: [{ q: { en: 'Do you collect $200 when you land on Free Parking?', id: 'Apakah Anda mengumpulkan $200 saat mendarat di Parkir Bebas?' }, a: { en: 'No. Free Parking is just a resting space.', id: 'Tidak. Parkir Bebas hanyalah tempat istirahat.' } }]
    },
    {
        id: 'uno',
        name: { en: 'UNO', id: 'UNO' },
        category: ['Card Game', 'Family', 'Party'],
        shortDescription: { en: 'Match colors and numbers to empty your hand.', id: 'Cocokkan warna dan angka untuk mengosongkan tangan Anda.' },
        description: { en: 'UNO is a card game where players race to discard all their cards by matching them by number, color, or symbol.', id: 'UNO adalah permainan kartu di mana pemain berlomba membuang semua kartunya dengan mencocokkan angka, warna, atau simbol.' },
        minPlayers: 2,
        maxPlayers: 10,
        playTime: 30,
        complexity: 1,
        designer: 'Merle Robbins',
        yearPublished: 1971,
        mechanics: ['Hand Management', 'Take That'],
        imageUrl: 'https://placehold.co/800x600/b91c1c/fee2e2.png?text=UNO',
        howToPlay: {
            en: ['Deal 7 cards to each player.', 'Turn over the top card to start the discard pile.', 'Match the top card by number, color, or symbol on your turn.', 'Draw a card if you cannot match.', 'Yell "UNO" when you play your second to last card.'],
            id: ['Bagikan 7 kartu ke setiap pemain.', 'Balikkan kartu atas untuk memulai tumpukan buangan.', 'Cocokkan kartu teratas berdasarkan angka, warna, atau simbol.', 'Tarik kartu jika tidak bisa mencocokkan.', 'Teriakkan "UNO" saat memainkan kartu kedua terakhir.']
        },
        rules: [
            { title: { en: 'Action Cards', id: 'Kartu Aksi' }, content: { en: 'Skip, Reverse, Draw Two, Wild, and Wild Draw Four are special action cards.', id: 'Lewati, Putar Balik, Tarik Dua, Liar, dan Liar Tarik Empat adalah kartu aksi khusus.' } },
            { title: { en: 'Failing to say UNO', id: 'Gagal mengucapkan UNO' }, content: { en: 'If caught not saying UNO before your next turn, draw 2 cards as penalty.', id: 'Jika ketahuan tidak mengucapkan UNO sebelum giliran berikutnya, tarik 2 kartu sebagai hukuman.' } }
        ],
        faq: [{ q: { en: 'Can I stack Draw Two cards?', id: 'Bisakah saya menumpuk kartu Tarik Dua?' }, a: { en: 'According to official rules: No, stacking is not allowed.', id: 'Menurut aturan resmi: Tidak, penumpukan tidak diperbolehkan.' } }]
    },
    {
        id: 'ticket-to-ride',
        name: { en: 'Ticket to Ride', id: 'Ticket to Ride' },
        category: ['Strategy', 'Family', 'Trains'],
        shortDescription: { en: 'A cross-country train adventure game.', id: 'Permainan petualangan kereta api lintas negara.' },
        description: { en: 'Ticket to Ride is a cross-country train adventure where players collect train cards to claim railway routes connecting cities.', id: 'Ticket to Ride adalah petualangan kereta lintas negara di mana pemain mengumpulkan kartu kereta untuk mengklaim rute rel yang menghubungkan kota-kota.' },
        minPlayers: 2,
        maxPlayers: 5,
        playTime: 60,
        complexity: 2,
        designer: 'Alan R. Moon',
        yearPublished: 2004,
        mechanics: ['Set Collection', 'Network Building', 'Card Drafting'],
        imageUrl: 'https://placehold.co/800x600/0369a1/e0f2fe.png?text=Ticket+to+Ride',
        howToPlay: {
            en: ['Start with train cards and Destination Tickets.', 'Draw Train Car Cards from the deck or face-up cards.', 'Claim a Route by playing matching colored cards.', 'Draw additional Destination Tickets.'],
            id: ['Mulailah dengan kartu kereta dan Tiket Destinasi.', 'Tarik Kartu Gerbong dari dek atau kartu terbuka.', 'Klaim Rute dengan memainkan kartu berwarna serasi.', 'Tarik Tiket Destinasi tambahan.']
        },
        rules: [
            { title: { en: 'Scoring', id: 'Penyekoran' }, content: { en: 'Points are scored by claiming routes and connecting Destination Tickets. Uncompleted tickets deduct points.', id: 'Poin dicetak dengan mengklaim rute dan menyelesaikan Tiket Destinasi. Tiket yang tidak selesai mengurangi poin.' } },
            { title: { en: 'Longest Path Bonus', id: 'Bonus Jalur Terpanjang' }, content: { en: 'The player with the longest continuous path receives a 10-point bonus card at the end.', id: 'Pemain dengan jalur bersambung terpanjang menerima bonus 10 poin di akhir.' } }
        ],
        faq: [{ q: { en: 'Are locomotives drawn from the deck wild cards?', id: 'Apakah lokomotif yang ditarik dari dek kartu liar?' }, a: { en: 'If drawn face-down, they count as normal. If drawn face-up, they take both draws.', id: 'Jika ditarik menghadap ke bawah, dihitung normal. Jika menghadap ke atas, menghabiskan kedua tarikan.' } }]
    },
    {
        id: 'wingspan',
        name: { en: 'Wingspan', id: 'Wingspan' },
        category: ['Strategy', 'Card Game', 'Family'],
        shortDescription: { en: 'A competitive bird-collection, engine-building board game.', id: 'Permainan papan kompetitif mengumpulkan burung dan membangun mesin.' },
        description: {
            en: 'Wingspan is a competitive, medium-weight, card-driven, engine-building board game from Stonemaier Games. You are bird enthusiasts—researchers, bird watchers, ornithologists, and collectors—seeking to discover and attract the best birds to your network of wildlife preserves. Each bird extends a chain of powerful combinations in one of your habitats (actions).',
            id: 'Wingspan adalah permainan papan kompetitif berbasis kartu dan engine-building dari Stonemaier Games. Anda adalah pecinta burung—peneliti, pengamat burung, ornitolog, dan kolektor—yang berusaha menemukan dan menarik burung-burung terbaik ke jaringan suaka satwa liar Anda. Setiap burung memperluas rantai kombinasi kuat di salah satu habitat (aksi) Anda.'
        },
        minPlayers: 1,
        maxPlayers: 5,
        playTime: 70,
        complexity: 3,
        designer: 'Elizabeth Hargrave',
        yearPublished: 2019,
        mechanics: ['Hand Management', 'Engine Building', 'Dice Rolling', 'Set Collection', 'Card Drafting'],
        imageUrl: '/uploads/wingspan_cover.png',
        videoUrl: 'https://www.youtube.com/watch?v=lgDgcLI2B0U',
        howToPlay: {
            en: [
                'Each player starts with 5 bird cards and 5 food tokens, keeping a combination of their choice.',
                'On your turn, choose one of four actions: Play a bird, Gain food, Lay eggs, or Draw bird cards.',
                'Playing a bird requires paying its food cost and egg cost (if placing in columns 2-5).',
                'Gaining food uses the birdfeeder dice tower — roll and select dice showing the food you need.',
                'Laying eggs places egg tokens on your birds. Eggs are needed to play more birds and score points.',
                'Drawing bird cards lets you take from 3 face-up cards or the deck.',
                'The game lasts 4 rounds. Each round, you lose one action cube, making later rounds shorter.',
                'At the end of 4 rounds, score points from birds, bonus cards, end-of-round goals, eggs, cached food, and tucked cards.'
            ],
            id: [
                'Setiap pemain memulai dengan 5 kartu burung dan 5 token makanan, memilih kombinasi sesuka hati.',
                'Pada giliran Anda, pilih salah satu dari empat aksi: Mainkan burung, Ambil makanan, Bertelur, atau Tarik kartu burung.',
                'Memainkan burung membutuhkan biaya makanan dan biaya telur (jika ditempatkan di kolom 2-5).',
                'Mengambil makanan menggunakan menara dadu birdfeeder — lempar dan pilih dadu sesuai makanan yang dibutuhkan.',
                'Bertelur menempatkan token telur di burung Anda. Telur diperlukan untuk memainkan lebih banyak burung dan mencetak poin.',
                'Menarik kartu burung memungkinkan mengambil dari 3 kartu terbuka atau dek.',
                'Permainan berlangsung 4 ronde. Setiap ronde, Anda kehilangan satu kubus aksi, membuat ronde berikutnya lebih pendek.',
                'Di akhir 4 ronde, hitung poin dari burung, kartu bonus, tujuan akhir ronde, telur, makanan tersimpan, dan kartu terselip.'
            ]
        },
        rules: [
            { title: { en: 'Habitats', id: 'Habitat' }, content: { en: 'Your player mat has three habitats: Forest (gain food), Grassland (lay eggs), and Wetland (draw cards). Each habitat can hold up to 5 birds. As you place more birds in a habitat, the action for that habitat becomes more powerful.', id: 'Papan pemain memiliki tiga habitat: Hutan (ambil makanan), Padang Rumput (bertelur), dan Lahan Basah (tarik kartu). Setiap habitat bisa menampung hingga 5 burung. Semakin banyak burung di habitat, aksi menjadi lebih kuat.' } },
            { title: { en: 'Scoring', id: 'Penilaian' }, content: { en: 'Points come from: bird point values, bonus card objectives, end-of-round goals (4 total), eggs on birds (1 pt each), food cached on birds (1 pt each), and cards tucked under birds (1 pt each). The player with the most points wins.', id: 'Poin berasal dari: nilai poin burung, tujuan kartu bonus, tujuan akhir ronde (total 4), telur di burung (1 poin masing-masing), makanan yang disimpan di burung (1 poin), dan kartu yang diselipkan di bawah burung (1 poin). Pemain dengan poin terbanyak menang.' } },
            { title: { en: 'Bird Powers', id: 'Kekuatan Burung' }, content: { en: 'Birds have three types of powers: When Played (brown, activates once), When Activated (brown, triggers each time you use that row), and Once Between Turns (pink, can trigger on other players\' turns).', id: 'Burung memiliki tiga jenis kekuatan: Saat Dimainkan (coklat, aktif sekali), Saat Diaktifkan (coklat, terpicu setiap menggunakan baris itu), dan Sekali Antar Giliran (merah muda, bisa terpicu di giliran pemain lain).' } }
        ],
        faq: [
            { q: { en: 'Can I play Wingspan solo?', id: 'Bisakah saya bermain Wingspan sendirian?' }, a: { en: 'Yes! Wingspan includes a robust solo mode called the Automa, which simulates another player using a special deck of cards.', id: 'Ya! Wingspan menyertakan mode solo yang disebut Automa, yang mensimulasikan pemain lain menggunakan dek kartu khusus.' } },
            { q: { en: 'How long does a game typically take?', id: 'Berapa lama biasanya satu permainan berlangsung?' }, a: { en: 'A typical game takes 40-70 minutes depending on player count. Solo games can be completed in about 20-30 minutes.', id: 'Permainan biasanya memakan waktu 40-70 menit tergantung jumlah pemain. Permainan solo bisa diselesaikan dalam 20-30 menit.' } }
        ]
    }
];

const seedCategories = [
    { name: { en: 'Fighter Hero', id: 'Pahlawan Petarung' }, type: 'card' },
    { name: { en: 'Bard Hero', id: 'Pahlawan Penyair' }, type: 'card' },
    { name: { en: 'Thief Hero', id: 'Pahlawan Pencuri' }, type: 'card' },
    { name: { en: 'Item', id: 'Barang' }, type: 'card' },
    { name: { en: 'Magic', id: 'Sihir' }, type: 'card' }
];

async function autoSeed() {
    try {
        const gameCount = await GameModel.countDocuments();
        const cardCount = await CardModel.countDocuments();
        const catCount = await CategoryModel.countDocuments();

        if (gameCount === 0) {
            await GameModel.insertMany(seedGames);
            console.log('Seeded default games into MongoDB');
        }
        if (cardCount === 0) {
            await CardModel.insertMany(seedCards);
            console.log('Seeded default cards into MongoDB');
        }
        if (catCount === 0) {
            await CategoryModel.insertMany(seedCategories);
            console.log('Seeded default categories into MongoDB');
        }
    } catch (e) {
        console.error("Failed to auto-seed", e);
    }
}

// --- INIT/SEED ROUTE ---
app.post('/api/seed', async (req, res) => {
    try {
        await autoSeed();
        res.json({ message: 'Seed successful' });
    } catch (error) {
        res.status(500).json({ error: 'Seed failed' });
    }
});

// --- POKEMON SEED ---
app.post('/api/seed/pokemon', async (req, res) => {
    try {
        const existingPokemonGame = await GameModel.findOne({ id: 'pokemon-tcg' });
        if (!existingPokemonGame) {
            await GameModel.create(pokemonGameSeed);
            console.log('Seeded Pokémon TCG game');
        }
        const pokemonCardCount = await CardModel.countDocuments({ gameId: 'pokemon-tcg' });
        if (pokemonCardCount === 0) {
            await CardModel.insertMany([...pokemonDeck1Cards, ...pokemonDeck2Cards]);
            console.log(`Seeded ${pokemonDeck1Cards.length + pokemonDeck2Cards.length} Pokémon cards`);
        }
        res.json({ message: 'Pokémon seed successful', cardsAdded: pokemonDeck1Cards.length + pokemonDeck2Cards.length });
    } catch (error) {
        console.error('Pokémon seed failed:', error);
        res.status(500).json({ error: 'Pokémon seed failed' });
    }
});

// Serve built client frontend statically in production
app.use(express.static(path.join(process.cwd(), 'dist')));

// Wildcard client route fallback (SPA routing)
app.get('*', (req, res) => {
    // Exclude API and upload paths from wildcard fallback
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
        return res.status(404).json({ error: 'Not found' });
    }
    const distIndex = path.join(process.cwd(), 'dist', 'index.html');
    if (fs.existsSync(distIndex)) {
        res.sendFile(distIndex);
    } else {
        res.status(404).send('Frontend not built. Please run npm run build.');
    }
});

if (!process.env.VERCEL) {
    app.listen(PORT, async () => {
        console.log(`Server running on port ${PORT}`);
        await autoSeed();
    });
}

// Export the app for Vercel Serverless Functions
export default app;

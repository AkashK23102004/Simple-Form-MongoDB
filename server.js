const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/simplelogin');
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => console.log('✅ Connected to MongoDB'));

// Schema
const userSchema = new mongoose.Schema({
    fname: String,
    lname: String,
    email: String,
    password: String,
    file: String
});
const User = mongoose.model('User', userSchema);

// Multer config
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage: storage });

// Serve the form.html from frontend folder
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/form.html'));
});

// Handle form submission
app.post('/user', upload.single('file'), async (req, res) => {
    try {
        const { fname, lname, email, password } = req.body;
        const file = req.file ? req.file.filename : null;

        if (!fname || !lname || !email || !password || !file) {
            return res.status(400).json({ message: "All fields are required." });
        }

        const user = new User({ fname, lname, email, password, file });
        await user.save();

        res.json({
            message: "Form submitted successfully!",
            receivedData: { fname, lname, email, password, file }
        });

    } catch (err) {
        console.error('Error saving user:', err);
        res.status(500).json({ message: "Server error." });
    }
});

// Start the server
const PORT = 8000;
app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
});

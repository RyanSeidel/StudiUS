const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cookieParser = require('cookie-parser');
const http = require('http');
const socketIo = require('socket.io');

const User = require('./models/user');
const Message = require('./models/message');
const Conversation = require('./models/conversation');

const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const PORT = 3000;

app.set('view engine', 'ejs');

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Mongoose connection
mongoose.connect('mongodb+srv://rgseidel:admin@cluster0.nsgbfja.mongodb.net/', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => {
    console.log('MongoDB connected');
})
.catch(err => {
    console.error('Error connecting to MongoDB', err);
});

// JWT Middleware
app.use(async (req, res, next) => {
    try {
        const token = req.cookies.jwt;
        const decoded = jwt.verify(token, 'your_secret_key');
        req.user = await User.findById(decoded._id);
        next();
    } catch (error) {
        next();
    }
});

cloudinary.config({
  cloud_name: 'dpwzq8wks',
  api_key: '884847843295667',
  api_secret: '-gzQXojy4nvTu0XLnus1b7ajTBY'
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'chat_app',
        format: async (req, file) => 'png', // supports promises as well
        public_id: (req, file) => file.originalname, // Preserving the original file name
    },
});

const parser = multer({ storage: storage });


app.post('/upload', parser.single('file'), (req, res) => {
    console.log('Upload endpoint hit');
    console.log('req.body:', req.body);
    console.log('req.file:', req.file);
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }
    const imageUrl = req.file.path;
    res.json({ imageUrl });
});




// Socket.io Logic
io.on('connection', (socket) => {
    console.log('a user connected');

    socket.on('sendMessage', async ({ senderName, body }) => {
        const message = new Message({
            body,
            senderName,  // Store the sender's name directly in the message
        });
        await message.save();
    
        // Broadcast the message to all connected clients
        io.emit('receiveMessage', {
            body,
            senderName
        });
    });
    

    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});

app.get('/register', (req, res) => {
    res.render('register');
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.get('/users', async (req, res) => {
    if (!req.user) return res.status(401).send('Not authenticated.');

    const users = await User.find({ _id: { $ne: req.user._id } });
    res.json(users);
});

app.get('/conversation', async (req, res) => {
    if (!req.user) return res.status(401).send('Not authenticated.');

    const otherUserId = req.query.userId;
    let conversation = await Conversation.findOne({
        userIds: { $all: [req.user._id, otherUserId] }
    });

    if (!conversation) {
        conversation = new Conversation({
            userIds: [req.user._id, otherUserId]
        });
        await conversation.save();
    }

    res.json(conversation);
});

app.delete('/conversation/:id', async (req, res) => {
    if (!req.user) return res.status(401).send('Not authenticated.');

    await Conversation.findByIdAndDelete(req.params.id);
    await Message.deleteMany({ conversationId: req.params.id });

    res.send('Conversation deleted');
});

app.post('/register', async (req, res) => {
    const { name, email, password } = req.body;
    let user = await User.findOne({ email });
    if (user) return res.status(400).send('User already registered.');

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({
        name,
        email,
        hashedPassword
    });

    await user.save();

    res.send('User registered successfully');
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).send('Invalid email or password.');

    const validPassword = await bcrypt.compare(password, user.hashedPassword);
    if (!validPassword) return res.status(400).send('Invalid email or password.');

    const token = jwt.sign({ _id: user._id }, 'your_secret_key');
    res.cookie('jwt', token).redirect('/');
});

app.get('/', (req, res) => {
    if (!req.user) return res.status(401).send('Not authenticated.');
    res.render('home', { name: req.user.name });
});

app.get('/page2', (req, res) => {
    if (!req.user) return res.status(401).send('Not authenticated.');
    res.render('page2', { name: req.user.name });
});

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

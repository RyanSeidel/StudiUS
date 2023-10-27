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
const ChatRoom = require('./models/chatRoom');


const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const PORT = 3000;

// Setting up the 'public' directory to serve static assets (HTML, CSS, JS) using Express DO NOT
app.use(express.static('public'));

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

// Socket.io Logic
io.on('connection', (socket) => {
    console.log('a user connected');

    socket.on('join-room', (roomId, userName) => {
        socket.join(roomId);
        // You might also want to notify others in the room about the new user
        // socket.to(roomId).broadcast.emit('event-name', data);
    });

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

    socket.on('offer', (offer) => {
        socket.broadcast.emit('offer', offer);
    });

    socket.on('answer', (answer) => {
        socket.broadcast.emit('answer', answer);
    });

    socket.on('ice-candidate', (iceCandidate) => {
        socket.broadcast.emit('ice-candidate', iceCandidate);
    });

    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});

app.get('/register', (req, res) => {
    res.render('register');
});

app.get('/loginpage', (req, res) => {
    res.render('loginpage');
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

app.get('/get-rooms', async (req, res) => {
    try {
        const currentUser = req.user;
        const rooms = await ChatRoom.find({ userIds: currentUser._id }).lean();  // Use .lean() for performance and to get plain JS objects

        // Fetch user names for each room
        for (let room of rooms) {
            const users = await User.find({ _id: { $in: room.userIds } });
            room.userNames = users.map(user => user.name);
        }

        res.json(rooms);
    } catch (error) {
        res.status(500).send("Error fetching rooms");
    }
});

app.get('/chatroom', (req, res) => {
    if (!req.user) return res.status(401).send('Not authenticated.');
    res.render('page2', { name: req.user.name });
});


app.post('/create-room', async (req, res) => {
    const roomName = req.body.roomName;
    const allowedUsers = req.body.allowedUsers || [];

    const currentUser = req.user;
    console.log("Current User ID:", currentUser._id);
    
    allowedUsers.push(currentUser._id.toString());
    console.log("Allowed Users:", allowedUsers);

    const existingRoom = await ChatRoom.findOne({ userIds: { $all: allowedUsers, $size: allowedUsers.length } });
    if (existingRoom) {
        return res.status(400).json({ error: 'Room with the same set of users already exists' });
    }

    const newRoom = new ChatRoom({ 
        name: roomName, 
        userIds: allowedUsers,
        isGroup: allowedUsers.length > 1 
    });
    await newRoom.save();
    console.log("New Room Data:", newRoom);

    res.json(newRoom);
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

server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
});


// server.listen(PORT, '3.12.163.231', () => {
//     console.log(`Server is running on https://${'3.12.163.231'}:${PORT}`);
// });

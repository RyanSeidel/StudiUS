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
const io = require('socket.io')(server);
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

// Set up multer-storage-cloudinary
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        allowedFormats: ['jpg', 'png', 'jpeg'],
    },
});


// Socket.io Logic
io.on('connection', (socket) => {

    socket.on('join-room', (roomId, userId, userName) => {

        socket.join(roomId);
        console.log(`${userName} (ID: ${userId}) connected to room ${roomId}`);
        socket.to(roomId).emit('user-connected', userId, userName);
    });

    socket.on('sendMessage', async ({ roomId, senderName, body }) => {
        const message = new Message({
            body,
            senderName,
            roomId,
        });
        await message.save();
    
        // Broadcast the message only to users in the same room
        io.to(roomId).emit('receiveMessage', {
            body,
            senderName
        });
    });

    socket.on('offer', (offer, to) => {
        socket.to(to).emit('offer', offer, socket.id);
      });
  
      socket.on('answer', (answer, to) => {
        socket.to(to).emit('answer', answer, socket.id);
      });
  
      socket.on('ice-candidate', (candidate, to) => {
        socket.to(to).emit('ice-candidate', candidate, socket.id);
      });

    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
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
    res.render('chat', { name: req.user.name, userId: req.user._id });
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

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

app.post('/upload', upload.single('image'), async (req, res) => {
    try {
        const imageUrl = req.file.path; // This is the Cloudinary URL
        res.json({ success: true, imageUrl: imageUrl });
    } catch (error) {
        console.error("Error uploading image:", error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.post('/update-profile', upload.none(), async (req, res) => {
    try {
        console.log("Received name:", req.body.name); // Log the name to check

        const user = await User.findById(req.user.id);
        if (req.body.name) {
            user.name = req.body.name;
        }
        
        await user.save();

        res.json({ success: true, message: 'Profile updated successfully' });
    } catch (error) {
        console.error("Error updating profile:", error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


app.post('/upload-profile-pic', upload.single('image'), async (req, res) => {
    try {
        // Image is uploaded and req.file holds its details
        const imageUrl = req.file.path; // This is the Cloudinary URL

        // Now, you can save this URL to your user's record in the database
        const user = await User.findById(req.user.id);
        user.image = imageUrl;
        await user.save();

        res.json({ success: true, message: 'Image uploaded successfully', newImageUrl: imageUrl });
    } catch (error) {
        console.error("Error uploading image:", error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
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
        hashedPassword,
        image: '/images/default.jpg' // set the default image path here
    });

    await user.save();

    res.redirect('/');
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).send('Invalid email or password.');

    const validPassword = await bcrypt.compare(password, user.hashedPassword);
    if (!validPassword) return res.status(400).send('Invalid email or password.');

    const token = jwt.sign({ _id: user._id }, 'your_secret_key');
    res.cookie('jwt', token).redirect('/home');
});

app.post('/logout', (req, res) => {
    res.clearCookie('jwt').redirect('/'); // Clear the JWT cookie and redirect to the home or login page
});

app.get('/', (req, res) => {
    res.render('loginpage');
});

app.get('/home', (req, res) => {
    if (!req.user) return res.status(401).send('Not authenticated.');
    res.render('home', { name: req.user.name, image: req.user.image });
});


server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
});


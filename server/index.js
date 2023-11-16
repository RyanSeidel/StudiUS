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

const participantsByRoom = {};

// Socket.io Logic
io.on('connection', (socket) => {

    socket.on('join-room', (roomId, userId, userName) => {
        socket.join(roomId);
        socket.roomId = roomId; // Store roomId in the socket instance
        console.log(`${userName} (ID: ${userId}) connected to room ${roomId}`);


        // Add the user to the participants list for the room
        if (!participantsByRoom[roomId]) {
            participantsByRoom[roomId] = [];
        }
        participantsByRoom[roomId].push({ userId, userName });

        // Emit the updated participants list to everyone in the room
        io.to(roomId).emit('participants-updated', participantsByRoom[roomId]);

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
        console.log(`${socket.id} disconnected`);
        if (socket.roomId) {
            // Remove the user from the participants list
            participantsByRoom[socket.roomId] = participantsByRoom[socket.roomId].filter(participant => participant.userId !== socket.id);
            socket.to(socket.roomId).emit('user-disconnected', socket.id);

            // Send the updated participants list to everyone in the room
            io.to(socket.roomId).emit('participants-updated', participantsByRoom[socket.roomId]);
        }
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
        const rooms = await ChatRoom.find({ userIds: currentUser._id }).lean();

        for (let room of rooms) {
            // Fetch user names for each room
            const users = await User.find({ _id: { $in: room.userIds } });
            room.userNames = users.map(user => user.name);

            // Fetch the owner's name
            if (room.ownerId) {
                const owner = await User.findById(room.ownerId).lean();
                room.ownerName = owner ? owner.name : 'Unknown';
            }
        }

        res.json(rooms);
    } catch (error) {
        console.error("Error fetching rooms:", error);
        res.status(500).send("Error fetching rooms");
    }
});

// Route to handle room deletion
app.post('/delete-room', async (req, res) => {
    try {
        const { roomId } = req.body;

        // Optionally, check if the current user is the owner of the room
        const room = await ChatRoom.findById(roomId);
        if (!room) {
            return res.status(404).send('Room not found.');
        }

        if (req.user._id.toString() !== room.ownerId.toString()) {
            return res.status(403).send('You are not authorized to delete this room.');
        }

        await ChatRoom.deleteOne({ _id: roomId });
        res.send('Room deleted successfully.');
    } catch (error) {
        console.error('Error deleting room:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.post('/promote-user', async (req, res) => {
    try {
        const { roomId, username } = req.body;
        
        // Find the user to be promoted by username
        const userToPromote = await User.findOne({ name: username });
        if (!userToPromote) {
            return res.status(404).send('User not found');
        }

        // Find the room and check if the current user is the owner
        const room = await ChatRoom.findById(roomId);
        if (!room) {
            return res.status(404).send('Room not found');
        }
        if (req.user._id.toString() !== room.ownerId.toString()) {
            return res.status(403).send('You are not authorized to promote users in this room');
        }

        // Update the ownerId to the new owner's ID
        room.ownerId = userToPromote._id;
        await room.save();

        res.send('Room ownership updated successfully');
    } catch (error) {
        console.error("Error promoting user:", error);
        res.status(500).send("Error promoting user");
    }
});

app.post('/leave-room', async (req, res) => {
    try {
        const { roomId } = req.body;
        const userId = req.user._id; // Get the current user's ID from the session or authentication context

        // Log the user ID and room ID
        console.log(`User ID: ${userId}, Room ID: ${roomId}`);

        await ChatRoom.updateOne(
            { _id: roomId },
            { $pull: { userIds: userId } }
        );

        res.send('Left the room successfully');
    } catch (error) {
        console.error("Error leaving room:", error);
        res.status(500).send("Error leaving room");
    }
});

app.post('/remove-user-from-room', async (req, res) => {
    try {
        const { roomId, username } = req.body;
        const userToRemove = await User.findOne({ name: username });
        if (!userToRemove) {
            return res.status(404).send('User not found');
        }

        await ChatRoom.updateOne(
            { _id: roomId },
            { $pull: { userIds: userToRemove._id } }
        );

        res.send('User removed successfully');
    } catch (error) {
        console.error("Error removing user from room:", error);
        res.status(500).send("Error removing user from room");
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
    
    // Ensure the current user is included in the allowed users
    if (!allowedUsers.includes(currentUser._id.toString())) {
        allowedUsers.push(currentUser._id.toString());
    }
    console.log("Allowed Users:", allowedUsers);

    const existingRoom = await ChatRoom.findOne({ userIds: { $all: allowedUsers, $size: allowedUsers.length } });
    if (existingRoom) {
        return res.status(400).json({ error: 'Room with the same set of users already exists' });
    }

    // Create a new room with the current user as the owner
    const newRoom = new ChatRoom({
        name: roomName,
        userIds: allowedUsers,
        ownerId: currentUser._id, // Set the current user as the owner of the room
        ownerName: currentUser.name, // Set the owner's name
        isGroup: allowedUsers.length > 1,
    });
    

    await newRoom.save();
    console.log("New Room Data:", newRoom);

    res.json(newRoom);
});

app.post('/remove-user-from-room', async (req, res) => {
    const { roomId, userName } = req.body;

    try {
        // Find the user by name to get their ID
        const user = await User.findOne({ name: userName });
        if (!user) {
            return res.status(404).send('User not found.');
        }

        // Update the chat room to remove the user ID
        await ChatRoom.findByIdAndUpdate(
            roomId,
            { $pull: { userIds: user._id } },
            { new: true }
        );

        res.send('User removed from room.');
    } catch (error) {
        console.error('Error removing user from room:', error);
        res.status(500).send('Internal Server Error');
    }
});


app.post('/get-user-names', async (req, res) => {
    try {
        const userIds = req.body.userIds;
        const users = await User.find({ _id: { $in: userIds } });
        const userNames = users.map(user => user.name);
        res.json(userNames);
    } catch (error) {
        res.status(500).send("Error fetching user names");
    }
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


app.post('/upload-profile-pic', upload.any(), async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }

        // Update the username
        user.name = req.body.name || user.name;

        // Update the image if it is included
        const imageFile = req.files.find(file => file.fieldname === 'image');
        if (imageFile) {
            user.image = imageFile.path;
        }

        await user.save();
        res.json({ success: true, message: 'Profile updated successfully' });
    } catch (error) {
        console.error("Error updating profile:", error);
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
    res.render('home', { name: req.user.name, image: req.user.image, userId: req.user._id });
});


server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
});


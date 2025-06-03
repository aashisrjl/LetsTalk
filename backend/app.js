const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

//env configuration
const env = require('dotenv');
env.config();

//cors origin configuration
const cors = require('cors');
corsOptions = {
    origin: '*', 
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    optionsSuccessStatus: 204 
};
app.use(cors(corsOptions));

//body parser configuration
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.send('Welcome to the backend server!');
}
);

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
}
);
// Export the app for testing purposes
module.exports = app;
// Import routes
const userRoutes = require('./routes/user.routes');
// const authRoutes = require('./routes/authRoutes');
// Use routes
app.use('/api/users', userRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});
// 404 Not Found middleware
app.use((req, res) => {
    res.status(404).send('Not Found');
});

// Import mongoose for MongoDB connection
const mongoose = require('mongoose');
const dbURI = process.env.mongoURI ;
mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected successfully'))
    .catch(err => console.error('MongoDB connection error:', err));



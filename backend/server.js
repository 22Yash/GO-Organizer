require('dotenv').config();

const express =  require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require("./config/db");
const authRoutes = require('./routes/auth');
const githubRoutes = require('./routes/gitub');
const scanRoutes = require('./routes/scanRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes')

 

connectDB();

const app= express();

app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
app.use(cookieParser());
app.use(express.json());




app.use('/api/auth', authRoutes);
app.use('/api/github', githubRoutes);
app.use('/api/scan',scanRoutes);
app.use('/api/dashboard',dashboardRoutes );

app.listen(5000, () => console.log('Server running on http://localhost:5000'));

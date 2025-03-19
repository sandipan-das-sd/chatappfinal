


// const express = require('express')
// const cors = require('cors')
// require('dotenv').config()
// const connectDB = require('./config/connectDB')
// const router = require('./routes/index')
// const cookiesParser = require('cookie-parser')
// const { app, server } = require('./socket/index')

// // CORS configuration
// const corsOptions = {
//     origin: ['https://chatappfinal-delta.vercel.app', 'http://localhost:3000'],
//     methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
//     allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
//     credentials: true,
//     maxAge: 86400 // PREFLIGHT_CACHE_DURATION = 24 hours
// }

// // Apply CORS middleware
// app.use(cors(corsOptions))

// // Handle preflight requests
// app.options('*', cors(corsOptions))

// // Other middleware
// app.use(express.json())
// app.use(cookiesParser())

// // Custom headers middleware
// app.use((req, res, next) => {
//     res.header('Access-Control-Allow-Credentials', 'true')
//     res.header('Access-Control-Allow-Origin', req.headers.origin)
//     res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,UPDATE,OPTIONS')
//     res.header('Access-Control-Allow-Headers', 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept')
//     next()
// })

// // Routes
// app.get('/', (request, response) => {
//     response.json({
//         message: "Server running at " + PORT
//     })
// })

// app.use('/api', router)

// const PORT = process.env.PORT || 8081

// connectDB().then(() => {
//     server.listen(PORT, () => {
//         console.log("server running at " + PORT)
//     })
// })

const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/connectDB');
const router = require('./routes/index');
const cookieParser = require('cookie-parser');
const { app, server } = require('./socket/index');

// CORS configuration
const corsOptions = {
    origin: ['http://localhost:3000', 'https://chatappfinal-omega.vercel.app','https://www.chatappfinal-omega.vercel.app'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    credentials: true,
    maxAge: 86400
};

// Apply CORS before any routes
app.use(cors(corsOptions));

// Enable pre-flight requests for all routes
app.options('*', cors(corsOptions));

// Parse JSON bodies
app.use(express.json());
app.use(cookieParser());

// Global middleware for headers
app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (corsOptions.origin.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    next();
});

// Routes
app.get('/', (req, res) => {
    res.json({
        message: `Server running on port ${process.env.PORT || 8081}`
    });
});

app.use('/api', router);

const PORT = process.env.PORT || 8081;

// Server startup
const startServer = async () => {
    try {
        await connectDB();
        server.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
            console.log('✅ CORS enabled for:', corsOptions.origin);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();
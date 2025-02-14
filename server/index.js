


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
    origin: process.env.NODE_ENV === 'production' 
        ? [process.env.FRONTEND_URL]
        : ['http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    credentials: true,
    maxAge: 86400
};

// Middleware
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

// Security headers
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Origin', req.headers.origin);
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,UPDATE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept');
    // Add security headers
    res.header('X-Content-Type-Options', 'nosniff');
    res.header('X-Frame-Options', 'DENY');
    res.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
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

const startServer = async () => {
    try {
        await connectDB();
        server.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();
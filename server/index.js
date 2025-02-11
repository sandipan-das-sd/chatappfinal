// const express = require('express')
// const cors = require('cors')
// require('dotenv').config()
// const connectDB = require('./config/connectDB')
// const router = require('./routes/index')
// const cookiesParser = require('cookie-parser')
// const { app, server } = require('./socket/index')

// app.use(cors({
//     origin: [
//         'https://chatappfinal-delta.vercel.app',
//         'http://localhost:3000'
//     ],
//     methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
//     allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
//     exposedHeaders: ['Content-Type', 'Authorization'],
//     credentials: true,
//     preflightContinue: false,
//     optionsSuccessStatus: 204
// }))

// // Add this line after your CORS middleware
// app.options('*', cors()) // Enable pre-flight for all routes

// app.use(express.json())
// app.use(cookiesParser())

// const PORT = process.env.PORT || 8080

// app.get('/', (request, response) => {
//     response.json({
//         message: "Server running at " + PORT
//     })
// })
// app.use((req, res, next) => {
//     res.header('Access-Control-Allow-Origin', 'https://chatappfinal-delta.vercel.app');
//     res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
//     res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept');
//     res.header('Access-Control-Allow-Credentials', 'true');
//     if (req.method === 'OPTIONS') {
//         return res.status(204).end();
//     }
//     next();
// });
// //api endpoints
// app.use('/api', router)

// connectDB().then(() => {
//     server.listen(PORT, () => {
//         console.log("server running at " + PORT)
//     })
// })

const express = require('express')
const cors = require('cors')
require('dotenv').config()
const connectDB = require('./config/connectDB')
const router = require('./routes/index')
const cookiesParser = require('cookie-parser')
const { app, server } = require('./socket/index')

// CORS configuration
const corsOptions = {
    origin: ['https://chatappfinal-delta.vercel.app', 'http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    credentials: true,
    maxAge: 86400 // PREFLIGHT_CACHE_DURATION = 24 hours
}

// Apply CORS middleware
app.use(cors(corsOptions))

// Handle preflight requests
app.options('*', cors(corsOptions))

// Other middleware
app.use(express.json())
app.use(cookiesParser())

// Custom headers middleware
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Credentials', 'true')
    res.header('Access-Control-Allow-Origin', req.headers.origin)
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,UPDATE,OPTIONS')
    res.header('Access-Control-Allow-Headers', 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept')
    next()
})

// Routes
app.get('/', (request, response) => {
    response.json({
        message: "Server running at " + PORT
    })
})

app.use('/api', router)

const PORT = process.env.PORT || 8080

connectDB().then(() => {
    server.listen(PORT, () => {
        console.log("server running at " + PORT)
    })
})


const express = require('express')
const { Server } = require('socket.io')
const http = require('http')
const getUserDetailsFromToken = require('../helpers/getUserDetailsFromToken')
const UserModel = require('../models/UserModel')
const { ConversationModel, MessageModel } = require('../models/ConversationModel')
const getConversation = require('../helpers/getConversation')

const app = express()
const server = http.createServer(app)
const io = new Server(server, {
    cors: {
        origin: [
            'https://chatappfinal-omega.vercel.app',
            'https://www.chatappfinal-omega.vercel.app',
            'http://localhost:3000'
        ],
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
        credentials: true
    }
})

// Track online users and their socket IDs
const onlineUsers = new Map() // userId -> Set of socket IDs
const lastSeenTimes = new Map()

io.on('connection', async (socket) => {
    console.log("User connected:", socket.id)

    const token = socket.handshake.auth.token
    if (!token) {
        console.log("No token provided")
        return socket.disconnect()
    }

    const user = await getUserDetailsFromToken(token)
    if (!user || user.logout) {
        console.log("Invalid user authentication")
        return socket.disconnect()
    }

    const userId = user._id.toString()

    // Add user's socket to online users
    if (!onlineUsers.has(userId)) {
        onlineUsers.set(userId, new Set())
    }
    onlineUsers.get(userId).add(socket.id)

    // Emit online status
    io.emit('onlineUsers', Array.from(onlineUsers.keys()))
    io.emit('lastSeen', Object.fromEntries(lastSeenTimes))

    // When user opens a chat
    socket.on('message-page', async (recipientId) => {
        const userDetails = await UserModel.findById(recipientId).select("-password")
        
        const payload = {
            _id: userDetails?._id,
            name: userDetails?.name,
            email: userDetails?.email,
            profile_pic: userDetails?.profile_pic,
            online: onlineUsers.has(recipientId),
            lastSeen: lastSeenTimes.get(recipientId)
        }
        socket.emit('message-user', payload)
       
        // Get conversation and mark messages as delivered if sender is online
        const conversation = await ConversationModel.findOne({
            "$or": [
                { sender: user._id, receiver: recipientId },
                { sender: recipientId, receiver: user._id }
            ]
        }).populate('messages')
         //filter the sent message and mark them as delivred when users online 
        if (conversation) {
            // Mark messages as delivered when chat is opened
            const undeliveredMessages = conversation.messages.filter(
                msg => msg.msgByUserId.toString() === recipientId && msg.status === 'sent'
            )

            for (const msg of undeliveredMessages) {
                await MessageModel.updateOne(
                    { _id: msg._id },
                    { status: 'delivered' }
                )
                
                // Notify sender about delivered status
                if (onlineUsers.has(recipientId)) {
                    io.to(Array.from(onlineUsers.get(recipientId))).emit('message-status-update', {
                        messageId: msg._id,
                        status: 'delivered'
                    })
                }
            }

            // Reset unseen count when opening chat
            if (conversation.unseenMsg > 0) {
                await ConversationModel.updateOne(
                    { _id: conversation._id },
                    { unseenMsg: 0 }
                )
                
                // Update sidebar for the user who opened the chat
                const updatedConversation = await getConversation(userId)
                socket.emit('conversation', updatedConversation)
            }
        }

        socket.emit('messages', conversation?.messages || [])
    })

    // Handle new messages
    socket.on('new message', async (data) => {
        try {
            let conversation = await ConversationModel.findOne({
                "$or": [
                    { sender: data.sender, receiver: data.receiver },
                    { sender: data.receiver, receiver: data.sender }
                ]
            })

            if (!conversation) {
                conversation = await ConversationModel({
                    sender: data.sender,
                    receiver: data.receiver,
                    unseenMsg: 1
                }).save()
            } else if (data.sender !== data.receiver) {
                await ConversationModel.updateOne(
                    { _id: conversation._id },
                    { "$inc": { unseenMsg: 1 }}
                )
            }

            // Create new message
            const message = new MessageModel({
                text: data.text,
                imageUrl: data.imageUrl,
                videoUrl: data.videoUrl,
                msgByUserId: data.msgByUserId,
                // Set initial status based on receiver's online status
                status: onlineUsers.has(data.receiver) ? 'delivered' : 'sent'
            })
            const savedMessage = await message.save()

            // Update conversation
            await ConversationModel.updateOne(
                { _id: conversation._id },
                { 
                    "$push": { messages: savedMessage._id },
                    "$set": { lastMessage: savedMessage._id }
                }
            )

            // Emit to all sender's tabs and receiver
            const senderSockets = onlineUsers.get(data.sender) || new Set()
            for (const socketId of senderSockets) {
                io.to(socketId).emit('message', { ...savedMessage.toObject() })
            }

            if (onlineUsers.has(data.receiver)) {
                const receiverSockets = onlineUsers.get(data.receiver)
                for (const socketId of receiverSockets) {
                    io.to(socketId).emit('message', savedMessage)
                }
            }

            // Update conversations in sidebar for both users
            const conversationSender = await getConversation(data.sender)
            const conversationReceiver = await getConversation(data.receiver)

            io.to(data.sender).emit('conversation', conversationSender)
            io.to(data.receiver).emit('conversation', conversationReceiver)

        } catch (error) {
            console.error('Error in new message:', error)
            socket.emit('error', { message: 'Failed to send message' })
        }
    })

    // Handle seen status
    socket.on('seen', async (senderId) => {
        try {
            const conversation = await ConversationModel.findOne({
                "$or": [
                    { sender: user._id, receiver: senderId },
                    { sender: senderId, receiver: user._id }
                ]
            })

            if (conversation) {
                // Mark all messages from sender as seen
                await MessageModel.updateMany(
                    { 
                        _id: { "$in": conversation.messages },
                        msgByUserId: senderId,
                        seen: false
                    },
                    { 
                        "$set": { 
                            seen: true,
                            status: 'seen'
                        }
                    }
                )

                // Reset unseen count
                await ConversationModel.updateOne(
                    { _id: conversation._id },
                    { unseenMsg: 0 }
                )

                // Notify sender about seen status
                if (onlineUsers.has(senderId)) {
                    const seenMessages = await MessageModel.find({
                        _id: { "$in": conversation.messages },
                        msgByUserId: senderId
                    })

                    const senderSockets = onlineUsers.get(senderId)
                    for (const msg of seenMessages) {
                        for (const socketId of senderSockets) {
                            io.to(socketId).emit('message-status-update', {
                                messageId: msg._id,
                                status: 'seen'
                            })
                        }
                    }
                }

                // Update sidebar for both users
                const conversationSender = await getConversation(senderId)
                const conversationReceiver = await getConversation(user._id.toString())

                io.to(senderId).emit('conversation', conversationSender)
                socket.emit('conversation', conversationReceiver)
            }
        } catch (error) {
            console.error('Error marking messages as seen:', error)
        }
    })

    // Handle disconnect
    socket.on('disconnect', () => {
        const userSockets = onlineUsers.get(userId)
        if (userSockets) {
            userSockets.delete(socket.id)
            if (userSockets.size === 0) {
                onlineUsers.delete(userId)
                lastSeenTimes.set(userId, new Date().toISOString())
                io.emit('onlineUsers', Array.from(onlineUsers.keys()))
                io.emit('lastSeen', Object.fromEntries(lastSeenTimes))
            }
        }
        console.log('User disconnected:', socket.id)
    })
})

module.exports = {
    app,
    server
}
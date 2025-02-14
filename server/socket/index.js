// const express = require('express')
// const { Server } = require('socket.io')
// const http  = require('http')
// const getUserDetailsFromToken = require('../helpers/getUserDetailsFromToken')
// const UserModel = require('../models/UserModel')
// const { ConversationModel,MessageModel } = require('../models/ConversationModel')
// const getConversation = require('../helpers/getConversation')

// const app = express()

// /***socket connection */
// const server = http.createServer(app)
// const io = new Server(server, {
//     cors: {
//         origin: [
//             'https://chatappfinal-delta.vercel.app',
//             'http://localhost:3000'
//         ],
//         methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
//         allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
//         credentials: true
//     }
// })

// /***
//  * socket running at http://localhost:8080/
//  */

// //online user
// const onlineUser = new Set()
// const lastSeenTimes = new Map() 
// io.on('connection',async(socket)=>{
//     console.log("connect User ", socket.id)

//     const token = socket.handshake.auth.token 
//     if (!token) {
//         console.log("No token provided")
//         return socket.disconnect()
//     }
//     //current user details 
//     const user = await getUserDetailsFromToken(token)
//     if (!user || user.logout) {
//         console.log("Invalid user authentication")
//         return socket.disconnect()
//     }
//     const userId = user._id.toString()
//     //create a room
//     socket.join(user?._id.toString())
//     onlineUser.add(user?._id?.toString())

//     io.emit('onlineUser',Array.from(onlineUser)) //convert set to array
//     io.emit('lastSeen', Object.fromEntries(lastSeenTimes)) //convert map to object
//     socket.on('message-page',async(userId)=>{  
//         console.log('userId',userId)
//         const userDetails = await UserModel.findById(userId).select("-password")
        
//         const payload = {
//             _id : userDetails?._id,
//             name : userDetails?.name,
//             email : userDetails?.email,
//             profile_pic : userDetails?.profile_pic,
//             online : onlineUser.has(userId),
//             lastSeen: lastSeenTimes.get(userId)
//         }
//         socket.emit('message-user',payload)


//          //get previous message
//          const getConversationMessage = await ConversationModel.findOne({
//             "$or" : [
//                 { sender : user?._id, receiver : userId },
//                 { sender : userId, receiver :  user?._id}
//             ]
//         }).populate('messages').sort({ updatedAt : -1 })

//         socket.emit('message',getConversationMessage?.messages || [])
//     })


//     //new message
//     // socket.on('new message',async(data)=>{

//     //     //check conversation is available both user

//     //     let conversation = await ConversationModel.findOne({
//     //         "$or" : [
//     //             { sender : data?.sender, receiver : data?.receiver },
//     //             { sender : data?.receiver, receiver :  data?.sender}
//     //         ]
//     //     })

//     //     //if conversation is not available
//     //     if(!conversation){
//     //         const createConversation = await ConversationModel({
//     //             sender : data?.sender,
//     //             receiver : data?.receiver
//     //         })
//     //         conversation = await createConversation.save()
//     //     }
        
//     //     const message = new MessageModel({
//     //       text : data.text,
//     //       imageUrl : data.imageUrl,
//     //       videoUrl : data.videoUrl,
//     //       msgByUserId :  data?.msgByUserId,
//     //     })
//     //     const saveMessage = await message.save()

//     //     const updateConversation = await ConversationModel.updateOne({ _id : conversation?._id },{
//     //         "$push" : { messages : saveMessage?._id }
//     //     })

//     //     const getConversationMessage = await ConversationModel.findOne({
//     //         "$or" : [
//     //             { sender : data?.sender, receiver : data?.receiver },
//     //             { sender : data?.receiver, receiver :  data?.sender}
//     //         ]
//     //     }).populate('messages').sort({ updatedAt : -1 })


//     //     io.to(data?.sender).emit('message',getConversationMessage?.messages || [])
//     //     io.to(data?.receiver).emit('message',getConversationMessage?.messages || [])

//     //     //send conversation
//     //     const conversationSender = await getConversation(data?.sender)
//     //     const conversationReceiver = await getConversation(data?.receiver)

//     //     io.to(data?.sender).emit('conversation',conversationSender)
//     //     io.to(data?.receiver).emit('conversation',conversationReceiver)
//     // })

//     // socket.on('new message', async(data) => {
//     //     let conversation = await ConversationModel.findOne({
//     //         "$or": [
//     //             { sender: data?.sender, receiver: data?.receiver },
//     //             { sender: data?.receiver, receiver: data?.sender }
//     //         ]
//     //     })

//     //     if(!conversation) {
//     //         conversation = await ConversationModel({
//     //             sender: data?.sender,
//     //             receiver: data?.receiver,
//     //             unseenMsg: 1 
//     //         }).save()
//     //     }
//     //     else
//     //     {
//     //         // Increment unseenMsg count if receiver is different from sender
//     //     if(data.sender !== data.receiver) {
//     //         await ConversationModel.updateOne(
//     //             { _id: conversation._id },
//     //             { "$inc": { unseenMsg: 1 }}  // Increment unseen message count
//     //         )
//     //     }
//     //     }
        
//     //     const message = new MessageModel({
//     //         text: data.text,
//     //         imageUrl: data.imageUrl,
//     //         videoUrl: data.videoUrl,
//     //         msgByUserId: data?.msgByUserId,
//     //         status: 'sent'  // Initial status
//     //     })
//     //     const saveMessage = await message.save()

//     //     await ConversationModel.updateOne(
//     //         { _id: conversation?._id },
//     //         { "$push": { messages: saveMessage?._id }}
//     //     )

//     //     // Emit to sender and receiver
//     //     io.to(data?.sender).emit('message', { ...saveMessage.toObject(), status: 'sent' })
//     //     io.to(data?.receiver).emit('message', saveMessage)

//     //     // Update to delivered if receiver is online
//     //     if(onlineUser.has(data?.receiver)) {
//     //         await MessageModel.updateOne(
//     //             { _id: saveMessage._id },
//     //             { status: 'delivered' }
//     //         )
//     //         io.to(data?.sender).emit('message-status-update', {
//     //             messageId: saveMessage._id,
//     //             status: 'delivered'
//     //         })
//     //     }
//     // })
//     socket.on('typing', async(data) => {
//         try {
//             const { receiverId } = data;
//             // Emit to specific receiver that someone is typing
//             io.to(receiverId).emit('typing', {
//                 userId: user._id.toString()
//             });
//         } catch (error) {
//             console.error('Error in typing event:', error);
//         }
//     });
//     socket.on('new message', async(data) => {
//         try {
//             let conversation = await ConversationModel.findOne({
//                 "$or": [
//                     { sender: data?.sender, receiver: data?.receiver },
//                     { sender: data?.receiver, receiver: data?.sender }
//                 ]
//             })
    
//             if(!conversation) {
//                 conversation = await ConversationModel({
//                     sender: data?.sender,
//                     receiver: data?.receiver,
//                     unseenMsg: 1
//                 }).save()
//             } else {
//                 // Increment unseenMsg count if receiver is different from sender
//                 if(data.sender !== data.receiver) {
//                     await ConversationModel.updateOne(
//                         { _id: conversation._id },
//                         { "$inc": { unseenMsg: 1 }}
//                     )
//                 }
//             }
            
//             const message = new MessageModel({
//                 text: data.text,
//                 imageUrl: data.imageUrl,
//                 videoUrl: data.videoUrl,
//                 msgByUserId: data?.msgByUserId,
//                 status: 'sent'
//             })
//             const savedMessage = await message.save()
    
//             // Update conversation with new message and set it as lastMessage
//             await ConversationModel.updateOne(
//                 { _id: conversation?._id },
//                 { 
//                     "$push": { messages: savedMessage?._id },
//                     "$set": { lastMessage: savedMessage?._id }
//                 }
//             )
    
//             // Emit to sender and receiver
//             io.to(data?.sender).emit('message', { ...savedMessage.toObject(), status: 'sent' })
//             io.to(data?.receiver).emit('message', savedMessage)
    
//             // Update to delivered if receiver is online
//             if(onlineUser.has(data?.receiver)) {
//                 await MessageModel.updateOne(
//                     { _id: savedMessage._id },
//                     { status: 'delivered' }
//                 )
//                 io.to(data?.sender).emit('message-status-update', {
//                     messageId: savedMessage._id,
//                     status: 'delivered'
//                 })
//             }
    
//             // Send updated conversation to both users
//             const conversationSender = await getConversation(data?.sender)
//             const conversationReceiver = await getConversation(data?.receiver)
    
//             io.to(data?.sender).emit('conversation', conversationSender)
//             io.to(data?.receiver).emit('conversation', conversationReceiver)
//         } catch (error) {
//             console.error('Error in new message:', error)
//             socket.emit('error', { message: 'Failed to send message' })
//         }
//     })

//     // Handle message delivery status
//     socket.on('message-delivered', async({ messageId }) => {
//         await MessageModel.updateOne(
//             { _id: messageId },
//             { status: 'delivered' }
//         )
        
//         const message = await MessageModel.findById(messageId)
//         io.to(message.msgByUserId.toString()).emit('message-status-update', {
//             messageId,
//             status: 'delivered'
//         })
//     })

//     // Handle message seen status
//     socket.on('seen', async(msgByUserId) => {
//         let conversation = await ConversationModel.findOne({
//             "$or": [
//                 { sender: user?._id, receiver: msgByUserId },
//                 { sender: msgByUserId, receiver: user?._id }
//             ]
//         })
    
//         const conversationMessageId = conversation?.messages || []
    
//         // Update all unseen messages to seen
//         await MessageModel.updateMany(
//             { 
//                 _id: { "$in": conversationMessageId }, 
//                 msgByUserId: msgByUserId,
//                 seen: false  // Only update unseen messages
//             },
//             { 
//                 "$set": { 
//                     seen: true,
//                     status: 'seen'  // Also update the status
//                 }
//             }
//         )
    
//         // Update conversation to reflect that messages are seen
//         await ConversationModel.updateOne(
//             { _id: conversation?._id },
//             { "$set": { unseenMsg: 0 }}  // Reset unseen message count
//         )
    
//         // Send updated conversation data to both users
//         const conversationSender = await getConversation(user?._id?.toString())
//         const conversationReceiver = await getConversation(msgByUserId)
    
//         io.to(user?._id?.toString()).emit('conversation', conversationSender)
//         io.to(msgByUserId).emit('conversation', conversationReceiver)
    
//         // Also emit message-status-update for all seen messages
//         const seenMessages = await MessageModel.find({
//             _id: { "$in": conversationMessageId },
//             msgByUserId: msgByUserId
//         })
    
//         seenMessages.forEach(msg => {
//             io.to(msgByUserId).emit('message-status-update', {
//                 messageId: msg._id,
//                 status: 'seen'
//             })
//         })
//     })
//     //sidebar
//     socket.on('sidebar',async(currentUserId)=>{
//         console.log("current user",currentUserId)

//         const conversation = await getConversation(currentUserId)

//         socket.emit('conversation',conversation)
        
//     })

//     // socket.on('seen',async(msgByUserId)=>{
        
//     //     let conversation = await ConversationModel.findOne({
//     //         "$or" : [
//     //             { sender : user?._id, receiver : msgByUserId },
//     //             { sender : msgByUserId, receiver :  user?._id}
//     //         ]
//     //     })

//     //     const conversationMessageId = conversation?.messages || []

//     //     const updateMessages  = await MessageModel.updateMany(
//     //         { _id : { "$in" : conversationMessageId }, msgByUserId : msgByUserId },
//     //         { "$set" : { seen : true }}
//     //     )

//     //     //send conversation
//     //     const conversationSender = await getConversation(user?._id?.toString())
//     //     const conversationReceiver = await getConversation(msgByUserId)

//     //     io.to(user?._id?.toString()).emit('conversation',conversationSender)
//     //     io.to(msgByUserId).emit('conversation',conversationReceiver)
//     // })

//     //disconnect
//     socket.on('disconnect',()=>{
//         onlineUser.delete(user?._id?.toString())
     
//         lastSeenTimes.set(userId, new Date().toISOString())
//         io.emit('lastSeen', {
//             userId: userId,
//             timestamp: lastSeenTimes.get(userId)
//         })
//         io.emit('typing', {
//             userId: user._id.toString(),
//             isTyping: false
//         });
        
//         console.log('disconnect user ',socket.id)
//     })
// })

// module.exports = {
//     app,
//     server
// }

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
            'https://chatappfinal-delta.vercel.app',
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
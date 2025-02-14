const mongoose = require('mongoose')

const messageSchema = new mongoose.Schema({
    text: {
        type: String,
        default: ""
    },
    imageUrl: {
        type: String,
        default: ""
    },
    videoUrl: {
        type: String,
        default: ""
    },
    audio: {
        type: String,
        default: ""
    },
    status: {
        type: String,
        enum: ['sent', 'delivered', 'seen'],
        default: 'sent'
    },
    seen: {
        type: Boolean,
        default: false
    },
    msgByUserId: {
        type: mongoose.Schema.ObjectId,
        required: true,
        ref: 'User'
    }
}, {
    timestamps: true
})

const conversationSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.ObjectId,
        required: true,
        ref: 'User'
    },
    receiver: {
        type: mongoose.Schema.ObjectId,
        required: true,
        ref: 'User'
    },
    messages: [{
        type: mongoose.Schema.ObjectId,
        ref: 'Message'
    }],
    unseenMsg: {
        type: Number,
        default: 0
    },
    lastMessage: {
        type: mongoose.Schema.ObjectId,
        ref: 'Message'
    }
}, {
    timestamps: true
})

// Add index for better query performance
conversationSchema.index({ sender: 1, receiver: 1 })
messageSchema.index({ msgByUserId: 1 })

const MessageModel = mongoose.model('Message', messageSchema)
const ConversationModel = mongoose.model('Conversation', conversationSchema)

module.exports = {
    MessageModel,
    ConversationModel
}
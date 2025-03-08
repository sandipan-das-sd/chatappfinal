

const { ConversationModel } = require("../models/ConversationModel")

const getConversation = async (currentUserId) => {
    if (!currentUserId) return [];

    try {
        // Get conversations with populated data and sort by latest message
        const currentUserConversation = await ConversationModel.find({
            "$or": [
                { sender: currentUserId },
                { receiver: currentUserId }
            ]
        })
        .populate({
            path: 'messages',
            options: { sort: { createdAt: -1 } } // Sort messages by newest first
        })
        .populate('sender', '-password') // Exclude password
        .populate('receiver', '-password') // Exclude password
        .sort({ updatedAt: -1 }); // Sort conversations by latest update

        // Map and transform conversation data
        const conversation = currentUserConversation.map((conv) => {
            // Get unseen message count
            const countUnseenMsg = conv?.messages?.reduce((total, msg) => {
                // Check if message is from other user and unseen
                if (msg?.msgByUserId?.toString() !== currentUserId && !msg?.seen) {
                    return total + 1;
                }
                return total;
            }, 0);

            // Get the last message (first one since we sorted by newest)
            const lastMsg = conv.messages?.[0] || null;

            return {
                _id: conv._id,
                sender: conv.sender,
                receiver: conv.receiver,
                unseenMsg: countUnseenMsg,
                lastMsg: lastMsg,
                updatedAt: conv.updatedAt
            };
        });

        return conversation;
    } catch (error) {
        console.error('Error in getConversation:', error);
        return [];
    }
};

module.exports = getConversation;
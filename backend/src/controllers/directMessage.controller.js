import * as directMessageService from '../services/directMessage.service.js';

export const sendNewDirectMessage = async (req, res, next) => {
    try {
        const { receiver_id, content, message_type, file_url } = req.body;
        const sender_id = req.user.id;

        const messageData = {
            sender_id,
            receiver_id,
            content,
            message_type,
            file_url,
        };

        const message = await directMessageService.sendDirectMessage(messageData);
        res.status(201).json(message);
    } catch (error) {
        next(error);
    }
};

export const getMessagesBetweenUsers = async (req, res, next) => {
    try {
        const userId1 = req.user.id; // Authenticated user
        const { userId2 } = req.params; // The other user in the conversation

        const messages = await directMessageService.getDirectMessages(
            userId1,
            parseInt(userId2)
        );
        res.status(200).json(messages);
    } catch (error) {
        next(error);
    }
}; 
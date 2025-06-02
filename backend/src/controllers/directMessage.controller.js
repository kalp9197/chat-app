import * as directMessageService from '../services/directMessage.service.js';
import { HTTP_STATUS } from '../constants/statusCodes.js';

export const sendNewDirectMessage = async (req, res, next) => {
    try {
        const { receiver_uuid, content, message_type } = req.body;
        const sender_id = req.user.id;

        const messageData = {
            sender_id,
            receiver_uuid,
            content,
            message_type
        };

        const message = await directMessageService.sendDirectMessage(messageData);
        res.status(HTTP_STATUS.CREATED).json({
            success: true,
            message: "Message sent successfully",
            data: message
        });
    } catch (error) {
        if (error.message === "Receiver not found") {
            return res.status(HTTP_STATUS.NOT_FOUND).json({
                success: false,
                message: "Receiver not found"
            });
        }
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: error.message
        });
    }
};

export const getMessagesBetweenUsers = async (req, res, next) => {
    try {
        const sender_id = req.user.id; // Authenticated user
        const { receiver_uuid } = req.params; // The other user in the conversation

        const messages = await directMessageService.getDirectMessages(
            sender_id,
            receiver_uuid
        );
        res.status(HTTP_STATUS.OK).json({
            success: true,
            data: messages
        });
    } catch (error) {
        if (error.message === "Receiver not found") {
            return res.status(HTTP_STATUS.NOT_FOUND).json({
                success: false,
                message: "Receiver not found"
            });
        }
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: error.message
        });
    }
};
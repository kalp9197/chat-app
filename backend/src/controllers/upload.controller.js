import * as uploadService from '../services/upload.service.js';
import * as directMessageService from '../services/directMessage.service.js';
import path from 'path';
import { HTTP_STATUS } from '../constants/statusCodes.js';
import { ApiError } from '../errors/apiError.js';

//upload a file to the server
export const uploadFile = async (req, res) => {
  try {
    let { data, type, fileName, receiver_uuid, group_uuid } = req.body;
    const sender_id = req.user.id;

    const ext = path.extname(fileName);
    const fileExtension = ext ? ext.substring(1) : type.split('/')[1] || 'bin';

    const uniqueFileName = await uploadService.saveBase64File(data, fileExtension, fileName);

    const messageData = {
      sender_id,
      receiver_uuid,
      group_uuid,
      content: JSON.stringify({
        type,
        fileName,
        filePath: `/uploads/${uniqueFileName}`,
      }),
      message_type: 'file',
    };

    const message = await directMessageService.sendMessage(messageData);
    message.content = JSON.parse(message.content);
    delete message.content.filePath;

    return res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: 'File uploaded and message sent successfully',
      data: message,
    });
  } catch (error) {
    const statusCode =
      error instanceof ApiError ? error.statusCode : HTTP_STATUS.INTERNAL_SERVER_ERROR;
    return res.status(statusCode).json({
      success: false,
      message: error.message,
    });
  }
};

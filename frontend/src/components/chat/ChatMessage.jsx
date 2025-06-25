import React, { useMemo, useState, useRef, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  Download,
  File as FileIcon,
  MoreVertical,
  X,
  Trash2,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import PdfViewerModal from './PdfViewerModal';

// Modal for viewing images
const ImageViewerModal = ({ src, alt, onClose }) => (
  <div
    className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
    onClick={onClose}
  >
    <div className="relative" onClick={(e) => e.stopPropagation()}>
      <img src={src} alt={alt} className="max-h-[90vh] max-w-[90vw] object-contain" />
      <button
        onClick={onClose}
        className="absolute -top-2 -right-2 bg-white rounded-full p-1 text-black"
      >
        <X size={24} />
      </button>
    </div>
  </div>
);

const ChatMessage = React.memo(
  ({ message, onDeleteMessage }) => {
    const user = useAuth((state) => state.user);

    // Memoize message data for performance
    const messageData = useMemo(() => {
      if (!message || !user) return null;

      const isSentByMe = message.sender?.uuid === user.uuid || message.sender === user.uuid;
      const senderName = message.sender?.name || message.senderName || '';
      const timestamp = message.timestamp || message.created_at;
      const formattedTime = timestamp
        ? new Date(timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
          })
        : '';
      const messageContent = message.content;
      const messageType =
        message.message_type || (typeof messageContent === 'string' ? 'text' : 'file');
      const senderInitial = isSentByMe
        ? (user.name?.charAt(0) || 'M').toUpperCase()
        : (senderName.charAt(0) || '?').toUpperCase();

      return {
        isSentByMe,
        senderName,
        formattedTime,
        messageContent,
        messageType,
        senderInitial,
      };
    }, [message, user]);

    const [showTimestamp, setShowTimestamp] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalContent, setModalContent] = useState(null);

    // Download file handler
    const handleDownload = (e, content) => {
      e.stopPropagation();
      if (!content.data) return;
      const byteCharacters = atob(content.data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: content.type });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = content.fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    };

    const handleDelete = () => {
      if (onDeleteMessage && message.uuid) {
        onDeleteMessage(message.uuid);
      }
    };

    // Render file message (image, pdf, other)
    function renderFileMessage(content, isSentByMe) {
      if (!content || typeof content !== 'object') {
        return <div className="text-sm text-red-500">Invalid file message</div>;
      }
      const { data, fileName, type, error, fileSize } = content;
      if (error) {
        return (
          <div
            className={`relative flex items-center gap-2 p-2 rounded-lg min-w-[200px] group ${isSentByMe ? 'bg-blue-500' : 'bg-white border border-gray-200'}`}
          >
            <FileIcon className={`w-6 h-6 ${isSentByMe ? 'text-blue-100' : 'text-blue-500'}`} />
            <div className="flex-1 overflow-hidden">
              <p
                className={`text-sm font-medium truncate ${isSentByMe ? 'text-blue-100' : 'text-gray-500'}`}
              >
                Error: {error}
              </p>
            </div>
            {isSentByMe && (
              <div className="flex items-center justify-center ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <MessageMenu isSentByMe={isSentByMe} onDelete={handleDelete} />
              </div>
            )}
          </div>
        );
      }
      const isImage = type && type.startsWith('image/');
      const isPdf = type === 'application/pdf';
      if (isImage && data) {
        return (
          <>
            <div className="relative group flex items-center justify-center">
              <img
                src={`data:${type};base64,${data}`}
                alt={fileName}
                className="max-w-xs max-h-64 rounded-lg object-contain cursor-pointer"
                onClick={() => {
                  setModalContent('image');
                  setIsModalOpen(true);
                }}
                title={`Click to view ${fileName}`}
              />
              {isSentByMe && (
                <div className="absolute top-1 right-1 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <MessageMenu
                    onDownload={(e) => handleDownload(e, content)}
                    isSentByMe={isSentByMe}
                    onDelete={handleDelete}
                  />
                </div>
              )}
            </div>
            {isModalOpen && modalContent === 'image' && (
              <ImageViewerModal
                src={`data:${type};base64,${data}`}
                alt={fileName}
                onClose={() => {
                  setIsModalOpen(false);
                  setModalContent(null);
                }}
              />
            )}
          </>
        );
      }
      if (isPdf && data) {
        return (
          <>
            <div
              className={`relative flex items-center gap-2 p-2 rounded-lg min-w-[200px] group ${
                isSentByMe ? 'bg-blue-500' : 'bg-white border border-gray-200'
              }`}
            >
              <div
                className="flex items-center gap-2 flex-1 cursor-pointer"
                onClick={() => {
                  setModalContent('pdf');
                  setIsModalOpen(true);
                }}
              >
                <FileIcon className={`w-6 h-6 ${isSentByMe ? 'text-white' : 'text-blue-500'}`} />
                <div className="flex-1 overflow-hidden">
                  <p
                    className={`text-sm font-medium truncate ${isSentByMe ? 'text-white' : 'text-gray-800'}`}
                  >
                    {fileName || 'PDF Document'}
                  </p>
                  <p className="text-xs text-gray-400">PDF Document</p>
                </div>
              </div>
              {isSentByMe && (
                <div className="flex items-center justify-center ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <MessageMenu
                    onDownload={(e) => handleDownload(e, content)}
                    isSentByMe={isSentByMe}
                    onDelete={handleDelete}
                  />
                </div>
              )}
            </div>
            {isModalOpen && modalContent === 'pdf' && (
              <PdfViewerModal
                pdfData={data}
                fileName={fileName}
                onClose={() => {
                  setIsModalOpen(false);
                  setModalContent(null);
                }}
              />
            )}
          </>
        );
      }
      return (
        <div
          className={`relative flex items-center gap-2 p-2 rounded-lg min-w-[200px] group ${isSentByMe ? 'bg-blue-500' : 'bg-white border border-gray-200'}`}
        >
          <FileIcon className={`w-6 h-6 ${isSentByMe ? 'text-blue-50' : 'text-blue-500'}`} />
          <div className="flex-1 overflow-hidden">
            <p
              className={`text-sm font-medium truncate ${isSentByMe ? 'text-white' : 'text-gray-800'}`}
            >
              {fileName || 'File'}
            </p>
            <p className="text-xs text-gray-400">{fileSize ? `(${fileSize})` : ''}</p>
          </div>
          {data && isSentByMe && (
            <div className="flex items-center justify-center ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <MessageMenu
                onDownload={(e) => handleDownload(e, content)}
                isSentByMe={isSentByMe}
                onDelete={handleDelete}
              />
            </div>
          )}
        </div>
      );
    }

    // Memoize status icon
    const statusIcon = useMemo(() => {
      if (message.isPending)
        return (
          <div className="flex items-center text-xs text-gray-400">
            <Clock size={12} className="mr-1" />
            <span>Sending</span>
          </div>
        );
      if (message.failed)
        return (
          <div className="flex items-center text-xs text-red-500">
            <AlertCircle size={12} className="mr-1" />
            <span>Failed</span>
          </div>
        );
      return <CheckCircle2 size={12} className="text-gray-400" />;
    }, [message.isPending, message.failed]);

    // Memoize time ago
    const timeAgo = useMemo(() => {
      if (!message.timestamp && !message.created_at) return '';
      const date = message.timestamp ? new Date(message.timestamp) : new Date(message.created_at);
      return formatDistanceToNow(date, { addSuffix: true });
    }, [message.timestamp, message.created_at]);

    if (!messageData) return null;

    const { isSentByMe, senderName, formattedTime, messageContent, senderInitial, messageType } =
      messageData;

    // Message menu for download, etc.
    const MessageMenu = ({ onDownload, isSentByMe, onDelete }) => {
      const [isOpen, setIsOpen] = useState(false);
      const menuRef = useRef(null);

      useEffect(() => {
        const handleClickOutside = (event) => {
          if (menuRef.current && !menuRef.current.contains(event.target)) {
            setIsOpen(false);
          }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
          document.removeEventListener('mousedown', handleClickOutside);
        };
      }, []);

      return (
        <div ref={menuRef} className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen((prev) => !prev);
            }}
            className="p-1 rounded-full hover:bg-black/10"
          >
            <MoreVertical size={18} className={isSentByMe ? 'text-white' : 'text-gray-500'} />
          </button>
          {isOpen && (
            <div className="absolute top-full right-0 mt-1 w-40 bg-white dark:bg-slate-800 rounded-md shadow-lg z-20 border border-gray-200 dark:border-slate-700">
              <ul className="py-1">
                {onDownload && (
                  <li
                    onClick={(e) => {
                      e.stopPropagation();
                      onDownload(e);
                      setIsOpen(false);
                    }}
                    className="flex items-center px-3 py-2 text-sm text-gray-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700 cursor-pointer"
                  >
                    <Download size={14} className="mr-2" />
                    Download
                  </li>
                )}
                {isSentByMe && onDelete && (
                  <li
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm('Are you sure you want to delete this message?')) {
                        onDelete();
                      }
                      setIsOpen(false);
                    }}
                    className="flex items-center px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-500 dark:hover:bg-red-900/30 cursor-pointer"
                  >
                    <Trash2 size={14} className="mr-2" />
                    Delete
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>
      );
    };

    return (
      <div
        className={cn(
          'group w-full flex mb-4 last:mb-2',
          isSentByMe ? 'justify-end' : 'justify-start',
        )}
        onClick={() => setShowTimestamp((prev) => !prev)}
      >
        {/* Sender avatar (left for others, right for me) */}
        {!isSentByMe ? (
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 border-2 border-white shadow-sm flex items-center justify-center text-white text-xs font-semibold self-start mt-1 mr-2 flex-shrink-0">
            {senderInitial}
          </div>
        ) : null}

        <div className="flex flex-col max-w-[90%] md:max-w-[80%]">
          <div
            className={cn(
              'px-4 py-2.5 rounded-2xl shadow-sm transition-all duration-200',
              isSentByMe
                ? 'bg-blue-500 text-white rounded-br-sm'
                : 'bg-white text-gray-800 border border-gray-100 rounded-bl-sm',
            )}
          >
            {/* Sender name for group/other messages */}
            {!isSentByMe && senderName && (
              <div className="text-xs font-semibold mb-1 text-purple-600">{senderName}</div>
            )}
            <div className="text-sm whitespace-pre-wrap break-words leading-relaxed relative flex items-center group">
              {messageType === 'file'
                ? renderFileMessage(messageContent, isSentByMe)
                : typeof messageContent === 'string' && (
                    <>
                      <span className="flex-1">{messageContent}</span>
                      {isSentByMe && (
                        <div className="flex items-center justify-center ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <MessageMenu isSentByMe={isSentByMe} onDelete={handleDelete} />
                        </div>
                      )}
                    </>
                  )}
            </div>
          </div>

          {formattedTime && (
            <div
              className={cn(
                'flex items-center mt-1 text-xs text-gray-500',
                isSentByMe ? 'justify-end pr-2' : 'justify-start pl-2',
              )}
            >
              <span>{formattedTime}</span>
              {isSentByMe && <div className="ml-2">{statusIcon}</div>}
            </div>
          )}
        </div>

        {/* Sender avatar (right for me) */}
        {isSentByMe && (
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 border-2 border-white shadow-sm flex items-center justify-center text-white text-xs font-semibold self-start mt-1 ml-2 flex-shrink-0">
            {senderInitial}
          </div>
        )}
      </div>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.message.id === nextProps.message.id &&
      prevProps.message.isPending === nextProps.message.isPending &&
      prevProps.message.failed === nextProps.message.failed &&
      prevProps.message.content === nextProps.message.content &&
      prevProps.message.message_type === nextProps.message.message_type &&
      prevProps.message.timestamp === nextProps.message.timestamp &&
      prevProps.onDeleteMessage === nextProps.onDeleteMessage
    );
  },
);

ChatMessage.displayName = 'ChatMessage';
export default ChatMessage;

import React, { useState, useRef, useEffect } from 'react';
import Picker from '@emoji-mart/react';
import data from '@emoji-mart/data';
import { Smile, Paperclip, Send, Image, File, X } from 'lucide-react';

const MessageInput = ({ onSendMessage, onFileSelect: propOnFileSelect }) => {
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [attachedFile, setAttachedFile] = useState(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const [isFocused, setIsFocused] = useState(false);

  // Handle file selection
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAttachedFile({
      file,
      name: file.name,
      type: file.type.startsWith('image/') ? 'image' : 'file',
      size: file.size,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
    });

    if (propOnFileSelect) {
      propOnFileSelect(file);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Remove file attachment
  const removeAttachment = () => {
    if (attachedFile?.preview) {
      URL.revokeObjectURL(attachedFile.preview);
    }
    setAttachedFile(null);
  };

  // Clear input field
  const clearInput = () => {
    setMessage('');
    if (inputRef.current) {
      inputRef.current.textContent = '';
      inputRef.current.innerHTML = '';
    }
  };

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Hide emoji picker on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(e.target) &&
        !e.target.closest('.emoji-trigger')
      ) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle send message
  const handleSubmit = async (e) => {
    e.preventDefault();
    if ((!message.trim() && !attachedFile) || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const messageToSend = attachedFile?.file
        ? { text: message, file: attachedFile.file }
        : message;

      await onSendMessage(messageToSend);

      clearInput();
      removeAttachment();
      inputRef.current?.focus();
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Enter to send, Shift+Enter for newline
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Handle emoji selection
  const handleEmojiSelect = (emoji) => {
    const emojiChar = emoji.native || '';
    const newMessage = message + emojiChar;
    setMessage(newMessage);

    if (inputRef.current) {
      inputRef.current.textContent = newMessage;

      const range = document.createRange();
      const selection = window.getSelection();
      range.selectNodeContents(inputRef.current);
      range.collapse(false);
      selection.removeAllRanges();
      selection.addRange(range);
    }

    setShowEmojiPicker(false);
    inputRef.current?.focus();
  };

  // Handle input change
  const handleInput = (e) => {
    const content = e.currentTarget.textContent || '';
    setMessage(content);
  };

  // Format file size for display
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-3 py-2">
      {attachedFile && (
        <div className="relative mb-2 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg p-2 border border-indigo-100 shadow-sm">
          <button
            type="button"
            onClick={removeAttachment}
            className="absolute -right-1.5 -top-1.5 bg-white rounded-full p-0.5 shadow border border-gray-200 hover:bg-gray-50"
          >
            <X className="w-3.5 h-3.5 text-gray-500 hover:text-rose-500" />
          </button>

          <div className="flex items-center">
            {attachedFile.type === 'image' ? (
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-100 to-blue-100 flex items-center justify-center mr-2 flex-shrink-0">
                <Image className="w-4 h-4 text-indigo-500" />
              </div>
            ) : (
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-100 to-blue-100 flex items-center justify-center mr-2 flex-shrink-0">
                <File className="w-4 h-4 text-indigo-500" />
              </div>
            )}
            <div className="truncate">
              <p className="text-xs font-medium text-gray-900 truncate">{attachedFile.name}</p>
              <p className="text-[10px] text-gray-500 mt-0.5">
                {formatFileSize(attachedFile.size)}
              </p>
            </div>
          </div>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className={`relative bg-gradient-to-r from-white to-gray-50 rounded-xl shadow border transition-all duration-200 ${
          isFocused ? 'border-indigo-300 shadow-indigo-100' : 'border-gray-200'
        }`}
      >
        <div className={`flex items-center relative py-1.5 px-2 ${showEmojiPicker ? 'pb-16' : ''}`}>
          <div className="flex items-center space-x-0.5 mr-1">
            {/* File attachment */}
            <label className="cursor-pointer text-gray-500 hover:text-indigo-600 p-1.5 rounded-full hover:bg-indigo-50">
              <Paperclip className="w-4 h-4" />
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleFileSelect}
                accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.csv,.ppt,.pptx,.zip"
              />
            </label>

            {/* Emoji picker trigger */}
            <button
              type="button"
              className={`emoji-trigger text-gray-500 p-1.5 rounded-full hover:bg-yellow-50 ${
                showEmojiPicker ? 'text-yellow-500 bg-yellow-50' : 'hover:text-yellow-500'
              }`}
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            >
              <Smile className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 min-w-0">
            <div className="relative">
              <div
                ref={inputRef}
                contentEditable
                onInput={handleInput}
                onKeyDown={handleKeyDown}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                suppressContentEditableWarning={true}
                className="max-h-32 min-h-[32px] py-1.5 px-2 bg-transparent w-full focus:outline-none overflow-y-auto resize-none text-gray-700 text-sm empty:before:content-[attr(data-placeholder)] empty:before:text-gray-400"
                data-placeholder="Type a message..."
                style={{
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  lineHeight: '1.4',
                }}
                aria-label="Message"
              />
            </div>
          </div>

          <div className="ml-1">
            {/* Send button */}
            <button
              type="submit"
              disabled={(!message.trim() && !attachedFile) || isSubmitting}
              className={`p-2 rounded-full transition-all ${
                (message.trim() || attachedFile) && !isSubmitting
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:from-indigo-600 hover:to-purple-600'
                  : 'text-gray-400 bg-gray-100 cursor-not-allowed'
              }`}
              aria-label="Send message"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {showEmojiPicker && (
          <div
            ref={emojiPickerRef}
            className="absolute bottom-2 left-0 right-0 z-10 shadow-lg mx-2"
          >
            <div className="bg-white rounded-lg border border-gray-200 shadow overflow-hidden">
              <React.Suspense
                fallback={
                  <div className="bg-blue-50 text-blue-500 p-2 rounded text-sm text-center animate-pulse">
                    Loading...
                  </div>
                }
              >
                <Picker
                  data={data}
                  onEmojiSelect={handleEmojiSelect}
                  theme="light"
                  previewPosition="none"
                  perLine={8}
                  emojiButtonSize={28}
                  skinTonePosition="search"
                  emojiSize={18}
                />
              </React.Suspense>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default MessageInput;

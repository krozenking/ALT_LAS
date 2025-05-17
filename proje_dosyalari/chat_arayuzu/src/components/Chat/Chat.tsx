import { useState, useEffect, useRef } from 'react';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import { Message } from '../../types';
import apiService from '../../services/api.service';
import socketService from '../../services/socket.service';

interface ChatProps {
  userId: string;
  conversationId: string;
}

const Chat = ({ userId, conversationId }: ChatProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [aiTyping, setAiTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Mesajları yükle
  useEffect(() => {
    const loadMessages = async () => {
      try {
        const fetchedMessages = await apiService.getMessages(conversationId);
        setMessages(fetchedMessages);
      } catch (error) {
        console.error('Mesajları yükleme hatası:', error);
      }
    };

    loadMessages();
  }, [conversationId]);

  // WebSocket bağlantısını kur
  useEffect(() => {
    socketService.init();
    socketService.joinConversation(userId, conversationId);

    // Yeni mesaj dinleyicisi
    const handleNewMessage = (message: Message) => {
      if (message.conversationId === conversationId) {
        setMessages(prevMessages => [...prevMessages, message]);
      }
    };

    // AI yazıyor dinleyicisi
    const handleAiTyping = (data: { conversationId: string }) => {
      if (data.conversationId === conversationId) {
        setAiTyping(true);
      }
    };

    // AI yazma bitti dinleyicisi
    const handleAiTypingDone = (data: { conversationId: string }) => {
      if (data.conversationId === conversationId) {
        setAiTyping(false);
      }
    };

    socketService.onNewMessage(handleNewMessage);
    socketService.onAiTyping(handleAiTyping);
    socketService.onAiTypingDone(handleAiTypingDone);

    return () => {
      socketService.removeMessageListener(handleNewMessage);
    };
  }, [userId, conversationId]);

  // Otomatik kaydırma
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Mesaj gönderme işlevi
  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;

    setLoading(true);

    try {
      // WebSocket üzerinden mesaj gönder
      socketService.sendMessage(content, userId, conversationId);
    } catch (error) {
      console.error('Mesaj gönderme hatası:', error);

      // Hata durumunda fallback olarak REST API kullan
      try {
        const result = await apiService.sendMessage(content, userId, conversationId);
        setMessages(prevMessages => [...prevMessages, result.userMessage, result.aiMessage]);
      } catch (apiError) {
        console.error('API mesaj gönderme hatası:', apiError);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen max-h-screen bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
      <div className="p-4 bg-blue-600 dark:bg-blue-800 text-white">
        <h1 className="text-xl font-bold">ALT_LAS Chat</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <MessageList messages={messages} />
        {aiTyping && (
          <div className="flex items-center text-gray-500 dark:text-gray-400 mt-2">
            <div className="flex space-x-1">
              <div className="w-2 h-2 rounded-full bg-gray-500 dark:bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 rounded-full bg-gray-500 dark:bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 rounded-full bg-gray-500 dark:bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
            <span className="ml-2 text-sm">ALT_LAS AI yazıyor...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-gray-200 dark:border-gray-700 p-4">
        <MessageInput onSendMessage={handleSendMessage} loading={loading || aiTyping} />
      </div>
    </div>
  );
};

export default Chat;

import { useState, useEffect } from 'react';
import Chat from './components/Chat/Chat';
import ErrorTest from './components/ErrorTest';
import apiService from './services/api.service';
import { User } from './types';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [conversationId, setConversationId] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const initializeUser = async () => {
      try {
        // Gerçek uygulamada kullanıcı kimlik doğrulaması yapılacak
        // Şimdilik basit bir kullanıcı oluşturuyoruz
        const storedUserId = localStorage.getItem('userId');

        if (storedUserId) {
          try {
            const fetchedUser = await apiService.getUser(storedUserId);
            setUser(fetchedUser);
          } catch (error) {
            console.error('Kullanıcı yüklenirken hata:', error);
            // Kullanıcı bulunamadıysa yeni oluştur
            createNewUser();
          }
        } else {
          createNewUser();
        }
      } catch (error) {
        console.error('Kullanıcı başlatma hatası:', error);
      } finally {
        setLoading(false);
      }
    };

    const createNewUser = async () => {
      try {
        const newUser = await apiService.createUser('Misafir Kullanıcı');
        setUser(newUser);
        localStorage.setItem('userId', newUser.id);
      } catch (error) {
        console.error('Kullanıcı oluşturma hatası:', error);
      }
    };

    const initializeConversation = () => {
      // Gerçek uygulamada konuşma yönetimi yapılacak
      // Şimdilik basit bir konuşma ID'si oluşturuyoruz
      const storedConversationId = localStorage.getItem('conversationId');

      if (storedConversationId) {
        setConversationId(storedConversationId);
      } else {
        const newConversationId = `conv_${Date.now()}`;
        setConversationId(newConversationId);
        localStorage.setItem('conversationId', newConversationId);
      }
    };

    initializeUser();
    initializeConversation();
  }, []);

  // Kullanıcı ve konuşma ID'si hazır olduğunda, konuşmayı kullanıcıya ekle
  useEffect(() => {
    const addConversationToUser = async () => {
      if (user && conversationId) {
        try {
          await apiService.addConversation(user.id, conversationId);
        } catch (error) {
          console.error('Konuşma ekleme hatası:', error);
        }
      }
    };

    addConversationToUser();
  }, [user, conversationId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
      <div className="container mx-auto max-w-4xl">
        {/* Hata test paneli */}
        <div className="mb-4">
          <ErrorTest />
        </div>

        {user && conversationId ? (
          <Chat userId={user.id} conversationId={conversationId} />
        ) : (
          <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow">
            <p className="text-red-500">Kullanıcı veya konuşma başlatılamadı. Lütfen sayfayı yenileyin.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;

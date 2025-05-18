// ALT_LAS Chat Arayüzü JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // DOM elementlerini seçme
    const chatForm = document.getElementById('chat-form');
    const messageInput = document.getElementById('message-input');
    const chatMessages = document.getElementById('chat-messages');
    const uploadButton = document.getElementById('upload-button');
    const fileUpload = document.getElementById('file-upload');
    const aiModelSelect = document.getElementById('ai-model');
    
    // Mesaj geçmişi
    let messageHistory = [];
    
    // Mesaj gönderme işlevi
    function sendMessage(e) {
        e.preventDefault();
        
        const message = messageInput.value.trim();
        if (!message) return;
        
        // Kullanıcı mesajını ekle
        addMessage(message, 'user');
        
        // Mesaj geçmişine ekle
        messageHistory.push({
            role: 'user',
            content: message
        });
        
        // Input alanını temizle
        messageInput.value = '';
        
        // Mesaj gönderiliyor göstergesi
        const typingIndicator = document.createElement('div');
        typingIndicator.className = 'message ai typing';
        typingIndicator.innerHTML = `
            <div class="message-content">
                <p>Yanıt yazılıyor...</p>
            </div>
        `;
        chatMessages.appendChild(typingIndicator);
        
        // Otomatik scroll
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        // AI yanıtını simüle et (gerçek uygulamada API çağrısı yapılacak)
        setTimeout(() => {
            // Typing göstergesini kaldır
            chatMessages.removeChild(typingIndicator);
            
            // AI yanıtını ekle
            const aiResponse = generateAIResponse(message);
            addMessage(aiResponse, 'ai');
            
            // Mesaj geçmişine ekle
            messageHistory.push({
                role: 'assistant',
                content: aiResponse
            });
            
            // Otomatik scroll
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }, 1000);
    }
    
    // Mesaj ekleme işlevi
    function addMessage(message, sender) {
        const messageElement = document.createElement('div');
        messageElement.className = `message ${sender}`;
        
        // Markdown formatlamasını işle
        const formattedMessage = formatMessage(message);
        
        messageElement.innerHTML = `
            <div class="message-content">
                ${formattedMessage}
            </div>
        `;
        
        chatMessages.appendChild(messageElement);
    }
    
    // Basit markdown formatlaması
    function formatMessage(text) {
        // Kod bloklarını formatla
        text = text.replace(/```([^`]+)```/g, '<pre>$1</pre>');
        
        // Inline kod formatlaması
        text = text.replace(/`([^`]+)`/g, '<code>$1</code>');
        
        // Bağlantıları formatla
        text = text.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank">$1</a>');
        
        // Satır sonlarını formatla
        text = text.replace(/\n/g, '<br>');
        
        // Paragrafları formatla
        const paragraphs = text.split('<br><br>');
        return paragraphs.map(p => `<p>${p}</p>`).join('');
    }
    
    // Basit AI yanıt simülasyonu (gerçek uygulamada API çağrısı yapılacak)
    function generateAIResponse(message) {
        const responses = [
            "Mesajınızı aldım. Size nasıl yardımcı olabilirim?",
            "Bu konu hakkında daha fazla bilgi verebilir misiniz?",
            "Anladım, şimdi bu konuyu araştırıyorum.",
            "İlginç bir soru. Bunu şöyle açıklayabilirim...",
            "Bu sorunun çözümü için şunları deneyebilirsiniz...",
            "Bu konuda size yardımcı olmaktan memnuniyet duyarım.",
            "Sorunuzu analiz ediyorum, bir dakika lütfen."
        ];
        
        // Basit kod örneği yanıtı
        if (message.toLowerCase().includes('kod') || message.toLowerCase().includes('örnek')) {
            return "İşte basit bir JavaScript örneği:\n\n```\nfunction hello() {\n  console.log('Merhaba Dünya!');\n}\n\nhello();\n```\n\nBu kodu tarayıcı konsolunda çalıştırabilirsiniz.";
        }
        
        // Basit bağlantı yanıtı
        if (message.toLowerCase().includes('link') || message.toLowerCase().includes('site')) {
            return "Bu konuda daha fazla bilgi için şu bağlantıyı inceleyebilirsiniz: https://example.com/bilgi";
        }
        
        // Rastgele yanıt seç
        return responses[Math.floor(Math.random() * responses.length)];
    }
    
    // Textarea otomatik yükseklik ayarı
    function autoResizeTextarea() {
        messageInput.style.height = 'auto';
        messageInput.style.height = (messageInput.scrollHeight) + 'px';
    }
    
    // Dosya yükleme işlevi
    function handleFileUpload() {
        fileUpload.click();
    }
    
    // Dosya seçildiğinde
    function fileSelected() {
        const file = fileUpload.files[0];
        if (!file) return;
        
        // Dosya bilgisini mesaj olarak ekle
        addMessage(`Dosya yüklendi: ${file.name} (${formatFileSize(file.size)})`, 'user');
        
        // Mesaj geçmişine ekle
        messageHistory.push({
            role: 'user',
            content: `[Dosya yüklendi: ${file.name}]`
        });
        
        // Dosya türüne göre önizleme
        if (file.type.startsWith('image/')) {
            previewImage(file);
        }
        
        // Otomatik scroll
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    // Dosya boyutu formatla
    function formatFileSize(bytes) {
        if (bytes < 1024) return bytes + ' B';
        else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
        else return (bytes / 1048576).toFixed(1) + ' MB';
    }
    
    // Resim önizleme
    function previewImage(file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const lastMessage = chatMessages.lastElementChild;
            const messageContent = lastMessage.querySelector('.message-content');
            
            const img = document.createElement('img');
            img.src = e.target.result;
            img.alt = file.name;
            messageContent.appendChild(img);
            
            // Otomatik scroll
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
        reader.readAsDataURL(file);
    }
    
    // Event listeners
    chatForm.addEventListener('submit', sendMessage);
    messageInput.addEventListener('input', autoResizeTextarea);
    uploadButton.addEventListener('click', handleFileUpload);
    fileUpload.addEventListener('change', fileSelected);
    
    // Enter tuşu ile gönderme, Shift+Enter ile yeni satır
    messageInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            chatForm.dispatchEvent(new Event('submit'));
        }
    });
    
    // AI model değiştiğinde
    aiModelSelect.addEventListener('change', function() {
        // Gerçek uygulamada burada model değişikliği işlenecek
        const selectedModel = aiModelSelect.value;
        addMessage(`AI modeli değiştirildi: ${aiModelSelect.options[aiModelSelect.selectedIndex].text}`, 'system');
    });
    
    // Sayfa yüklendiğinde hoş geldin mesajı
    setTimeout(() => {
        addMessage("Merhaba! Ben ALT_LAS Chat asistanı. Size nasıl yardımcı olabilirim?", 'ai');
        messageHistory.push({
            role: 'assistant',
            content: "Merhaba! Ben ALT_LAS Chat asistanı. Size nasıl yardımcı olabilirim?"
        });
    }, 500);
});

// ALT_LAS Chat Arayüzü JavaScript - AI Entegrasyonlu

// AI Entegrasyon modülünü içe aktar
const aiIntegration = require('./ai-integration.js');

document.addEventListener('DOMContentLoaded', async function() {
    // DOM elementlerini seçme
    const chatForm = document.getElementById('chat-form');
    const messageInput = document.getElementById('message-input');
    const chatMessages = document.getElementById('chat-messages');
    const uploadButton = document.getElementById('upload-button');
    const fileUpload = document.getElementById('file-upload');
    const aiModelSelect = document.getElementById('ai-model');
    
    // Mesaj geçmişi
    let messageHistory = [];
    
    // AI Entegrasyonunu başlat
    let aiInitialized = false;
    
    try {
        // AI Entegrasyonunu başlat
        aiInitialized = await aiIntegration.initializeAI({
            // Varsayılan yapılandırma
            models: [
                {
                    id: 'openai-gpt4',
                    type: 'openai',
                    modelName: 'gpt-4',
                    apiKey: process.env.OPENAI_API_KEY || 'sim_api_key',
                    systemMessage: 'Sen ALT_LAS projesinin yardımcı asistanısın.'
                },
                {
                    id: 'openai-gpt35',
                    type: 'openai',
                    modelName: 'gpt-3.5-turbo',
                    apiKey: process.env.OPENAI_API_KEY || 'sim_api_key',
                    systemMessage: 'Sen ALT_LAS projesinin yardımcı asistanısın.'
                }
            ],
            defaultModel: 'openai-gpt4',
            parallelQueryEnabled: true
        });
        
        if (aiInitialized) {
            console.log('AI Entegrasyon başarıyla başlatıldı');
            
            // Model seçim listesini güncelle
            updateModelSelector();
        } else {
            console.error('AI Entegrasyon başlatılamadı');
            addMessage('AI Entegrasyon başlatılamadı. Simülasyon modunda çalışılıyor.', 'system');
        }
    } catch (error) {
        console.error('AI Entegrasyon başlatılırken hata oluştu:', error);
        addMessage('AI Entegrasyon başlatılamadı. Simülasyon modunda çalışılıyor.', 'system');
    }
    
    // Model seçim listesini güncelle
    function updateModelSelector() {
        // Mevcut modelleri al
        const models = aiIntegration.getAvailableAIModels();
        const activeModel = aiIntegration.getActiveAIModel();
        
        // Select elementini temizle
        aiModelSelect.innerHTML = '';
        
        // Varsayılan seçenek
        const defaultOption = document.createElement('option');
        defaultOption.value = 'default';
        defaultOption.textContent = 'Varsayılan Model';
        aiModelSelect.appendChild(defaultOption);
        
        // Modelleri ekle
        models.forEach(model => {
            const option = document.createElement('option');
            option.value = model.id;
            option.textContent = `${model.name} (${model.version || 'v1'})`;
            
            // Aktif model ise seçili yap
            if (activeModel && model.id === activeModel.id) {
                option.selected = true;
            }
            
            // Hazır değilse devre dışı bırak
            if (!model.ready) {
                option.disabled = true;
                option.textContent += ' (Hazır Değil)';
            }
            
            aiModelSelect.appendChild(option);
        });
    }
    
    // Mesaj gönderme işlevi
    async function sendMessage(e) {
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
        
        try {
            let aiResponse;
            
            // AI Entegrasyon başlatıldıysa gerçek sorgu yap
            if (aiInitialized) {
                // Aktif model bilgisini al
                const activeModel = aiIntegration.getActiveAIModel();
                
                // Paralel sorgu mu yapılacak?
                const isParallelQuery = aiModelSelect.value === 'parallel';
                
                if (isParallelQuery) {
                    // Birden fazla modele paralel sorgu gönder
                    const models = aiIntegration.getAvailableAIModels();
                    const modelIds = models.filter(m => m.ready).map(m => m.id);
                    
                    const parallelResponse = await aiIntegration.parallelQueryAI(message, messageHistory, modelIds);
                    
                    // Typing göstergesini kaldır
                    chatMessages.removeChild(typingIndicator);
                    
                    // Karşılaştırma sonuçlarını göster
                    addMessage(`Paralel sorgu sonuçları (${modelIds.length} model):`, 'system');
                    
                    // Her model yanıtını ekle
                    for (const modelId in parallelResponse.responses) {
                        const response = parallelResponse.responses[modelId];
                        const model = models.find(m => m.id === modelId);
                        
                        if (response.error) {
                            addMessage(`${model.name}: Hata - ${response.error}`, 'system');
                        } else {
                            addMessage(`${model.name} yanıtı:`, 'system');
                            addMessage(response.content, 'ai');
                            
                            // En iyi yanıtı vurgulamak için
                            if (parallelResponse.comparison.winner === modelId) {
                                addMessage(`Bu yanıt, ${parallelResponse.comparison.scores[modelId].score}/100 puanla en iyi yanıt olarak değerlendirildi.`, 'system');
                            }
                        }
                    }
                    
                    // En iyi yanıtı mesaj geçmişine ekle
                    const winnerId = parallelResponse.comparison.winner;
                    if (winnerId && parallelResponse.responses[winnerId]) {
                        messageHistory.push({
                            role: 'assistant',
                            content: parallelResponse.responses[winnerId].content
                        });
                    }
                } else {
                    // Tek modele sorgu gönder
                    const response = await aiIntegration.queryAI(message, messageHistory);
                    
                    // Typing göstergesini kaldır
                    chatMessages.removeChild(typingIndicator);
                    
                    // AI yanıtını ekle
                    addMessage(response.content, 'ai');
                    
                    // Mesaj geçmişine ekle
                    messageHistory.push({
                        role: 'assistant',
                        content: response.content
                    });
                }
            } else {
                // Simülasyon modunda çalış
                setTimeout(() => {
                    // Typing göstergesini kaldır
                    chatMessages.removeChild(typingIndicator);
                    
                    // Simüle edilmiş AI yanıtını ekle
                    aiResponse = generateSimulatedResponse(message);
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
        } catch (error) {
            console.error('AI yanıtı alınırken hata oluştu:', error);
            
            // Typing göstergesini kaldır
            chatMessages.removeChild(typingIndicator);
            
            // Hata mesajını göster
            addMessage(`Üzgünüm, bir hata oluştu: ${error.message}`, 'system');
        }
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
        
        // Otomatik scroll
        chatMessages.scrollTop = chatMessages.scrollHeight;
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
    
    // Basit AI yanıt simülasyonu (AI Entegrasyon çalışmadığında)
    function generateSimulatedResponse(message) {
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
        const selectedModel = aiModelSelect.value;
        
        // Paralel sorgu seçeneği
        if (selectedModel === 'parallel') {
            addMessage('Paralel sorgu modu aktif. Sonraki mesajınız tüm aktif modellere gönderilecek.', 'system');
            return;
        }
        
        // Varsayılan model seçeneği
        if (selectedModel === 'default') {
            addMessage('Varsayılan model seçildi.', 'system');
            return;
        }
        
        // AI Entegrasyon başlatıldıysa modeli değiştir
        if (aiInitialized) {
            try {
                const success = aiIntegration.changeAIModel(selectedModel);
                
                if (success) {
                    const activeModel = aiIntegration.getActiveAIModel();
                    addMessage(`AI modeli değiştirildi: ${activeModel.name}`, 'system');
                } else {
                    addMessage(`AI modeli değiştirilemedi: ${selectedModel}`, 'system');
                }
            } catch (error) {
                console.error('AI modeli değiştirilirken hata oluştu:', error);
                addMessage(`AI modeli değiştirilemedi: ${error.message}`, 'system');
            }
        } else {
            addMessage(`AI modeli değiştirildi: ${aiModelSelect.options[aiModelSelect.selectedIndex].text}`, 'system');
        }
    });
    
    // Paralel sorgu seçeneğini ekle
    function addParallelQueryOption() {
        const option = document.createElement('option');
        option.value = 'parallel';
        option.textContent = 'Paralel Sorgu (Tüm Modeller)';
        aiModelSelect.appendChild(option);
    }
    
    // Sayfa yüklendiğinde hoş geldin mesajı
    setTimeout(() => {
        addMessage("Merhaba! Ben ALT_LAS Chat asistanı. Size nasıl yardımcı olabilirim?", 'ai');
        messageHistory.push({
            role: 'assistant',
            content: "Merhaba! Ben ALT_LAS Chat asistanı. Size nasıl yardımcı olabilirim?"
        });
        
        // Paralel sorgu seçeneğini ekle
        if (aiInitialized) {
            addParallelQueryOption();
        }
    }, 500);
});

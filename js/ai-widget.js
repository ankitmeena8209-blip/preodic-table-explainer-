(function() {
    // Inject Markdown and Purify dependencies
    const loadScript = (src) => new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) return resolve();
        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });

    // Ensure FontAwesome or Material Symbols is loaded (FRZI Labs already has Material Symbols)
    
    Promise.all([
        loadScript("https://cdn.jsdelivr.net/npm/marked/marked.min.js"),
        loadScript("https://cdnjs.cloudflare.com/ajax/libs/dompurify/3.0.6/purify.min.js")
    ]).then(initWidget).catch(e => console.error("Failed to load AI widget dependencies.", e));

    function initWidget() {
        // Configure Marked for code highlighting
        marked.setOptions({
            breaks: true,
            gfm: true
        });

        // Add CSS styles for the widget
        const style = document.createElement('style');
        style.textContent = `
            #frzi-ai-button {
                position: fixed;
                bottom: 2rem;
                right: 2rem;
                width: 60px;
                height: 60px;
                border-radius: 50%;
                background: linear-gradient(135deg, rgba(var(--color-primary-rgb, 14, 165, 233), 0.9), rgba(var(--color-secondary-rgb, 139, 92, 246), 0.9));
                backdrop-filter: blur(12px);
                border: 1px solid rgba(255, 255, 255, 0.1);
                box-shadow: 0 8px 32px rgba(var(--color-primary-rgb, 14, 165, 233), 0.3);
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                z-index: 9999;
                transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.3s ease;
                animation: frziFloat 3s ease-in-out infinite;
                color: white;
            }
            #frzi-ai-button:hover {
                transform: scale(1.1) translateY(-5px);
                box-shadow: 0 12px 40px rgba(var(--color-primary-rgb, 14, 165, 233), 0.5);
                animation-play-state: paused;
            }
            @keyframes frziFloat {
                0% { transform: translateY(0); }
                50% { transform: translateY(-10px); }
                100% { transform: translateY(0); }
            }

            #frzi-ai-window {
                position: fixed;
                bottom: 6rem;
                right: 2rem;
                width: 380px;
                max-width: calc(100vw - 4rem);
                height: 600px;
                max-height: calc(100vh - 8rem);
                background: rgba(15, 23, 42, 0.75);
                backdrop-filter: blur(24px);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 1.5rem;
                box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.5), 0 0 40px rgba(14, 165, 233, 0.1);
                display: flex;
                flex-col;
                z-index: 9998;
                opacity: 0;
                transform: translateY(20px) scale(0.95);
                pointer-events: none;
                transition: opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1), transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
                flex-direction: column;
                overflow: hidden;
            }
            #frzi-ai-window.ai-open {
                opacity: 1;
                transform: translateY(0) scale(1);
                pointer-events: auto;
            }

            .ai-header {
                padding: 1.25rem;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                display: flex;
                align-items: center;
                justify-content: space-between;
                background: rgba(255,255,255,0.03);
            }
            .ai-header-title {
                display: flex;
                align-items: center;
                gap: 0.75rem;
                color: #e2e8f0;
                font-family: 'Outfit', sans-serif;
                font-weight: 600;
                font-size: 1.1rem;
            }
            .ai-header-actions button {
                background: none;
                border: none;
                color: #94a3b8;
                cursor: pointer;
                padding: 0.25rem;
                border-radius: 0.375rem;
                transition: all 0.2s;
                display: inline-flex;
            }
            .ai-header-actions button:hover {
                color: #f8fafc;
                background: rgba(255,255,255,0.1);
            }

            .ai-messages {
                flex: 1;
                overflow-y: auto;
                padding: 1.25rem;
                display: flex;
                flex-direction: column;
                gap: 1rem;
                scroll-behavior: smooth;
            }
            .ai-messages::-webkit-scrollbar { width: 6px; }
            .ai-messages::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 3px; }

            .ai-msg {
                max-width: 85%;
                padding: 0.75rem 1rem;
                border-radius: 1rem;
                font-family: 'Inter', sans-serif;
                font-size: 0.9rem;
                line-height: 1.5;
                color: #e2e8f0;
                animation: slideIn 0.3s ease-out forwards;
                word-wrap: break-word;
            }
            @keyframes slideIn {
                from { opacity: 0; transform: translateY(10px); }
                to { opacity: 1; transform: translateY(0); }
            }
            .ai-msg-user {
                align-self: flex-end;
                background: rgba(14, 165, 233, 0.2);
                border: 1px solid rgba(14, 165, 233, 0.3);
                border-bottom-right-radius: 0.25rem;
            }
            .ai-msg-bot {
                align-self: flex-start;
                background: rgba(255, 255, 255, 0.05);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-bottom-left-radius: 0.25rem;
            }
            .ai-msg-bot p { margin-bottom: 0.5rem; }
            .ai-msg-bot p:last-child { margin-bottom: 0; }
            .ai-msg-bot pre {
                background: #0f172a;
                padding: 0.75rem;
                border-radius: 0.5rem;
                overflow-x: auto;
                margin: 0.5rem 0;
                position: relative;
            }
            .ai-msg-bot code {
                font-family: 'Fira Code', monospace;
                font-size: 0.85em;
                color: #38bdf8;
            }
            .ai-msg-bot pre code { color: #e2e8f0; }

            .ai-input-area {
                padding: 1.25rem;
                border-top: 1px solid rgba(255, 255, 255, 0.1);
                background: rgba(0,0,0,0.2);
                display: flex;
                gap: 0.5rem;
            }
            .ai-textarea {
                flex: 1;
                background: rgba(255,255,255,0.05);
                border: 1px solid rgba(255,255,255,0.1);
                border-radius: 1.5rem;
                padding: 0.75rem 1rem;
                color: #e2e8f0;
                font-family: 'Inter', sans-serif;
                font-size: 0.9rem;
                resize: none;
                outline: none;
                max-height: 120px;
                min-height: 44px;
                transition: border-color 0.3s;
                overflow-y: hidden;
            }
            .ai-textarea:focus { border-color: rgba(14, 165, 233, 0.5); }
            .ai-textarea::placeholder { color: #64748b; }
            
            .ai-send-btn {
                background: linear-gradient(135deg, #0ea5e9, #8b5cf6);
                border: none;
                border-radius: 50%;
                width: 44px;
                height: 44px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                cursor: pointer;
                transition: transform 0.2s, opacity 0.2s;
                align-self: flex-end;
            }
            .ai-send-btn:hover { transform: scale(1.05); }
            .ai-send-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
            .ai-send-btn:disabled i { opacity: 0.5; }

            .ai-typing {
                display: flex;
                gap: 0.25rem;
                padding: 0.5rem 0;
            }
            .ai-dot {
                width: 6px;
                height: 6px;
                background: #94a3b8;
                border-radius: 50%;
                animation: aiPulse 1.4s infinite ease-in-out both;
            }
            .ai-dot:nth-child(1) { animation-delay: -0.32s; }
            .ai-dot:nth-child(2) { animation-delay: -0.16s; }
            @keyframes aiPulse {
                0%, 80%, 100% { transform: scale(0); }
                40% { transform: scale(1); }
            }
        `;
        document.head.appendChild(style);

        // Build DOM
        const button = document.createElement('div');
        button.id = 'frzi-ai-button';
        button.innerHTML = `<span class="material-symbols-outlined" style="font-size: 28px;">auto_awesome</span>`;
        document.body.appendChild(button);

        const windowEl = document.createElement('div');
        windowEl.id = 'frzi-ai-window';
        windowEl.innerHTML = `
            <div class="ai-header">
                <div class="ai-header-title">
                    <span class="material-symbols-outlined text-primary">auto_awesome</span>
                    FRZI Assistant
                </div>
                <div class="ai-header-actions">
                    <button id="frzi-ai-clear" title="Clear Chat"><span class="material-symbols-outlined" style="font-size:20px;">delete</span></button>
                    <button id="frzi-ai-close" title="Close"><span class="material-symbols-outlined" style="font-size:20px;">close</span></button>
                </div>
            </div>
            <div class="ai-messages" id="frzi-ai-messages"></div>
            <div class="ai-input-area">
                <textarea class="ai-textarea" id="frzi-ai-input" placeholder="Ask about elements, chemistry..." rows="1"></textarea>
                <button class="ai-send-btn" id="frzi-ai-send">
                    <span class="material-symbols-outlined" style="font-size:20px;">send</span>
                </button>
            </div>
        `;
        document.body.appendChild(windowEl);

        const msgContainer = document.getElementById('frzi-ai-messages');
        const inputEl = document.getElementById('frzi-ai-input');
        const sendBtn = document.getElementById('frzi-ai-send');
        let sessionMessages = JSON.parse(sessionStorage.getItem('frzi_ai_history') || '[]');
        let isWaiting = false;

        // Auto resize textarea
        inputEl.addEventListener('input', function() {
            this.style.height = '44px';
            this.style.height = (this.scrollHeight) + 'px';
        });

        // Toggle window
        button.addEventListener('click', () => {
            const isOpen = windowEl.classList.toggle('ai-open');
            if (isOpen) {
                inputEl.focus();
                scrollToBottom();
            }
        });

        document.getElementById('frzi-ai-close').addEventListener('click', () => {
            windowEl.classList.remove('ai-open');
        });

        document.getElementById('frzi-ai-clear').addEventListener('click', () => {
            sessionMessages = [];
            sessionStorage.removeItem('frzi_ai_history');
            msgContainer.innerHTML = '';
            addMessage('bot', 'Chat history cleared. How can I help you today?');
        });

        // Handle Enter vs Shift+Enter
        inputEl.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });

        sendBtn.addEventListener('click', sendMessage);

        // Initial setup
        if (sessionMessages.length === 0) {
            addMessage('bot', 'Hello! I am the FRZI Labs AI. Ask me anything about the Periodic Table, elements, or chemistry!');
        } else {
            sessionMessages.forEach(msg => {
                if (msg.role !== 'system') {
                    renderMessage(msg.role === 'user' ? 'user' : 'bot', msg.content);
                }
            });
            scrollToBottom();
        }

        function scrollToBottom() {
            setTimeout(() => {
                msgContainer.scrollTop = msgContainer.scrollHeight;
            }, 50);
        }

        function renderMessage(role, content) {
            const div = document.createElement('div');
            div.className = `ai-msg ai-msg-${role}`;
            if (role === 'bot') {
                const rawHTML = marked.parse(content);
                div.innerHTML = DOMPurify.sanitize(rawHTML);
            } else {
                div.textContent = content; // pure text for user
            }
            msgContainer.appendChild(div);
            scrollToBottom();
            return div;
        }

        function addMessage(role, content) {
            renderMessage(role, content);
            if(role !== 'bot' || content !== '...') {
                sessionMessages.push({ role: role === 'user' ? 'user' : 'assistant', content });
                sessionStorage.setItem('frzi_ai_history', JSON.stringify(sessionMessages));
            }
        }

        function getContextElement() {
            const hash = window.location.hash;
            if (hash.startsWith("#element-") || hash.startsWith("#element/")) {
                const idStr = hash.replace("#element-", "").replace("#element/", "");
                // Try to find the name if ELEMENTS_DATA is available (FRZI Labs global)
                if (window.ELEMENTS_DATA) {
                    const el = window.ELEMENTS_DATA.find(e => e.atomicNumber.toString() === idStr || e.symbol.toLowerCase() === idStr.toLowerCase() || e.name.toLowerCase() === idStr.toLowerCase());
                    if (el) return el.name;
                }
            }
            return null;
        }

        async function sendMessage() {
            const text = inputEl.value.trim();
            if (!text || isWaiting) return;

            inputEl.value = '';
            inputEl.style.height = '44px';
            addMessage('user', text);

            isWaiting = true;
            sendBtn.disabled = true;
            inputEl.disabled = true;

            // Typing indicator
            const typingDiv = document.createElement('div');
            typingDiv.className = 'ai-msg ai-msg-bot';
            typingDiv.innerHTML = '<div class="ai-typing"><div class="ai-dot"></div><div class="ai-dot"></div><div class="ai-dot"></div></div>';
            msgContainer.appendChild(typingDiv);
            scrollToBottom();

            try {
                // Prepare API messages
                // We send a subset of history to save tokens
                const apiMessages = sessionMessages.slice(-10);

                const response = await fetch('/api/ai', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        messages: apiMessages,
                        contextElement: getContextElement()
                    })
                });

                if (!response.ok) throw new Error("API Network Error");

                msgContainer.removeChild(typingDiv);
                
                // Read Stream
                const reader = response.body.getReader();
                const decoder = new TextDecoder('utf-8');
                let botMsgContent = "";
                const botMsgDiv = renderMessage('bot', ""); // empty start

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    
                    const chunk = decoder.decode(value, { stream: true });
                    const lines = chunk.split('\\n');
                    for (const line of lines) {
                        if (line.startsWith('data: ')) {
                            const dataStr = line.slice(6);
                            if (dataStr === '[DONE]') continue;
                            try {
                                const data = JSON.parse(dataStr);
                                if (data.error) {
                                    botMsgContent += "\\n*Error: " + data.error + "*";
                                } else if (data.choices && data.choices[0].delta && data.choices[0].delta.content) {
                                    botMsgContent += data.choices[0].delta.content;
                                }
                            } catch (e) {}
                        }
                    }
                    botMsgDiv.innerHTML = DOMPurify.sanitize(marked.parse(botMsgContent));
                    scrollToBottom();
                }

                sessionMessages.push({ role: 'assistant', content: botMsgContent });
                sessionStorage.setItem('frzi_ai_history', JSON.stringify(sessionMessages));

            } catch (error) {
                msgContainer.removeChild(typingDiv);
                addMessage('bot', "*Sorry, I encountered an error connecting to the FRZI Labs backend. Please try again later.*");
            } finally {
                isWaiting = false;
                sendBtn.disabled = false;
                inputEl.disabled = false;
                inputEl.focus();
            }
        }
    }
})();

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
                width: 420px;
                max-width: calc(100vw - 2rem);
                height: 650px;
                max-height: calc(100vh - 8rem);
                background: rgba(15, 23, 42, 0.85);
                backdrop-filter: blur(24px);
                border: 1px solid rgba(255, 255, 255, 0.15);
                border-radius: 1.5rem;
                box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.5), 0 0 40px rgba(14, 165, 233, 0.1);
                display: flex;
                flex-direction: column;
                z-index: 9998;
                opacity: 0;
                transform: translateY(20px) scale(0.95);
                pointer-events: none;
                transition: opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1), transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
                overflow: hidden;
            }
            @media (max-width: 640px) {
                #frzi-ai-window {
                    bottom: 0;
                    right: 0;
                    width: 100vw;
                    max-width: 100vw;
                    height: 100vh;
                    max-height: 100vh;
                    border-radius: 0;
                }
                #frzi-ai-button {
                    bottom: 1rem;
                    right: 1rem;
                }
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
                font-size: 1.25rem;
            }
            .ai-header-actions button {
                background: none;
                border: none;
                color: #94a3b8;
                cursor: pointer;
                padding: 0.5rem;
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
                padding: 1.5rem;
                display: flex;
                flex-direction: column;
                gap: 1.5rem;
                scroll-behavior: smooth;
            }
            .ai-messages::-webkit-scrollbar { width: 6px; }
            .ai-messages::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 3px; }

            .ai-msg {
                max-width: 90%;
                padding: 1rem 1.25rem;
                border-radius: 1.25rem;
                font-family: 'Inter', sans-serif;
                font-size: 1.05rem;
                line-height: 1.6;
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
                background: rgba(14, 165, 233, 0.25);
                border: 1px solid rgba(14, 165, 233, 0.3);
                border-bottom-right-radius: 0.25rem;
            }
            .ai-msg-bot {
                align-self: flex-start;
                background: rgba(255, 255, 255, 0.05);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-bottom-left-radius: 0.25rem;
                max-width: 100%;
            }
            .ai-msg-bot p { margin-bottom: 0.75rem; }
            .ai-msg-bot p:last-child { margin-bottom: 0; }
            
            /* UI Card for Element Output */
            .element-card {
                background: rgba(255, 255, 255, 0.03);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 1rem;
                padding: 1.25rem;
                margin-top: 0.5rem;
                display: flex;
                flex-direction: column;
                gap: 1rem;
                width: 100%;
            }
            .ec-title {
                font-size: 1.5rem;
                font-weight: 700;
                color: #38bdf8;
                border-bottom: 1px solid rgba(255,255,255,0.1);
                padding-bottom: 0.5rem;
            }
            .ec-summary {
                font-size: 1.1rem;
                font-style: italic;
                color: #cbd5e1;
            }
            .ec-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
                gap: 0.75rem;
            }
            .ec-stat {
                background: rgba(0,0,0,0.2);
                padding: 0.75rem;
                border-radius: 0.5rem;
                display: flex;
                flex-direction: column;
            }
            .ec-stat-label {
                font-size: 0.8rem;
                text-transform: uppercase;
                color: #94a3b8;
                letter-spacing: 0.05em;
            }
            .ec-stat-val {
                font-size: 1rem;
                font-weight: 600;
                color: #f8fafc;
            }
            .ec-section-title {
                font-size: 1.1rem;
                font-weight: 600;
                color: #e2e8f0;
                margin-top: 0.5rem;
                border-bottom: 1px solid rgba(255,255,255,0.1);
                padding-bottom: 0.25rem;
            }
            .ec-text {
                font-size: 1rem;
                color: #cbd5e1;
            }

            .ai-input-area {
                padding: 1.25rem;
                border-top: 1px solid rgba(255, 255, 255, 0.1);
                background: rgba(0,0,0,0.3);
                display: flex;
                gap: 0.75rem;
                align-items: flex-end;
            }
            .ai-textarea {
                flex: 1;
                background: rgba(255,255,255,0.05);
                border: 1px solid rgba(255,255,255,0.1);
                border-radius: 1.25rem;
                padding: 0.85rem 1.25rem;
                color: #e2e8f0;
                font-family: 'Inter', sans-serif;
                font-size: 1.05rem;
                resize: none;
                outline: none;
                max-height: 150px;
                min-height: 52px;
                transition: border-color 0.3s;
                overflow-y: hidden;
            }
            .ai-textarea:focus { border-color: rgba(14, 165, 233, 0.6); background: rgba(255,255,255,0.08); }
            .ai-textarea::placeholder { color: #64748b; }
            
            .ai-send-btn {
                background: linear-gradient(135deg, #0ea5e9, #8b5cf6);
                border: none;
                border-radius: 50%;
                width: 52px;
                height: 52px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                cursor: pointer;
                transition: transform 0.2s, opacity 0.2s, box-shadow 0.2s;
                box-shadow: 0 4px 12px rgba(14, 165, 233, 0.3);
            }
            .ai-send-btn:hover { transform: scale(1.05); box-shadow: 0 6px 16px rgba(14, 165, 233, 0.5); }
            .ai-send-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; box-shadow: none; }

            .ai-typing {
                display: flex;
                gap: 0.35rem;
                padding: 0.5rem 0.25rem;
            }
            .ai-dot {
                width: 8px;
                height: 8px;
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
            
            .ai-local-badge {
                display: inline-flex;
                align-items: center;
                gap: 4px;
                font-size: 0.75rem;
                color: #10b981;
                background: rgba(16, 185, 129, 0.1);
                padding: 2px 8px;
                border-radius: 12px;
                margin-bottom: 8px;
                font-weight: 600;
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

        // Custom parser to convert the custom AI format to a clean HTML card
        function parseToCard(content) {
            // Strip any markdown the AI might have sneaked in
            let safeContent = content.replace(/\\*\\*/g, '').replace(/## /g, '').replace(/```/g, '');
            
            if (!safeContent.includes('[ELEMENT_CARD]')) {
                // Return plain text safely
                return safeContent.replace(/\\n/g, '<br/>');
            }

            // Parse the fields out of the custom format
            let html = '<div class="element-card">';
            
            const extract = (key) => {
                const regex = new RegExp(`${key}:\\s*([\\s\\S]*?)(?=(?:\\n[A-Z]+:|\\[END_CARD\\]|$))`, 'i');
                const match = safeContent.match(regex);
                return match ? match[1].trim() : '';
            };

            const name = extract('NAME');
            const summary = extract('SUMMARY');
            const facts = extract('FACTS');
            const desc = extract('DESCRIPTION');
            const physical = extract('PHYSICAL');
            const chemical = extract('CHEMICAL');
            const uses = extract('USES');
            const interesting = extract('INTERESTING');
            const safety = extract('SAFETY');

            if (name) html += `<div class="ec-title">${name}</div>`;
            if (summary) html += `<div class="ec-summary">${summary}</div>`;
            
            if (facts) {
                html += '<div class="ec-grid">';
                const factPairs = facts.split(',').map(f => f.trim());
                factPairs.forEach(pair => {
                    const [k, v] = pair.split(':').map(s => s ? s.trim() : '');
                    if (k && v) {
                        html += `<div class="ec-stat"><span class="ec-stat-label">${k}</span><span class="ec-stat-val">${v}</span></div>`;
                    }
                });
                html += '</div>';
            }

            const addSection = (title, text) => {
                if (text) {
                    html += `<div class="ec-section-title">${title}</div><div class="ec-text">${text.replace(/\\n/g, '<br/>')}</div>`;
                }
            };

            addSection('Description', desc);
            addSection('Physical Properties', physical);
            addSection('Chemical Properties', chemical);
            addSection('Uses', uses);
            addSection('Interesting Facts', interesting);
            addSection('Safety', safety);

            html += '</div>';
            return html;
        }

        function renderMessage(role, content, isLocalFallback = false) {
            const div = document.createElement('div');
            div.className = `ai-msg ai-msg-${role}`;
            
            let htmlStr = '';
            if (isLocalFallback) {
                htmlStr += '<div class="ai-local-badge"><span class="material-symbols-outlined" style="font-size: 14px;">bolt</span> Fast Local Data</div>';
            }
            
            if (role === 'bot') {
                htmlStr += parseToCard(content);
                // Simple sanitize instead of DOMPurify to save size & deps
                div.innerHTML = htmlStr;
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

        function findElementInData(query) {
            if (!window.ELEMENTS_DATA || !query) return null;
            const q = query.toLowerCase().trim();
            // Try matching name or symbol
            return window.ELEMENTS_DATA.find(e => 
                e.name.toLowerCase() === q || 
                e.symbol.toLowerCase() === q || 
                e.atomicNumber.toString() === q
            );
        }

        function generateLocalElementCard(el) {
            return `[ELEMENT_CARD]
NAME: ${el.name} (${el.symbol})
SUMMARY: ${el.category.replace('-', ' ')}
FACTS: Atomic Number: ${el.atomicNumber}, Atomic Mass: ${el.atomicMass}, Group: ${el.group}, Period: ${el.period}, Category: ${el.category}
DESCRIPTION: ${el.sections?.whatIsThis || 'No description available locally.'}
PHYSICAL: Density: ${el.density}, Melting Point: ${el.meltingPoint}, Boiling Point: ${el.boilingPoint}
CHEMICAL: Electronegativity: ${el.electronegativity}, Valency: ${el.valency}, Electron Config: ${el.electronConfiguration}
USES: ${el.sections?.everydayUses || 'No uses specified.'}
INTERESTING: Found in: ${el.sections?.howExtracted || 'N/A'}
SAFETY: N/A
[END_CARD]`;
        }

        function getContextElement() {
            const hash = window.location.hash;
            if (hash.startsWith("#element-") || hash.startsWith("#element/")) {
                const idStr = hash.replace("#element-", "").replace("#element/", "");
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

            // 1. FAST LOCAL DATA FALLBACK
            const matchedEl = findElementInData(text);
            if (matchedEl) {
                const localCardStr = generateLocalElementCard(matchedEl);
                renderMessage('bot', localCardStr, true); // Render local card instantly!
                // Add an explicit message that AI is enhancing
                const msg = renderMessage('bot', "✨ AI is enhancing this information...");
                msg.style.opacity = '0.7';
                msg.style.fontStyle = 'italic';
                setTimeout(() => { if (msg.parentNode) msg.parentNode.removeChild(msg); }, 3000);
            }

            // Typing indicator
            const typingDiv = document.createElement('div');
            typingDiv.className = 'ai-msg ai-msg-bot';
            typingDiv.innerHTML = '<div class="ai-typing"><div class="ai-dot"></div><div class="ai-dot"></div><div class="ai-dot"></div></div>';
            msgContainer.appendChild(typingDiv);
            scrollToBottom();

            try {
                // Prepare API messages
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

                if (typingDiv.parentNode) msgContainer.removeChild(typingDiv);
                
                // Read Stream
                const reader = response.body.getReader();
                const decoder = new TextDecoder('utf-8');
                let botMsgContent = "";
                const botMsgDiv = renderMessage('bot', ""); // empty start
                let streamBuffer = "";

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    
                    const chunk = decoder.decode(value, { stream: true });
                    streamBuffer += chunk;
                    
                    // Correctly split on actual newline characters from SSE
                    const lines = streamBuffer.split('\\n');
                    streamBuffer = lines.pop(); // Keep incomplete line in buffer

                    for (const line of lines) {
                        if (line.startsWith('data: ')) {
                            const dataStr = line.slice(6).trim();
                            if (dataStr === '[DONE]') continue;
                            try {
                                const data = JSON.parse(dataStr);
                                if (data.error) {
                                    botMsgContent += "\\nError: " + data.error;
                                } else if (data.choices && data.choices[0].delta && data.choices[0].delta.content) {
                                    botMsgContent += data.choices[0].delta.content;
                                }
                            } catch (e) {}
                        }
                    }
                    botMsgDiv.innerHTML = parseToCard(botMsgContent);
                    scrollToBottom();
                }

                sessionMessages.push({ role: 'assistant', content: botMsgContent });
                sessionStorage.setItem('frzi_ai_history', JSON.stringify(sessionMessages));

            } catch (error) {
                if (typingDiv.parentNode) msgContainer.removeChild(typingDiv);
                // If local data succeeded, we don't need to show a scary error, just silent fail on enhancement
                if (!matchedEl) {
                    addMessage('bot', "Sorry, I encountered an error connecting to the FRZI Labs backend. Please try again later.");
                }
            } finally {
                isWaiting = false;
                sendBtn.disabled = false;
                inputEl.disabled = false;
                inputEl.focus();
            }
        }
    }
})();


(function () {
  const init = () => {
    const host = document.getElementById('chatbot-host');
    if (!host || host.shadowRoot) return;

    const config = {
      id: Number(host.dataset.id) || 0,
      color: host.dataset.color || '#2271b1',
      name: host.dataset.name || 'Assistant'
    };

    let isTyping = false;
    let history = [];
    const shadow = host.attachShadow({ mode: 'open' });

    // STYLES
    const styleEl = document.createElement('style');
    styleEl.textContent = `
      :host { 
        --primary: ${config.color}; 
        --bg: #f9fafb; 
        --shadow: 0 12px 48px rgba(0,0,0,0.12);
        --radius: 16px;
      }
      .wrapper { font-family: -apple-system, BlinkMacSystemFont, "Inter", sans-serif; position: fixed; bottom: 24px; right: 24px; z-index: 999999; }
      
      #launcher { 
        width: 56px; height: 56px; border-radius: 50%; background: var(--primary); 
        color: white; border: none; cursor: pointer; font-size: 24px; 
        box-shadow: 0 4px 12px rgba(0,0,0,0.15); transition: transform 0.2s;
      }
      #launcher:hover { transform: scale(1.05); }

      #popup { 
        display: none; position: fixed; bottom: 95px; right: 24px; 
        width: 360px; height: 520px; background: white; border-radius: var(--radius); 
        overflow: hidden; box-shadow: var(--shadow); flex-direction: column;
        border: 1px solid rgba(0,0,0,0.05);
      }

      #header { 
        background: var(--primary); color: white; padding: 18px; 
        display: flex; justify-content: space-between; align-items: center; 
      }

      #window { 
        flex: 1; padding: 20px; background: var(--bg); overflow-y: auto; 
        display: flex; flex-direction: column; gap: 12px; scroll-behavior: smooth;
      }

      /* Message Bubbles */
      .msg { 
        max-width: 80%; padding: 12px 16px; border-radius: 18px; font-size: 14px; 
        line-height: 1.5; position: relative; word-wrap: break-word;
      }
      .user { 
        align-self: flex-end; background: var(--primary); color: white; 
        border-bottom-right-radius: 4px; 
      }
      .bot { 
        align-self: flex-start; background: white; color: #1f2937;
        border: 1px solid #e5e7eb; border-bottom-left-radius: 4px;
      }
      
      /* Instant Reply / Typing State */
      .typing { font-style: italic; color: #6b7280; font-size: 12px; margin-top: -4px; display: none; }

      #input-bar { 
        display: flex; padding: 16px; background: white; border-top: 1px solid #f3f4f6; gap: 10px; align-items: center;
      }
      .input-container {
        flex: 1; background: #f3f4f6; border-radius: 24px; padding: 4px 12px;
        display: flex; align-items: center; border: 1px solid transparent; transition: 0.2s;
      }
      .input-container:focus-within { background: white; border-color: var(--primary); box-shadow: 0 0 0 3px rgba(34, 113, 177, 0.1); }
      
      input { 
        flex: 1; border: none; background: transparent; padding: 8px; outline: none; font-size: 14px; color: #374151;
      }
      
      button#send { 
        background: var(--primary); border: none; color: white; width: 32px; height: 32px;
        border-radius: 50%; display: flex; align-items: center; justify-content: center;
        cursor: pointer; font-size: 14px; transition: opacity 0.2s;
      }
      button#send:disabled { opacity: 0.5; cursor: not-allowed; }
    `;
    shadow.appendChild(styleEl);

    // MARKUP
    const wrapper = document.createElement('div');
    wrapper.className = 'wrapper';
    wrapper.innerHTML = `
      <button id="launcher">💬</button>
      <div id="popup">
        <div id="header">
          <strong>${config.name}</strong>
          <button id="close" style="background:none;border:none;color:white;cursor:pointer;font-size:24px;">&times;</button>
        </div>
        <div id="window"></div>
        <div id="typing-indicator" class="msg bot typing">Designing please wait...</div>
        <div id="input-bar">
          <div class="input-container">
            <input id="user-input" placeholder="Redesign this page..." autocomplete="off" />
          </div>
          <button id="send">➤</button>
        </div>
      </div>
    `;
    shadow.appendChild(wrapper);

    const q = s => shadow.querySelector(s);
    const win = q('#window');
    const inp = q('#user-input');
    const sendBtn = q('#send');
    const typingIndicator = q('#typing-indicator');

    const render = (role, text) => {
      const div = document.createElement('div');
      div.className = `msg ${role}`;
      div.innerText = text;
      win.appendChild(div);
      win.scrollTop = win.scrollHeight;
    };

    const toggleTyping = (show) => {
      isTyping = show;
      typingIndicator.style.display = show ? 'block' : 'none';
      sendBtn.disabled = show;
      if (show) {
          win.scrollTop = win.scrollHeight;
          // Move typing indicator to bottom of window for visual flow
          win.appendChild(typingIndicator); 
      }
    };

    const talkToBot = async () => {
      const msg = inp.value.trim();
      if (!msg || isTyping) return;

      const currentBlocks = wp.data.select('core/block-editor').getBlocks();
      const currentHTML = wp.blocks.serialize(currentBlocks);

      render('user', msg);
      inp.value = '';
      toggleTyping(true); // Show "Designing please wait..."

      try {
        const response = await fetch(wpd_settings.ajax_url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            action: 'wpd_process_design',
            nonce: wpd_settings.nonce,
            new_chat: msg,
            page_context: currentHTML,
            chat_history: JSON.stringify(history)
          })
        });

        const resData = await response.json();
        const data = resData.data;

        if (data.new_body_html) {
          const newBlocks = wp.blocks.rawHandler({ HTML: data.new_body_html });
          wp.data.dispatch('core/block-editor').resetBlocks(newBlocks);
        }

        render('bot', data.reply);
        history.push({role: 'user', text: msg}, {role: 'bot', text: data.reply});

      } catch (err) {
        render('bot', 'Architect connection failed.');
      } finally {
        toggleTyping(false); // Hide typing indicator
      }
    };

    q('#launcher').onclick = () => { q('#popup').style.display = 'flex'; q('#launcher').style.display = 'none'; };
    q('#close').onclick = () => { q('#popup').style.display = 'none'; q('#launcher').style.display = 'block'; };
    q('#send').onclick = talkToBot;
    inp.onkeypress = e => { if (e.key === 'Enter') talkToBot(); };
  };

  init();
})();

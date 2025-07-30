// ==================== SESSION ID (memória por usuário) ====================
function getSessionId() {
  let sessionId = localStorage.getItem('sessionId');
  if (!sessionId) {
    sessionId = crypto.randomUUID(); // Gera um ID único
    localStorage.setItem('sessionId', sessionId);
  }
  return sessionId;
}

// ==================== SCROLL SUAVE PARA ÂNCORAS ====================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// ==================== CHAT COM IA ====================
const chat = document.getElementById('chat');
const input = document.getElementById('chat-message');
const sendBtn = document.getElementById('send-btn');

function addMessage(text, sender) {
  const p = document.createElement('p');
  p.textContent = text;
  p.className = sender;
  chat.appendChild(p);
  chat.scrollTop = chat.scrollHeight;
}

setTimeout(() => {
  addMessage('Olá! Sou sua assistente de emagrecimento com IA. Como posso ajudar você hoje?', 'bot');
}, 1000);

sendBtn.addEventListener('click', sendMessage);
input.addEventListener('keypress', function (e) {
  if (e.key === 'Enter') sendMessage();
});

function sendMessage() {
  const message = input.value.trim();
  if (!message) {
    alert("Por favor, digite uma mensagem.");
    return;
  }

  addMessage(message, 'user');
  input.value = '';

  const typingMsg = document.createElement('p');
  typingMsg.textContent = 'IA está digitando...';
  typingMsg.className = 'bot';
  typingMsg.style.opacity = '0.6';
  chat.appendChild(typingMsg);
  chat.scrollTop = chat.scrollHeight;

  const sessionId = getSessionId();

  fetch("https://n8n.srv880765.hstgr.cloud/webhook/landing-page", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chatInput: message,
      sessionId: sessionId
    })
  })
    .then(res => res.json())
    .then(data => {
      typingMsg.remove();
      addMessage(data.output || data.message || "Desculpe, não consegui entender.", 'bot');
    })
    .catch(err => {
      typingMsg.remove();
      console.error(err);
      addMessage("Ocorreu um erro ao tentar responder. Tente novamente mais tarde.", 'bot');
    });
}

// ==================== FORMULÁRIO DE LEAD ====================
document.getElementById('lead-form').addEventListener('submit', function (e) {
  e.preventDefault();

  const nome = document.getElementById('nome').value;
  const email = document.getElementById('email').value;
  const numero = document.getElementById('numero').value;

  const win = window.open("https://pay.hub.la/r417VjBTiNi8fGeJdhFf", "_blank");

  if (!win) {
    alert("Por favor, permita pop-ups para continuar com o pagamento.");
    return;
  }

  fetch("https://n8n.srv880765.hstgr.cloud/webhook/receber-lead", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nome, email, mensagem: numero })
  })
    .then(() => {
      alert(`Obrigado, ${nome}! Enviamos seus dados com sucesso.`);
      document.getElementById("ia").scrollIntoView({ behavior: 'smooth' });
      setTimeout(() => {
        addMessage(`Olá ${nome}! Que bom ter você aqui. Qual sua principal dúvida sobre emagrecimento?`, 'bot');
      }, 500);
    })
    .catch((error) => {
      alert('Erro ao enviar seus dados. Tente novamente mais tarde.');
      console.error(error);
    });
});

// ==================== CURSOR PERSONALIZADO ====================
document.addEventListener('mousemove', (e) => {
  let cursor = document.querySelector('.cursor');
  if (!cursor) {
    cursor = document.createElement('div');
    cursor.className = 'cursor';
    cursor.style.cssText = `
      position: fixed;
      width: 20px;
      height: 20px;
      background: radial-gradient(circle, var(--primary-green) 0%, transparent 70%);
      border-radius: 50%;
      pointer-events: none;
      z-index: 9999;
      opacity: 0.3;
      transition: opacity 0.3s ease;
    `;
    document.body.appendChild(cursor);
  }

  cursor.style.left = e.clientX - 10 + 'px';
  cursor.style.top = e.clientY - 10 + 'px';
});

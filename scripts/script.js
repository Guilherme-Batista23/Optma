// ==================== SESSION ID ====================
function getSessionId() {
  let sessionId = localStorage.getItem('sessionId');
  if (!sessionId) {
    sessionId = crypto.randomUUID();
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

// ==================== FORMULÁRIO DE LEAD ====================
document.getElementById("lead-form").addEventListener("submit", function (e) {
  e.preventDefault();

  const nome = document.getElementById("nome").value.trim();
  const email = document.getElementById("email").value.trim();
  const telefoneInput = document.getElementById("numero");
  const numeroRaw = telefoneInput.value.replace(/\D/g, "");

  if (numeroRaw.length !== 11) {
    alert("Por favor, digite um número válido com DDD e 9 dígitos. Ex: (11) 91234-5678");
    telefoneInput.focus();
    return;
  }

  const numeroFormatado = `+55${numeroRaw}`;

  fetch("https://n8n.srv880765.hstgr.cloud/webhook/receber-lead", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nome, email, mensagem: numeroFormatado })
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Erro ao enviar para o servidor. Status: " + response.status);
      }

      window.open("https://pay.hub.la/r417VjBTiNi8fGeJdhFf", "_blank");

 alert(`Olá ${nome}! Agora você será redirecionado para o pagamento.`);

      document.getElementById("ia")?.scrollIntoView({ behavior: 'smooth' });

    })
    .catch((error) => {
      alert("Erro ao enviar seus dados. Tente novamente.");
      console.error(error);
    });
});

// ==================== FORMATAR TELEFONE AO DIGITAR ====================
const telefoneInput = document.getElementById("numero");

telefoneInput.addEventListener("input", () => {
  let valor = telefoneInput.value.replace(/\D/g, "").slice(0, 11);

  if (valor.length >= 2 && valor.length <= 6) {
    telefoneInput.value = `(${valor.slice(0, 2)}) ${valor.slice(2)}`;
  } else if (valor.length > 6) {
    telefoneInput.value = `(${valor.slice(0, 2)}) ${valor.slice(2, 7)}-${valor.slice(7, 11)}`;
  } else {
    telefoneInput.value = valor;
  }
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

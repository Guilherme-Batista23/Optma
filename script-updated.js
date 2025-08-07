// Intersection Observer para animações de scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);

// Detectar se é dispositivo móvel
function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
           window.innerWidth <= 768;
}

// Observar todos os elementos com classes de animação
document.addEventListener('DOMContentLoaded', () => {
    const animatedElements = document.querySelectorAll('.fade-in-up, .fade-in-left, .fade-in-right');
    animatedElements.forEach(el => observer.observe(el));
    
    // Inicializar FAQ
    initializeFAQ();
    
    // Inicializar formulário
    initializeForm();
    
    // Smooth scroll para links internos
    initializeSmoothScroll();
    
    // Parallax effect no hero
    initializeParallax();
    
    // Inicializar efeitos adicionais
    setTimeout(() => {
        initializeParticles();
    }, 500);
});

// Função para rolar até o formulário
function scrollToForm() {
    const formSection = document.getElementById('registration-form');
    if (formSection) {
        formSection.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// Inicializar formulário
function initializeForm() {
    const form = document.getElementById('checkoutForm');
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const phoneInput = document.getElementById('phone');
    
    // Máscara para telefone
    phoneInput.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '');
        
        if (value.length <= 11) {
            value = value.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
            if (value.length < 14) {
                value = value.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
            }
        }
        
        e.target.value = value;
    });
    
    // Validação em tempo real
    nameInput.addEventListener('blur', validateName);
    emailInput.addEventListener('blur', validateEmail);
    phoneInput.addEventListener('blur', validatePhone);
    
    // Submit do formulário
    form.addEventListener('submit', handleFormSubmit);
}

// Validações
function validateName() {
    const nameInput = document.getElementById('name');
    const name = nameInput.value.trim();
    
    if (name.length < 2) {
        showFieldError(nameInput, 'Nome deve ter pelo menos 2 caracteres');
        return false;
    }
    
    clearFieldError(nameInput);
    return true;
}

function validateEmail() {
    const emailInput = document.getElementById('email');
    const email = emailInput.value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!emailRegex.test(email)) {
        showFieldError(emailInput, 'Digite um e-mail válido');
        return false;
    }
    
    clearFieldError(emailInput);
    return true;
}

function validatePhone() {
    const phoneInput = document.getElementById('phone');
    const phone = phoneInput.value.replace(/\D/g, '');
    
    if (phone.length < 10) {
        showFieldError(phoneInput, 'Digite um telefone válido');
        return false;
    }
    
    clearFieldError(phoneInput);
    return true;
}

function showFieldError(input, message) {
    clearFieldError(input);
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'field-error';
    errorDiv.textContent = message;
    errorDiv.style.cssText = `
        color: #ff6b6b;
        font-size: 14px;
        margin-top: 5px;
        animation: fadeIn 0.3s ease;
    `;
    
    input.parentNode.appendChild(errorDiv);
    input.style.borderColor = '#ff6b6b';
}

function clearFieldError(input) {
    const existingError = input.parentNode.querySelector('.field-error');
    if (existingError) {
        existingError.remove();
    }
    input.style.borderColor = 'rgba(255, 255, 255, 0.2)';
}

// Mostrar loading no botão
function showButtonLoading(button) {
    const originalText = button.innerHTML;
    button.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: center; gap: 10px;">
            <div style="width: 20px; height: 20px; border: 2px solid rgba(255,255,255,0.3); border-top: 2px solid white; border-radius: 50%; animation: spin 1s linear infinite;"></div>
            Processando...
        </div>
    `;
    button.disabled = true;
    return originalText;
}

function hideButtonLoading(button, originalText) {
    button.innerHTML = originalText;
    button.disabled = false;
}

// Handle form submission - VERSÃO CORRIGIDA PARA MOBILE
function handleFormSubmit(e) {
    e.preventDefault();

    const isNameValid = validateName();
    const isEmailValid = validateEmail();
    const isPhoneValid = validatePhone();

    if (!isNameValid || !isEmailValid || !isPhoneValid) {
        const firstError = document.querySelector('.field-error');
        if (firstError) {
            firstError.parentNode.querySelector('input').focus();
        }
        return;
    }

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const phoneRaw = document.getElementById("phone").value.replace(/\D/g, "");

    if (phoneRaw.length !== 11) {
        showFieldError(document.getElementById("phone"), "Número deve ter DDD + 9 dígitos");
        return;
    }

    const numeroFormatado = `+55${phoneRaw}`;
    const submitButton = e.target.querySelector('button[type="submit"]');
    const originalButtonText = showButtonLoading(submitButton);

    // Mostrar feedback visual melhorado
    showProcessingFeedback(name);

    fetch("https://n8n.srv880765.hstgr.cloud/webhook/receber-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome: name, email, mensagem: numeroFormatado })
    })
    .then((response) => {
        if (!response.ok) throw new Error("Erro ao enviar para o servidor.");
        
        // Sucesso - redirecionar baseado no dispositivo
        if (isMobileDevice()) {
            // No mobile, usar redirecionamento direto
            showSuccessFeedback(name, () => {
                window.location.href = "https://pay.hub.la/r417VjBTiNi8fGeJdhFf";
            });
        } else {
            // No desktop, abrir nova aba
            window.open("https://pay.hub.la/r417VjBTiNi8fGeJdhFf", "_blank");
            showSuccessFeedback(name);
        }
    })
    .catch((error) => {
        hideButtonLoading(submitButton, originalButtonText);
        hideProcessingFeedback();
        showErrorFeedback();
        console.error(error);
    });
}

// Feedback visual melhorado
function showProcessingFeedback(name) {
    const feedback = document.createElement('div');
    feedback.id = 'processing-feedback';
    feedback.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
        padding: 30px;
        border-radius: 20px;
        text-align: center;
        z-index: 10000;
        border: 1px solid rgba(255, 255, 255, 0.1);
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
        animation: slideUp 0.3s ease;
        max-width: 90%;
        width: 400px;
    `;
    
    feedback.innerHTML = `
        <div style="font-size: 2rem; margin-bottom: 15px;">⏳</div>
        <h3 style="color: #ffffff; margin-bottom: 10px; font-size: 1.4rem;">Processando sua inscrição...</h3>
        <p style="color: #b8b8b8; margin-bottom: 20px;">Olá ${name}, estamos enviando seus dados.</p>
        <div style="width: 40px; height: 40px; border: 3px solid rgba(67, 183, 201, 0.3); border-top: 3px solid #43b7c9; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto;"></div>
    `;
    
    // Overlay
    const overlay = document.createElement('div');
    overlay.id = 'feedback-overlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.7);
        z-index: 9999;
        animation: fadeIn 0.3s ease;
    `;
    
    document.body.appendChild(overlay);
    document.body.appendChild(feedback);
}

function hideProcessingFeedback() {
    const feedback = document.getElementById('processing-feedback');
    const overlay = document.getElementById('feedback-overlay');
    if (feedback) feedback.remove();
    if (overlay) overlay.remove();
}

function showSuccessFeedback(name, callback = null) {
    hideProcessingFeedback();
    
    const feedback = document.createElement('div');
    feedback.id = 'success-feedback';
    feedback.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
        padding: 30px;
        border-radius: 20px;
        text-align: center;
        z-index: 10000;
        border: 1px solid rgba(67, 183, 201, 0.3);
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
        animation: slideUp 0.3s ease;
        max-width: 90%;
        width: 400px;
    `;
    
    const isMobile = isMobileDevice();
    const redirectText = isMobile ? 
        "Você será redirecionado para o pagamento em instantes..." : 
        "Uma nova aba foi aberta com o pagamento.";
    
    feedback.innerHTML = `
        <div style="font-size: 3rem; margin-bottom: 20px;">🎉</div>
        <h3 style="color: #43b7c9; margin-bottom: 15px; font-size: 1.6rem;">Sucesso!</h3>
        <p style="color: #ffffff; margin-bottom: 10px; font-weight: 600;">Olá ${name}!</p>
        <p style="color: #b8b8b8; margin-bottom: 20px; line-height: 1.5;">${redirectText}</p>
        <div style="display: flex; justify-content: center; gap: 16px; margin-bottom: 20px; flex-wrap: wrap;">
            <span style="color: #43b7c9; font-size: 14px;">🔒 Pagamento seguro</span>
            <span style="color: #43b7c9; font-size: 14px;">✅ Acesso imediato</span>
        </div>
        ${!isMobile ? '<button onclick="closeSuccessFeedback()" style="background: linear-gradient(45deg, #43b7c9, #6ad4e6); color: white; border: none; padding: 12px 24px; border-radius: 25px; cursor: pointer; font-weight: 600;">Fechar</button>' : ''}
    `;
    
    // Overlay
    const overlay = document.createElement('div');
    overlay.id = 'success-overlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.7);
        z-index: 9999;
        animation: fadeIn 0.3s ease;
    `;
    
    document.body.appendChild(overlay);
    document.body.appendChild(feedback);
    
    // Se for mobile e tiver callback, executar após 2 segundos
    if (isMobile && callback) {
        setTimeout(callback, 2000);
    }
    
    // Auto-fechar após 5 segundos se não for mobile
    if (!isMobile) {
        setTimeout(() => {
            closeSuccessFeedback();
        }, 5000);
    }
}

function closeSuccessFeedback() {
    const feedback = document.getElementById('success-feedback');
    const overlay = document.getElementById('success-overlay');
    if (feedback) feedback.remove();
    if (overlay) overlay.remove();
}

function showErrorFeedback() {
    const feedback = document.createElement('div');
    feedback.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
        padding: 30px;
        border-radius: 20px;
        text-align: center;
        z-index: 10000;
        border: 1px solid rgba(255, 107, 107, 0.3);
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
        animation: slideUp 0.3s ease;
        max-width: 90%;
        width: 400px;
    `;
    
    feedback.innerHTML = `
        <div style="font-size: 2.5rem; margin-bottom: 20px;">❌</div>
        <h3 style="color: #ff6b6b; margin-bottom: 15px; font-size: 1.4rem;">Erro ao processar</h3>
        <p style="color: #b8b8b8; margin-bottom: 20px;">Ocorreu um erro ao enviar seus dados. Tente novamente.</p>
        <button onclick="this.parentElement.remove()" style="
            background: linear-gradient(45deg, #ff6b6b, #feca57);
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 25px;
            cursor: pointer;
            font-weight: 600;
        ">Tentar novamente</button>
    `;
    
    document.body.appendChild(feedback);
    
    // Auto-remover após 5 segundos
    setTimeout(() => {
        if (feedback.parentElement) {
            feedback.remove();
        }
    }, 5000);
}

// Modal de checkout (mantido para compatibilidade)
function showCheckoutModal() {
    const modal = document.createElement('div');
    modal.className = 'checkout-modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
        animation: fadeIn 0.3s ease;
    `;
    
    const modalContent = document.createElement('div');
    modalContent.style.cssText = `
        background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
        padding: 40px;
        border-radius: 20px;
        text-align: center;
        max-width: 500px;
        margin: 20px;
        border: 1px solid rgba(255, 255, 255, 0.1);
        animation: slideUp 0.3s ease;
    `;
    
    modalContent.innerHTML = `
        <div style="font-size: 3rem; margin-bottom: 20px;">🎉</div>
        <h2 style="color: #ffffff; margin-bottom: 16px; font-size: 1.8rem;">Redirecionando para o checkout...</h2>
        <p style="color: #b8b8b8; margin-bottom: 24px; line-height: 1.6;">
            Você será redirecionado para a página de pagamento seguro em instantes.
        </p>
        <div style="display: flex; justify-content: center; gap: 16px; margin-bottom: 20px;">
            <span style="color: #43b7c9;">🔒 Pagamento seguro</span>
            <span style="color: #43b7c9;">✅ Acesso imediato</span>
        </div>
        <button onclick="closeCheckoutModal()" style="
            background: linear-gradient(45deg, #43b7c9, #6ad4e6);
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 25px;
            cursor: pointer;
            font-weight: 600;
        ">Fechar</button>
    `;
    
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
    
    // Simular redirecionamento após 3 segundos
    setTimeout(() => {
        // Aqui você colocaria a URL real do seu checkout
        // window.location.href = 'https://checkout.exemplo.com';
        console.log('Redirecionando para checkout...');
    }, 3000);
}

function closeCheckoutModal() {
    const modal = document.querySelector('.checkout-modal');
    if (modal) {
        modal.remove();
    }
}

// Inicializar FAQ
function initializeFAQ() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        
        question.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            
            // Fechar todos os outros itens
            faqItems.forEach(otherItem => {
                if (otherItem !== item) {
                    otherItem.classList.remove('active');
                }
            });
            
            // Toggle do item atual
            if (isActive) {
                item.classList.remove('active');
            } else {
                item.classList.add('active');
            }
        });
    });
}

// Smooth scroll
function initializeSmoothScroll() {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Efeito parallax no hero
function initializeParallax() {
    if (window.innerWidth > 768) {
        const hero = document.querySelector('.hero');
        const profileImage = document.querySelector('.profile-image');

        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const rate = scrolled * -0.5;

            if (profileImage) {
                profileImage.style.transform = `translateY(${rate}px)`;
            }

            if (hero) {
                hero.style.transform = `translateY(${scrolled * 0.3}px)`;
            }
        });
    }
}

// Efeito de partículas no background
function initializeParticles() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '-1';
    canvas.style.opacity = '0.3';
    
    document.body.appendChild(canvas);
    
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    const particles = [];
    const particleCount = 50;
    
    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.vx = (Math.random() - 0.5) * 0.5;
            this.vy = (Math.random() - 0.5) * 0.5;
            this.size = Math.random() * 2 + 1;
        }
        
        update() {
            this.x += this.vx;
            this.y += this.vy;
            
            if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
            if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
        }
        
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = '#43b7c9';
            ctx.fill();
        }
    }
    
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }
    
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        particles.forEach(particle => {
            particle.update();
            particle.draw();
        });
        
        // Conectar partículas próximas
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 100) {
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `rgba(67, 183, 201, ${1 - distance / 100})`;
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            }
        }
        
        requestAnimationFrame(animate);
    }
    
    animate();
}

// Adicionar botão de voltar ao topo
document.addEventListener('DOMContentLoaded', () => {
    const backToTopButton = document.createElement('button');
    backToTopButton.innerHTML = '↑';
    backToTopButton.className = 'back-to-top';
    backToTopButton.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        background: linear-gradient(45deg, #43b7c9, #6ad4e6);
        color: white;
        border: none;
        font-size: 20px;
        cursor: pointer;
        opacity: 0;
        transition: all 0.3s ease;
        z-index: 1000;
        box-shadow: 0 4px 20px rgba(67, 183, 201, 0.3);
    `;
    
    document.body.appendChild(backToTopButton);
    
    backToTopButton.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
    
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            backToTopButton.style.opacity = '1';
            backToTopButton.style.transform = 'scale(1)';
        } else {
            backToTopButton.style.opacity = '0';
            backToTopButton.style.transform = 'scale(0.8)';
        }
    });
});

// Preloader
window.addEventListener('load', () => {
    const preloader = document.createElement('div');
    preloader.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 9999;
        transition: opacity 0.5s ease;
    `;
    
    const spinner = document.createElement('div');
    spinner.style.cssText = `
        width: 50px;
        height: 50px;
        border: 3px solid rgba(67, 183, 201, 0.3);
        border-top: 3px solid #43b7c9;
        border-radius: 50%;
        animation: spin 1s linear infinite;
    `;
    
    const style = document.createElement('style');
    style.textContent = `
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        @keyframes slideUp {
            from { transform: translateY(30px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
    `;
    document.head.appendChild(style);
    
    preloader.appendChild(spinner);
    document.body.appendChild(preloader);
    
    setTimeout(() => {
        preloader.style.opacity = '0';
        setTimeout(() => {
            preloader.remove();
        }, 500);
    }, 1000);
});

// Contador de vagas (simulado)
function initializeVagasCounter() {
    const vagasRestantes = Math.floor(Math.random() * 20) + 15; // Entre 15 e 35 vagas
    
    // Atualizar elementos que mostram vagas restantes
    const vagasElements = document.querySelectorAll('.vagas-restantes');
    vagasElements.forEach(element => {
        element.textContent = `${vagasRestantes} vagas restantes`;
    });
}

// Inicializar contador quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    initializeVagasCounter();
});


// AOS (Animate On Scroll) kütüphanesini başlat
document.addEventListener('DOMContentLoaded', () => {
    AOS.init({
        duration: 800,
        easing: 'ease-out',
        once: true
    });
});

// Smooth scroll için yardımcı fonksiyon
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            window.scrollTo({
                top: target.offsetTop - 80, // Header yüksekliği için offset
                behavior: 'smooth'
            });
        }
    });
});

// Scroll olayında header'ın görünürlüğünü ayarla
let lastScroll = 0;
const header = document.querySelector('.header');

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll <= 0) {
        header.style.transform = 'translateY(0)';
        return;
    }
    
    if (currentScroll > lastScroll && currentScroll > 80) {
        // Aşağı scroll - header'ı yavaşça gizle
        header.style.transition = 'transform 0.3s ease-in-out';
        header.style.transform = 'translateY(-100%)';
    } else {
        // Yukarı scroll - header'ı yavaşça göster
        header.style.transition = 'transform 0.3s ease-in-out';
        header.style.transform = 'translateY(0)';
    }
    
    lastScroll = currentScroll;
});

// Scroll durduğunda header'ı göster
let scrollTimeout;
window.addEventListener('scroll', () => {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
        header.style.transition = 'transform 0.3s ease-in-out';
        header.style.transform = 'translateY(0)';
    }, 150);
});

// Sayfa yüklendiğinde hero bölümüne fade-in animasyonu
window.addEventListener('load', () => {
    const hero = document.querySelector('.hero');
    if (hero) {
        hero.style.opacity = '0';
        setTimeout(() => {
            hero.style.transition = 'opacity 1s ease-in-out';
            hero.style.opacity = '1';
        }, 100);
    }
});

// Feature kartları için hover efekti
document.querySelectorAll('.feature-card').forEach(card => {
    card.addEventListener('mouseenter', () => {
        card.style.transform = 'translateY(-10px)';
    });
    
    card.addEventListener('mouseleave', () => {
        card.style.transform = 'translateY(0)';
    });
}); 
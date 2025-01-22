const translations = {
    tr: {
        nav: {
            features: "Özellikler",
            howTo: "Nasıl Kullanılır",
            video: "Video Tanıtım",
            contact: "İletişim"
        },
        hero: {
            title: "Sayfaları kolayca kaydedin",
            description: "Açık sayfalarınızı, kayıt sebebinizi tek tıkla kaydedin, dilediğiniz zaman silin, dışa aktarın, içe aktarın.",
            cta: "Hemen Başla"
        },
        features: {
            title: "Özellikler",
            cards: {
                backup: {
                    title: "Kolay Kaydetme",
                    description: "Tek sağ tıkla açık sayfalarınızı kaydedebilirsiniz, kayıt sebebinizi de ekleyebilirsiniz."
                },
                sync: {
                    title: "Güvenilir",
                    description: "Kayıtlarınız yalnızca browser'da saklanır, biz hiçbir verinizi saklamıyoruz."
                },
                organize: {
                    title: "Paylaşılabilir",
                    description: "Kayıtlarınızı silebilir, dışa aktarabilir, başkalarıyla paylaşabilirsiniz ve içe aktarabilirsiniz."
                }
            }
        },
        howTo: {
            title: "Nasıl Kullanılır",
            steps: {
                1: {
                    title: "Eklentiyi Yükleyin",
                    description: "Browser Mağazası'ndan Kolay Kaydet eklentisini indirin ve yükleyin."
                },
                2: {
                    title: "Herhangi bir sayfada sağ tıklayın",
                    description: "Kayıt sebebinizi, hatırlamak istediğiniz sayfaları ve ekran kaydınızı kaydetmek bu kadar kolay."
                },
                3: {
                    title: "Kayıtlarınızı görüntüleyin",
                    description: "Eklentiler arasında Kolay Kaydet'i bulun ve Kayıtları Görüntüle'ye tıklayın."
                },
                4: {
                    title: "Sil, Dışa Aktar, ve İçe Aktar",
                    description: "Kayıtlarınızı silebilir, dışa aktarabilir, ve içe aktarabilirsiniz."
                }
            }
        },
        video: {
            title: "Video Tanıtım",
            description: "Kolay Kaydet'i nasıl kullanacağınızı görsel olarak öğrenin."
        },
        contact: {
            title: "İletişim",
            description: "Sorularınız için bize ulaşın.",
            button: "İletişime Geç"
        },
        footer: {
            copyright: "Tüm hakları saklıdır."
        }
    },
    en: {
        nav: {
            features: "Features",
            howTo: "How to Use",
            video: "Video Guide",
            contact: "Contact"
        },
        hero: {
            title: "Save Your Tabs Easily",
            description: "Save your tabs easily with Easy Save. Backup, and restore your tabs and saving reason with one click.",
            cta: "Get Started"
        },
        features: {
            title: "Features",
            cards: {
                backup: {
                    title: "Easy Save",
                    description: "With only one click, you can save your tabs and saving reason."
                },
                sync: {
                    title: "Trustworthy",
                    description: "Your data is safe and secure with you. We do not store any of your data."
                },
                organize: {
                    title: "Share",
                    description: "Share your saved tabs with your friends and family."
                }
            }
        },
        howTo: {
            title: "How to Use",
            steps: {
                1: {
                    title: "Install the Extension",
                    description: "Download and install Easy Save extension from Browser Store."
                },
                2: {
                    title: "Right Click in any tab",
                    description: "You can save your tabs and saving reason with one click."
                },
                3: {
                    title: "See and manage your saved tabs",
                    description: "Find and extension and click records."
                },
                4: {
                    title: "Delete, Export, and Import",
                    description: "You can delete, export, and import your saved tabs."
                }
            }
        },
        video: {
            title: "Video Guide",
            description: "Learn visually how to use Easy Save."
        },
        contact: {
            title: "Contact",
            description: "Reach out to us for any questions.",
            button: "Get in Touch"
        },
        footer: {
            copyright: "All rights reserved."
        }
    }
};

class Localizer {
    constructor() {
        this.currentLang = localStorage.getItem('language') || 'tr';
        this.init();
    }

    init() {
        this.setupLanguageSwitch();
        this.updateContent();
        this.updateSwitchState();
    }

    setupLanguageSwitch() {
        const switchInput = document.querySelector('.language-switch input');
        if (switchInput) {
            switchInput.checked = this.currentLang === 'en';
            switchInput.addEventListener('change', (e) => {
                this.currentLang = e.target.checked ? 'en' : 'tr';
                localStorage.setItem('language', this.currentLang);
                this.updateContent();
                this.updateLabels();
            });
        }
    }

    updateSwitchState() {
        const switchInput = document.querySelector('.language-switch input');
        if (switchInput) {
            switchInput.checked = this.currentLang === 'en';
            this.updateLabels();
        }
    }

    updateLabels() {
        const trLabel = document.querySelector('.language-label[data-lang="tr"]');
        const enLabel = document.querySelector('.language-label[data-lang="en"]');
        
        if (this.currentLang === 'tr') {
            trLabel?.classList.add('active');
            enLabel?.classList.remove('active');
        } else {
            trLabel?.classList.remove('active');
            enLabel?.classList.add('active');
        }
    }

    updateContent() {
        const elements = document.querySelectorAll('[data-i18n]');
        elements.forEach(element => {
            const key = element.dataset.i18n;
            const text = this.getTranslation(key);
            if (text) {
                if (element.tagName === 'INPUT' && element.type === 'submit') {
                    element.value = text;
                } else {
                    element.textContent = text;
                }
            }
        });
    }

    getTranslation(key) {
        return key.split('.').reduce((obj, i) => obj ? obj[i] : null, translations[this.currentLang]);
    }
}

// Sayfa yüklendiğinde localizer'ı başlat
document.addEventListener('DOMContentLoaded', () => {
    window.localizer = new Localizer();
    
    // AOS'u başlat
    AOS.init({
        duration: 800,
        offset: 100,
        once: true
    });

    // Mobil menü işlemleri
    const mobileMenuButton = document.querySelector('.mobile-menu-button');
    const navLinks = document.querySelector('.nav-links');

    if (mobileMenuButton && navLinks) {
        mobileMenuButton.addEventListener('click', () => {
            mobileMenuButton.classList.toggle('active');
            navLinks.classList.toggle('active');
        });

        // Menü linklerine tıklandığında menüyü kapat
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                mobileMenuButton.classList.remove('active');
                navLinks.classList.remove('active');
            });
        });
    }
}); 
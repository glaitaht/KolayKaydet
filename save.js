document.addEventListener('DOMContentLoaded', async () => {
    // i18n fonksiyonunu ekle
    function localizeHtmlPage() {
        var data = document.querySelectorAll('[data-localize]');
        
        for (var i in data) if (data.hasOwnProperty(i)) {
            var obj = data[i];
            var tag = obj.getAttribute('data-localize').toString();
            
            var msg = tag.replace(/__MSG_(\w+)__/g, function(match, v1) {
                return v1 ? chrome.i18n.getMessage(v1) : '';
            });
            
            if(msg != tag) obj.innerHTML = msg;
        }
    }

    // Sayfa yüklendiğinde metinleri yerelleştir
    localizeHtmlPage();

    // Screenshot'u yükle
    const loadScreenshot = async () => {
        try {
            const result = await chrome.storage.local.get(['image']);
            if (result.image) {
                const screenshotElement = document.getElementById('screenshot');
                screenshotElement.src = `data:image/jpeg;base64,${result.image}`;
            }
        } catch (error) {
            console.error(chrome.i18n.getMessage('errorScreenshot'), error);
        }
    };

    // Açık tabları yükle ve listele
    const loadTabs = async () => {
        try {
            const { tabs, currentTab } = await chrome.storage.local.get(['tabs', 'currentTab']);
            const tabsContainer = document.getElementById('tabsContainer');
            
            if (tabs && tabs.length > 0) {
                tabs.forEach(tab => {
                    const isCurrentTab = currentTab[0].id === tab.id;
                    const tabElement = document.createElement('div');
                    tabElement.className = 'form-check custom-checkbox mb-2';
                    tabElement.innerHTML = `
                        <input class="form-check-input tab-checkbox" type="checkbox" 
                               value="${tab.id}" id="tab_${tab.id}" 
                               ${isCurrentTab ? 'checked disabled' : ''}>
                        <label class="form-check-label d-flex align-items-center gap-2" for="tab_${tab.id}">
                            <img src="${tab.favIconUrl || 'images/kk-logo-16x16.png'}" 
                                 style="width: 16px; height: 16px;" alt="favicon">
                            <span class="text-truncate" style="max-width: 300px;" 
                                  title="${tab.title}">${tab.title}</span>
                        </label>
                    `;
                    tabsContainer.appendChild(tabElement);
                });
            }
        } catch (error) {
            console.error(chrome.i18n.getMessage('errorTabs'), error);
        }
    };

    // Tüm tabları seç/kaldır
    document.getElementById('selectAllTabs').addEventListener('click', (e) => {
        const checkboxes = document.querySelectorAll('.tab-checkbox:not([disabled])');
        const selectAll = !e.target.classList.contains('active');
        checkboxes.forEach(checkbox => checkbox.checked = selectAll);
        e.target.classList.toggle('active');
    });

    // İptal butonu
    document.getElementById('cancelButton').addEventListener('click', () => {
        window.close();
    });

    // Form gönderimi
    document.getElementById('saveForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        try {
            const title = document.getElementById('title').value;
            const description = document.getElementById('description').value;
            const selectedTabs = Array.from(document.querySelectorAll('.tab-checkbox:checked'))
                .map(checkbox => parseInt(checkbox.value));

            const { image, tabs } = await chrome.storage.local.get(['image', 'tabs']);
            const savedTabs = tabs.filter(tab => selectedTabs.includes(tab.id));

            const saveData = {
                id: Date.now(),
                title,
                description,
                screenshot: image,
                timestamp: new Date().toISOString(),
                tabs: savedTabs
            };

            // Mevcut kayıtları al ve yenisini ekle
            const { saves = [] } = await chrome.storage.local.get(['saves']);
            saves.unshift(saveData);
            
            await chrome.storage.local.set({ saves });
            
            // Kayıt başarılı mesajı göster ve pencereyi kapat
            window.close();
            
        } catch (error) {
            console.error('Kayıt hatası:', error);
            alert(chrome.i18n.getMessage('errorSave'));
        }
    });

    // Sayfayı yükle
    await loadScreenshot();
    await loadTabs();
});
function replace_i18n(obj, tag) {
    var msg = tag.replace(/__MSG_(\w+)__/g, function(match, v1) {
        return v1 ? chrome.i18n.getMessage(v1) : '';
    });
    
    if(msg != tag) obj.innerHTML = msg;
}

function localizeHtmlPage() {
    var data = document.querySelectorAll('[data-localize]');
    
    for (var i in data) if (data.hasOwnProperty(i)) {
        var obj = data[i];
        var tag = obj.getAttribute('data-localize').toString();
        
        replace_i18n(obj, tag);
    }
    
    var page = document.getElementsByTagName('html');
    
    for (var j = 0; j < page.length; j++) {
        var obj = page[j];
        var tag = obj.innerHTML.toString();
        
        replace_i18n(obj, tag);
    }
}

localizeHtmlPage();

document.addEventListener('DOMContentLoaded', () => {
    // Sayfayı kaydet butonu için tıklama olayı
    document.getElementById('savePageBtn').addEventListener('click', () => {
        chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
            const currentTab = tabs[0];
            
            try {
                // Screenshot al
                const screenshot = await chrome.tabs.captureVisibleTab();
                const base64Image = screenshot.replace(/^data:image\/jpeg;base64,/, '');
                
                // Tüm açık sekmeleri al
                const allTabs = await chrome.tabs.query({ currentWindow: true });
                
                // Bilgileri storage'a kaydet
                await chrome.storage.local.set({
                    image: base64Image,
                    tabs: allTabs,
                    currentTab: [currentTab]
                });
                
                // Kaydetme penceresini aç
                chrome.windows.create({
                    url: chrome.runtime.getURL('save.html'),
                    type: 'popup',
                    width: 600,
                    height: 800
                });
                
                window.close();
            } catch (error) {
                console.error('Sayfa kaydedilirken hata:', error);
                alert(chrome.i18n.getMessage('errorSave'));
            }
        });
    });
    
    // Kayıtları görüntüle butonu için tıklama olayı
    document.getElementById('viewRecordsBtn').addEventListener('click', () => {
        try {
            // Basitleştirilmiş pencere oluşturma
            chrome.windows.create({
                url: chrome.runtime.getURL('records.html'),
                type: 'popup',
                width: 1000,
                height: 800
            }, (newWindow) => {
                if (chrome.runtime.lastError) {
                    console.error('Pencere oluşturma hatası:', chrome.runtime.lastError);
                    // Alternatif yöntem: Yeni sekme aç
                    chrome.tabs.create({
                        url: chrome.runtime.getURL('records.html')
                    });
                }
            });
            window.close();
        } catch (error) {
            console.error('Hata:', error);
            // Hata durumunda yeni sekme aç
            chrome.tabs.create({
                url: chrome.runtime.getURL('records.html')
            });
        }
    });
});

// h2 elementlerine tıklanabilir stil ekle
document.querySelectorAll('h2').forEach(h2 => {
    h2.style.cursor = 'pointer';
});

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

        // Tooltip'leri yerelleştir
        var tooltips = document.querySelectorAll('[data-bs-title]');
        tooltips.forEach(tooltip => {
            var title = tooltip.getAttribute('data-bs-title');
            var msg = title.replace(/__MSG_(\w+)__/g, function(match, v1) {
                return v1 ? chrome.i18n.getMessage(v1) : '';
            });
            if(msg != title) tooltip.setAttribute('data-bs-title', msg);
        });
    }

    // Sayfa yüklendiğinde metinleri yerelleştir
    localizeHtmlPage();

    // Bootstrap Modal'ı başlat
    let modal;
    try {
        modal = new bootstrap.Modal(document.getElementById('recordDetailModal'));
        
        // Tooltip'leri başlat
        const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        tooltipTriggerList.map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));
    } catch (error) {
        console.error(chrome.i18n.getMessage('errorBootstrap'), error);
    }
    let currentRecordId = null;

    // Kayıtları yükle ve görüntüle
    const loadRecords = async () => {
        try {
            const { saves = [] } = await chrome.storage.local.get(['saves']);
            
            const container = document.getElementById('recordsContainer');
            const emptyState = document.getElementById('emptyState');
            
            container.innerHTML = '';
            
            if (!saves || saves.length === 0) {
                emptyState.classList.remove('d-none');
                return;
            }

            emptyState.classList.add('d-none');
            saves.forEach(record => {
                const card = document.createElement('div');
                card.className = 'col-md-6 col-lg-4';
                card.innerHTML = `
                    <div class="card record-card h-100" data-record-id="${record.id}">
                        <img src="data:image/jpeg;base64,${record.screenshot}" 
                             class="screenshot-preview" alt="${record.title}">
                        <div class="card-body">
                            <h5 class="card-title text-truncate" title="${record.title}">${record.title}</h5>
                            <p class="card-text text-muted small mb-2">
                                ${new Date(record.timestamp).toLocaleString()}
                            </p>
                            <p class="card-text text-truncate" title="${record.description}">
                                ${record.description}
                            </p>
                            <div class="tabs-preview">
                                ${record.tabs.map(tab => `
                                    <div class="tab-item d-flex align-items-center gap-2 mb-1">
                                        <img src="${tab.favIconUrl || 'images/kk-logo-16x16.png'}" 
                                             style="width: 16px; height: 16px;" alt="favicon">
                                        <span class="text-truncate">${tab.title}</span>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                `;
                container.appendChild(card);
            });

            // Kart tıklama olaylarını ekle
            document.querySelectorAll('.record-card').forEach(card => {
                card.addEventListener('click', () => showRecordDetail(card.dataset.recordId));
            });
        } catch (error) {
            console.error(chrome.i18n.getMessage('errorRecordsLoad'), error);
            alert(chrome.i18n.getMessage('errorRecordsLoad'));
        }
    };

    // Kayıt detayını göster
    const showRecordDetail = async (recordId) => {
        try {
            console.log('Kayıt detayı gösteriliyor:', recordId);
            const { saves = [] } = await chrome.storage.local.get(['saves']);
            const record = saves.find(r => r.id === parseInt(recordId));
            
            if (!record) {
                console.error('Kayıt bulunamadı:', recordId);
                return;
            }
            
            currentRecordId = record.id;
            document.getElementById('modalTitle').textContent = record.title;
            document.getElementById('modalScreenshot').src = `data:image/jpeg;base64,${record.screenshot}`;
            document.getElementById('modalDescription').textContent = record.description;
            
            const tabsContainer = document.getElementById('modalTabs');
            tabsContainer.innerHTML = record.tabs.map(tab => `
                <a href="${tab.url}" class="list-group-item list-group-item-action" target="_blank">
                    <div class="d-flex align-items-center gap-2">
                        <img src="${tab.favIconUrl || 'images/kk-logo-16x16.png'}" 
                             style="width: 16px; height: 16px;" alt="favicon">
                        <span>${tab.title}</span>
                    </div>
                </a>
            `).join('');
            
            if (modal) {
                modal.show();
            } else {
                console.error('Modal bulunamadı');
            }
        } catch (error) {
            console.error('Kayıt detayı gösterilirken hata:', error);
        }
    };

    // Kayıt silme
    document.getElementById('deleteRecordBtn').addEventListener('click', async () => {
        if (!currentRecordId) return;
        
        if (confirm(chrome.i18n.getMessage('deleteConfirm'))) {
            try {
                const { saves = [] } = await chrome.storage.local.get(['saves']);
                const updatedSaves = saves.filter(record => record.id !== currentRecordId);
                await chrome.storage.local.set({ saves: updatedSaves });
                
                if (modal) {
                    modal.hide();
                }
                await loadRecords();
            } catch (error) {
                console.error(chrome.i18n.getMessage('errorRecordDelete'), error);
                alert(chrome.i18n.getMessage('errorRecordDelete'));
            }
        }
    });

    // Dışa aktarma
    document.getElementById('exportBtn').addEventListener('click', async () => {
        try {
            const { saves = [] } = await chrome.storage.local.get(['saves']);
            const blob = new Blob([JSON.stringify(saves, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            const date = new Date().toISOString().split('T')[0];
            a.download = chrome.i18n.getMessage('exportFileName').replace('{date}', date);
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error(chrome.i18n.getMessage('errorExport'), error);
            alert(chrome.i18n.getMessage('errorExport'));
        }
    });

    // İçe aktarma
    document.getElementById('importBtn').addEventListener('click', () => {
        document.getElementById('importInput').click();
    });

    document.getElementById('importInput').addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            const reader = new FileReader();
            reader.onload = async (event) => {
                try {
                    const importedSaves = JSON.parse(event.target.result);
                    const { saves = [] } = await chrome.storage.local.get(['saves']);
                    
                    // Mevcut kayıtlarla birleştir
                    const mergedSaves = [...saves];
                    importedSaves.forEach(importedRecord => {
                        if (!saves.some(save => save.id === importedRecord.id)) {
                            mergedSaves.push(importedRecord);
                        }
                    });
                    
                    await chrome.storage.local.set({ saves: mergedSaves });
                    await loadRecords();
                    alert(chrome.i18n.getMessage('importSuccess'));
                } catch (error) {
                    console.error(chrome.i18n.getMessage('importError'), error);
                    alert(chrome.i18n.getMessage('importError'));
                }
            };
            reader.readAsText(file);
        } catch (error) {
            console.error(chrome.i18n.getMessage('errorFileRead'), error);
            alert(chrome.i18n.getMessage('errorFileRead'));
        }
    });

    // Sayfa yüklendiğinde kayıtları göster
    await loadRecords();
}); 
chrome.runtime.onInstalled.addListener(function () {
    chrome.i18n.getAcceptLanguages(function(languageList) {
        var title = "Easly Save It"
        if (languageList[0] == "tr") {
            title = "Kolay Kaydet"
        }
        chrome.contextMenus.create({
            "id": "EaslySaveIt",
            "title": title,
            "contexts": [
                'page',
                'selection',
                'link',
                'editable',
                'image',
                'video',
                'audio'
            ],
        });
    });
});

chrome.contextMenus.onClicked.addListener(async () => {
    chrome.windows.getCurrent((tabWindow) => {
        const popupWidth = 700;
        const popupHeight = 550;
        const leftOffset = (tabWindow.width/2)-(popupWidth/2);
        const topOffset = (tabWindow.height/2)-(popupHeight/2); 
        
        chrome.i18n.getAcceptLanguages(function(languageList) {
            chrome.tabs.query({ active: true, lastFocusedWindow: true }, function(tab) {
                chrome.tabs.query({}, function(tabs) {
                    const currentTab = tab
                    
                    chrome.tabs.captureVisibleTab(null, { quality: 100 }, function (image) {
                        const base64 = image.replace('data:', '').replace(/^.+,/, '');
                        
                        chrome.storage.local.set({ image: base64 }, function() {
                            chrome.storage.local.set({ currentTab: currentTab }, function() {
                                chrome.storage.local.set({ tabs: tabs }, function() {
                                    chrome.storage.local.set({ language: languageList[0] }, function() {
                                        chrome.windows.create({
                                            url : chrome.runtime.getURL('save.html'),
                                            focused : true,
                                            type : "popup",
                                            width : popupWidth,
                                            height : popupHeight,
                                            top : topOffset,
                                            left: leftOffset
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    });
});
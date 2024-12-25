// Default settings
const defaultSettings = {
    bggBackground: true,
    youtubeBackground: true,
    amazonBackground: true,
    oracleBackground: true,
    searchAllBackground: true
};

document.addEventListener('DOMContentLoaded', async function() {
    console.log('Popup: Loaded');
    const selectedTextElement = document.getElementById('selected-text');
    
    // Load settings
    const settings = await chrome.storage.sync.get(defaultSettings);
    
    // Set checkbox states
    document.getElementById('bggBackground').checked = settings.bggBackground;
    document.getElementById('youtubeBackground').checked = settings.youtubeBackground;
    document.getElementById('amazonBackground').checked = settings.amazonBackground;
    document.getElementById('oracleBackground').checked = settings.oracleBackground;
    document.getElementById('searchAllBackground').checked = settings.searchAllBackground;
    
    // Get selected text from background script
    chrome.runtime.sendMessage({type: 'GET_SELECTED_TEXT'}, function(response) {
        if (response && response.text) {
            console.log('Popup: Received text:', response.text);
            selectedTextElement.textContent = "https://boardgamegeek.com/geeksearch.php?action=search&objecttype=boardgame&q=" + response.text;
        } else {
            selectedTextElement.textContent = 'No text selected';
        }
    });
});

// Listen for updates while popup is open
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'TEXT_SELECTED') {
        const selectedTextElement = document.getElementById('selected-text');
        selectedTextElement.textContent = message.text;
        sendResponse({received: true});
    }
});

// Save settings when changed
const checkboxIds = ['bggBackground', 'youtubeBackground', 'amazonBackground', 'oracleBackground', 'searchAllBackground'];

checkboxIds.forEach(id => {
    document.getElementById(id).addEventListener('change', async (event) => {
        const setting = {};
        setting[id] = event.target.checked;
        await chrome.storage.sync.set(setting);
    });
}); 
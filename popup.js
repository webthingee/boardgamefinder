// Default settings
const defaultSettings = {
    bggBackground: true,
    youtubeBackground: true,
    amazonBackground: true,
    oracleBackground: true,
    searchAllBackground: true,
    appendYoutube: true,
    appendYoutubeSolo: false,
    appendAmazon: true
};

document.addEventListener('DOMContentLoaded', async function() {
    // Load settings
    const settings = await chrome.storage.sync.get(defaultSettings);
    
    // Set checkbox states
    document.getElementById('bggBackground').checked = settings.bggBackground;
    document.getElementById('youtubeBackground').checked = settings.youtubeBackground;
    document.getElementById('amazonBackground').checked = settings.amazonBackground;
    document.getElementById('oracleBackground').checked = settings.oracleBackground;
    document.getElementById('searchAllBackground').checked = settings.searchAllBackground;
    document.getElementById('appendYoutube').checked = settings.appendYoutube;
    document.getElementById('appendYoutubeSolo').checked = settings.appendYoutubeSolo;
    document.getElementById('appendAmazon').checked = settings.appendAmazon;
});

// Save settings when changed
const checkboxIds = [
    'bggBackground', 
    'youtubeBackground', 
    'amazonBackground', 
    'oracleBackground', 
    'searchAllBackground',
    'appendYoutube',
    'appendYoutubeSolo',
    'appendAmazon'
];

checkboxIds.forEach(id => {
    document.getElementById(id).addEventListener('change', async (event) => {
        const setting = {};
        setting[id] = event.target.checked;
        await chrome.storage.sync.set(setting);
    });
}); 
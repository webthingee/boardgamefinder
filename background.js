// Keep track of the selected text globally
let selectedText = '';

// Function to get menu title for YouTube
async function getYouTubeMenuTitle() {
    const settings = await chrome.storage.sync.get({
        appendYoutube: true,
        appendYoutubeSolo: false
    });
    
    let suffix = '';
    if (settings.appendYoutube) suffix += ' board game';
    if (settings.appendYoutubeSolo) suffix += ' solo';
    
    return `📺 YouTube${suffix ? ` (+ "${suffix.trim()}")` : ''}`;
}

// Add this function for Amazon menu title
async function getAmazonMenuTitle() {
    const settings = await chrome.storage.sync.get({
        appendAmazon: true
    });
    
    return `🛒 Amazon${settings.appendAmazon ? ' (+ "board game")' : ''}`;
}

// Initialize default settings when extension is installed
chrome.runtime.onInstalled.addListener(async () => {
    chrome.storage.sync.set({
        bggBackground: true,
        youtubeBackground: true,
        amazonBackground: true,
        oracleBackground: true,
        searchAllBackground: true,
        appendYoutube: true,
        appendYoutubeSolo: false,
        appendAmazon: true
    });
    
    // Create parent menu
    chrome.contextMenus.create({
        id: "searchParent",
        title: "Find Game '%s' on...",
        contexts: ["selection"]
    });

    // Create BGG submenu item
    chrome.contextMenus.create({
        id: "searchBGG",
        parentId: "searchParent",
        title: "🎲 Board Game Geek",
        contexts: ["selection"]
    });

    // Create YouTube submenu item with dynamic title
    const youtubeTitle = await getYouTubeMenuTitle();
    chrome.contextMenus.create({
        id: "searchYoutube",
        parentId: "searchParent",
        title: youtubeTitle,
        contexts: ["selection"]
    });

    // Create Amazon submenu item with dynamic title
    const amazonTitle = await getAmazonMenuTitle();
    chrome.contextMenus.create({
        id: "searchAmazon",
        parentId: "searchParent",
        title: amazonTitle,
        contexts: ["selection"]
    });

    // Create BoardGameOracle submenu item
    chrome.contextMenus.create({
        id: "searchOracle",
        parentId: "searchParent",
        title: "🌎 Board Game Oracle",
        contexts: ["selection"]
    });

    // Create "Search All" menu item last
    chrome.contextMenus.create({
        id: "searchAll",
        parentId: "searchParent",
        title: "🔍 Everywhere",
        contexts: ["selection"]
    });
});

// Function to get a specific background setting
async function shouldOpenInBackground(service) {
    const result = await chrome.storage.sync.get(service + 'Background');
    return result[service + 'Background'];
}

// Function to get search suffix based on settings
async function getSearchSuffix(service) {
    const settings = await chrome.storage.sync.get({
        appendYoutube: true,
        appendYoutubeSolo: false,
        appendAmazon: true
    });
    
    if (service === 'youtube') {
        let suffix = '';
        if (settings.appendYoutube) suffix += ' board game';
        if (settings.appendYoutubeSolo) suffix += ' solo';
        return suffix;
    }
    if (service === 'amazon' && settings.appendAmazon) return " board game";
    return "";
}

// Function to open all search URLs
async function openAllSearches(searchText) {
    const youtubeSuffix = await getSearchSuffix('youtube');
    const amazonSuffix = await getSearchSuffix('amazon');
    
    const urls = [
        `https://www.youtube.com/results?search_query=${encodeURIComponent(searchText + youtubeSuffix)}`,
        `https://www.amazon.com/s?k=${encodeURIComponent(searchText + amazonSuffix)}&i=toys-and-games`,
        `https://www.boardgameoracle.com/boardgame/search?q=${encodeURIComponent(searchText)}`,
        `https://boardgamegeek.com/geeksearch.php?action=search&q=${encodeURIComponent(searchText)}&objecttype=boardgame`
    ];

    const openInBackground = await shouldOpenInBackground('searchAll');
    
    // Create all tabs first and collect their IDs
    const tabIds = [];
    for (const url of urls) {
        const tab = await chrome.tabs.create({ 
            url, 
            active: !openInBackground 
        });
        tabIds.push(tab.id);
    }

    // Create a group for the tabs
    const group = await chrome.tabs.group({ tabIds });
    
    // Optionally, you can set a color and name for the group
    await chrome.tabGroups.update(group, {
        title: ` 🔍 ${searchText}`,
        color: 'blue'
    });
}

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
    const searchText = info.selectionText;
    
    switch(info.menuItemId) {
        case "searchBGG":
            const bggUrl = `https://boardgamegeek.com/geeksearch.php?action=search&q=${encodeURIComponent(searchText)}&objecttype=boardgame`;
            const bggBackground = await shouldOpenInBackground('bgg');
            chrome.tabs.create({ url: bggUrl, active: !bggBackground });
            break;
            
        case "searchYoutube":
            const youtubeSuffix = await getSearchSuffix('youtube');
            const youtubeUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(searchText + youtubeSuffix)}`;
            const youtubeBackground = await shouldOpenInBackground('youtube');
            chrome.tabs.create({ url: youtubeUrl, active: !youtubeBackground });
            break;

        case "searchAmazon":
            const amazonSuffix = await getSearchSuffix('amazon');
            const amazonUrl = `https://www.amazon.com/s?k=${encodeURIComponent(searchText + amazonSuffix)}&i=toys-and-games`;
            const amazonBackground = await shouldOpenInBackground('amazon');
            chrome.tabs.create({ url: amazonUrl, active: !amazonBackground });
            break;
        
        case "searchOracle":
            const oracleUrl = `https://www.boardgameoracle.com/boardgame/search?q=${encodeURIComponent(searchText)}`;
            const oracleBackground = await shouldOpenInBackground('oracle');
            chrome.tabs.create({ url: oracleUrl, active: !oracleBackground });
            break;

        case "searchAll":
            openAllSearches(searchText);
            break;
    }
});

// Listen for messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'TEXT_SELECTED') {
        selectedText = message.text;
        sendResponse({received: true});
    } else if (message.type === 'GET_SELECTED_TEXT') {
        sendResponse({text: selectedText});
    }
    return true; // Required for async response
});

// Listen for settings changes to update menu
chrome.storage.onChanged.addListener(async (changes, namespace) => {
    if (namespace === 'sync') {
        if (changes.appendYoutube || changes.appendYoutubeSolo) {
            const newTitle = await getYouTubeMenuTitle();
            chrome.contextMenus.update("searchYoutube", {
                title: newTitle
            });
        }
        if (changes.appendAmazon) {
            const newTitle = await getAmazonMenuTitle();
            chrome.contextMenus.update("searchAmazon", {
                title: newTitle
            });
        }
    }
}); 
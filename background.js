// Keep track of the selected text globally
let selectedText = '';

// Initialize default settings when extension is installed
chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.sync.set({
        bggBackground: true,
        youtubeBackground: true,
        amazonBackground: true,
        oracleBackground: true,
        searchAllBackground: true
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

    // Create YouTube submenu item
    chrome.contextMenus.create({
        id: "searchYoutube",
        parentId: "searchParent",
        title: "📺 YouTube",
        contexts: ["selection"]
    });

    // Create Amazon submenu item
    chrome.contextMenus.create({
        id: "searchAmazon",
        parentId: "searchParent",
        title: "🛒 Amazon",
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

// Function to open all search URLs
async function openAllSearches(searchText) {
    const urls = [
        `https://www.youtube.com/results?search_query=${encodeURIComponent(searchText + " board game")}`,
        `https://www.amazon.com/s?k=${encodeURIComponent(searchText + " board game")}&i=toys-and-games`,
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
        title: `${searchText} 🔍`,
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
            const youtubeUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(searchText + " board game")}`;
            const youtubeBackground = await shouldOpenInBackground('youtube');
            chrome.tabs.create({ url: youtubeUrl, active: !youtubeBackground });
            break;

        case "searchAmazon":
            const amazonUrl = `https://www.amazon.com/s?k=${encodeURIComponent(searchText + " board game")}&i=toys-and-games`;
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
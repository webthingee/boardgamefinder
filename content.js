document.addEventListener('mouseup', function() {
    const selectedText = window.getSelection().toString().trim();
    
    if (selectedText) {
        try {
            chrome.runtime.sendMessage({
                type: 'TEXT_SELECTED',
                text: selectedText
            }, function(response) {
                // Handle potential error when popup is not open
                if (chrome.runtime.lastError) {
                    console.log('Message not sent - popup may be closed');
                    return;
                }
            });
        } catch (e) {
            console.log('Error sending message:', e);
        }
    }
}); 
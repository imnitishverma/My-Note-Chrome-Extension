// Add color selection handling
const noteColorInput = document.getElementById('note-color');
const saveOptionsButton = document.getElementById('save-options');
const darkModeToggle = document.getElementById('darkModeToggle');

// Load saved preferences
chrome.storage.sync.get(['noteColor', 'darkMode'], (result) => {
    if (result.noteColor) {
        noteColorInput.value = result.noteColor;
    }
    if (result.darkMode) {
        darkModeToggle.checked = true;
        document.body.classList.add('dark-mode');
    } else {
        // Ensure dark mode is off if not explicitly enabled
        darkModeToggle.checked = false; 
        document.body.classList.remove('dark-mode');
    }
});

// Save note color
saveOptionsButton.addEventListener('click', () => {
    const noteColor = noteColorInput.value;
    chrome.storage.sync.set({ noteColor }, () => {
        alert('Note color saved.');
    });
});

// Handle dark mode toggle
darkModeToggle.addEventListener('change', () => {
    const enabled = darkModeToggle.checked;
    chrome.storage.sync.set({ darkMode: enabled }, () => {
        if (enabled) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
        // Optional: alert('Dark mode settings saved.');
    });
});

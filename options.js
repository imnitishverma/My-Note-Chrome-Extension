// Add color selection handling
const noteColorInput = document.getElementById('note-color');
const saveOptionsButton = document.getElementById('save-options');

chrome.storage.sync.get(['noteColor'], (result) => {
    if (result.noteColor) {
        noteColorInput.value = result.noteColor;
    }
});

saveOptionsButton.addEventListener('click', () => {
    const noteColor = noteColorInput.value;
    chrome.storage.sync.set({ noteColor }, () => {
        alert('Options saved.');
    });
});

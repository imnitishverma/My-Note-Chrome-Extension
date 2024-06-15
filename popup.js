document.addEventListener('DOMContentLoaded', () => {
  const notesSummary = document.getElementById('notes-summary');
  const showAllNotes = document.getElementById('show-all-notes');
  const hideAllNotes = document.getElementById('hide-all-notes');

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const activeTab = tabs[0];
    chrome.storage.local.get([activeTab.url], (result) => {
      if (result[activeTab.url]) {
        result[activeTab.url].forEach((note, index) => {
          const noteDiv = document.createElement('div');
          noteDiv.className = 'note-summary';
          noteDiv.innerText = note.text;
          notesSummary.appendChild(noteDiv);
        });
      }
    });
  });

  showAllNotes.addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        function: () => document.querySelectorAll('.note').forEach(note => note.style.display = 'block')
      });
    });
  });

  hideAllNotes.addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        function: () => document.querySelectorAll('.note').forEach(note => note.style.display = 'none')
      });
    });
  });
});

// Function to apply or remove dark mode
function applyDarkMode(enabled) {
  // Ensure document.body exists before trying to manipulate its classList
  if (document.body) {
    if (enabled) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }
}

// Initial application of dark mode
// Check if document.body is already available
if (document.body) {
  chrome.storage.sync.get('darkMode', (result) => {
    applyDarkMode(result.darkMode);
  });
} else {
  // If document.body is not available yet, wait for DOMContentLoaded
  window.addEventListener('DOMContentLoaded', () => {
    chrome.storage.sync.get('darkMode', (result) => {
      applyDarkMode(result.darkMode);
    });
  });
}

// Listen for changes in dark mode state
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'sync' && changes.darkMode) {
    applyDarkMode(changes.darkMode.newValue);
  }
});

// Existing content.js code
window.addEventListener('load', () => {
    loadNotes();

    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.action === 'createNote') {
            createNote();
        }
    });
});

function createNote() {
    const note = document.createElement('div');
    note.className = 'note';
    // note.contentEditable = true; // Content editable is handled by note-content div
    // note.style.position = 'absolute'; // Handled by CSS
    // note.style.top = '10px'; // Initial position, can be dynamic
    // note.style.left = '10px'; // Initial position, can be dynamic
    // note.style.width = '200px'; // Handled by CSS or dynamic
    // note.style.height = '200px'; // Handled by CSS or dynamic
    // note.style.backgroundColor = 'yellow'; // Now handled by CSS Variables
    // note.style.border = '1px solid black'; // Now handled by CSS Variables
    // note.style.zIndex = '10000'; // Handled by CSS

    // Set initial position for new notes (can be made more sophisticated)
    const existingNotes = document.querySelectorAll('.note');
    const topOffset = 10 + existingNotes.length * 20; // Basic stacking
    const leftOffset = 10 + existingNotes.length * 20;
    note.style.top = `${topOffset}px`;
    note.style.left = `${leftOffset}px`;

    note.innerHTML = `
        <div class="note-header">
            <button class="close-btn">&times;</button>
            <select class="color-picker">
                <option value="yellow" selected>Yellow</option>
                <option value="pink">Pink</option>
                <option value="lightblue">Light Blue</option>
                <option value="lightgreen">Light Green</option>
            </select>
        </div>
        <div class="note-content" contentEditable="true"></div>
    `;
    document.body.appendChild(note);

    const noteContent = note.querySelector('.note-content');
    noteContent.addEventListener('input', saveNotes); // Save on text input
    
    // Make the entire note draggable by its header
    const noteHeader = note.querySelector('.note-header');
    noteHeader.addEventListener('mousedown', (e) => dragStart(e, note));


    // Close button event
    note.querySelector('.close-btn').addEventListener('click', () => {
        note.remove();
        saveNotes();
    });

    // Color picker event
    note.querySelector('.color-picker').addEventListener('change', (e) => {
        // Instead of setting style directly, set a data attribute or class
        // For now, we keep direct style for background as it's per-note, not theme-dependent
        // note.style.backgroundColor = e.target.value; // REMOVED to adhere to theme
        saveNotes();
    });

    saveNotes(); // Save after creating a new note
}

function saveNotes() {
    const notes = Array.from(document.querySelectorAll('.note')).map(note => ({
        text: note.querySelector('.note-content').innerHTML, // Save HTML content
        top: note.style.top,
        left: note.style.left,
        width: note.style.width,
        height: note.style.height,
        // backgroundColor: note.style.backgroundColor // REMOVED to adhere to theme
    }));
    chrome.storage.local.set({ [location.href]: notes });
}

function loadNotes() {
    chrome.storage.local.get([location.href], (result) => {
        if (result[location.href]) {
            result[location.href].forEach(noteData => {
                const note = document.createElement('div');
                note.className = 'note';
                // note.contentEditable = true; // Handled by note-content
                note.style.position = 'absolute';
                note.style.top = noteData.top;
                note.style.left = noteData.left;
                note.style.width = noteData.width || '200px'; // Default width if not set
                note.style.height = noteData.height || '200px'; // Default height if not set
                // note.style.backgroundColor = noteData.backgroundColor || 'yellow'; // REMOVED to adhere to theme
                // note.style.border = '1px solid black'; // Handled by CSS variables
                // note.style.zIndex = '10000'; // Handled by CSS

                note.innerHTML = `
                    <div class="note-header">
                        <button class="close-btn">&times;</button>
                        <select class="color-picker">
                            <option value="yellow" ${noteData.backgroundColor === 'yellow' ? 'selected' : ''}>Yellow</option>
                            <option value="pink" ${noteData.backgroundColor === 'pink' ? 'selected' : ''}>Pink</option>
                            <option value="lightblue" ${noteData.backgroundColor === 'lightblue' ? 'selected' : ''}>Light Blue</option>
                            <option value="lightgreen" ${noteData.backgroundColor === 'lightgreen' ? 'selected' : ''}>Light Green</option>
                        </select>
                    </div>
                    <div class="note-content" contentEditable="true">${noteData.text || ''}</div>
                `;
                document.body.appendChild(note);

                const noteContent = note.querySelector('.note-content');
                noteContent.addEventListener('input', saveNotes);

                const noteHeader = note.querySelector('.note-header');
                noteHeader.addEventListener('mousedown', (e) => dragStart(e, note));


                note.querySelector('.close-btn').addEventListener('click', () => {
                    note.remove();
                    saveNotes();
                });

                note.querySelector('.color-picker').addEventListener('change', (e) => {
                    // note.style.backgroundColor = e.target.value; // REMOVED to adhere to theme
                    saveNotes();
                });
            });
        }
    });
}

function dragStart(e, noteElement) {
    // Prevent dragging if the event target is the color picker or close button
    if (e.target.classList.contains('color-picker') || e.target.classList.contains('close-btn') || e.target.tagName === 'SELECT' || e.target.tagName === 'OPTION' || e.target.tagName === 'BUTTON') {
        return;
    }
    
    const note = noteElement; // Use the passed note element

    const offsetX = e.clientX - parseInt(window.getComputedStyle(note).left);
    const offsetY = e.clientY - parseInt(window.getComputedStyle(note).top);

    function dragMove(e) {
        note.style.left = `${e.clientX - offsetX}px`;
        note.style.top = `${e.clientY - offsetY}px`;
        // No need to saveNotes on every mouse move, only on dragEnd
    }

    function dragEnd() {
        document.removeEventListener('mousemove', dragMove);
        document.removeEventListener('mouseup', dragEnd);
        saveNotes(); // Save notes once dragging is complete
    }

    document.addEventListener('mousemove', dragMove);
    document.addEventListener('mouseup', dragEnd);
}

chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: 'create-note',
        title: 'Create Note',
        contexts: ['page']
    });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === 'create-note') {
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: createNoteScript
        });
    }
});

function createNoteScript() {
    const note = document.createElement('div');
    note.className = 'note';
    note.contentEditable = true;
    note.style.position = 'absolute';
    note.style.top = '10px';
    note.style.left = '10px';
    note.style.width = '200px';
    note.style.height = '200px';
    note.style.backgroundColor = 'yellow';
    note.style.border = '1px solid black';
    note.style.zIndex = '10000';
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
    noteContent.addEventListener('input', saveNotes);
    note.addEventListener('mousedown', dragStart);

    // Close button event
    note.querySelector('.close-btn').addEventListener('click', () => {
        note.remove();
        saveNotes();
    });

    // Color picker event
    note.querySelector('.color-picker').addEventListener('change', (e) => {
        note.style.backgroundColor = e.target.value;
        saveNotes();
    });

    saveNotes();
}

function saveNotes() {
    const notes = Array.from(document.querySelectorAll('.note')).map(note => ({
        text: note.querySelector('.note-content').innerText,
        top: note.style.top,
        left: note.style.left,
        width: note.style.width,
        height: note.style.height,
        backgroundColor: note.style.backgroundColor
    }));
    chrome.storage.local.set({ [location.href]: notes });
}

function dragStart(e) {
    const note = e.target.closest('.note');
    if (!note) return;

    const offsetX = e.clientX - parseInt(note.style.left);
    const offsetY = e.clientY - parseInt(note.style.top);

    function dragMove(e) {
        note.style.left = `${e.clientX - offsetX}px`;
        note.style.top = `${e.clientY - offsetY}px`;
        saveNotes();
    }

    function dragEnd() {
        document.removeEventListener('mousemove', dragMove);
        document.removeEventListener('mouseup', dragEnd);
    }

    document.addEventListener('mousemove', dragMove);
    document.addEventListener('mouseup', dragEnd);
}

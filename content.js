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

function loadNotes() {
    chrome.storage.local.get([location.href], (result) => {
        if (result[location.href]) {
            result[location.href].forEach(noteData => {
                const note = document.createElement('div');
                note.className = 'note';
                note.contentEditable = true;
                note.style.position = 'absolute';
                note.style.top = noteData.top;
                note.style.left = noteData.left;
                note.style.width = noteData.width;
                note.style.height = noteData.height;
                note.style.backgroundColor = noteData.backgroundColor || 'yellow';
                note.style.border = '1px solid black';
                note.style.zIndex = '10000';
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
                    <div class="note-content" contentEditable="true">${noteData.text}</div>
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
            });
        }
    });
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

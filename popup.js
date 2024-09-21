const noteTitle = document.getElementById('noteTitle');
const noteContent = document.getElementById('noteContent');
const addButton = document.getElementById('addButton');
const notesList = document.getElementById('notesList');
const exportButton = document.getElementById('exportButton');

let editIndex = null;  // To track the note being edited

document.addEventListener('DOMContentLoaded', loadNotes);

addButton.addEventListener('click', () => {
    if (noteTitle.value && noteContent.value) {
        const newNote = {
            title: noteTitle.value,
            content: noteContent.value
        };

        if (editIndex !== null) {
            updateNote(editIndex, newNote);  // If editing, update the note
        } else {
            saveNote(newNote);  // If adding a new note, save it
        }

        // Clear the input fields and reset the edit state
        noteTitle.value = '';
        noteContent.value = '';
        addButton.textContent = 'Add Note';
        editIndex = null;
    }
});

function saveNote(note) {
    chrome.storage.local.get(['notes'], function(result) {
        const notes = result.notes || [];
        notes.push(note);
        chrome.storage.local.set({ notes }, loadNotes);
    });
}

function loadNotes() {
    chrome.storage.local.get(['notes'], function(result) {
        notesList.innerHTML = '';
        const notes = result.notes || [];
        notes.forEach((note, index) => {
            const noteElement = document.createElement('div');
            noteElement.className = 'note';
            noteElement.innerHTML = `
                <div class="note-header">
                    <h3 class="note-title">${note.title}</h3>
                    <button class="edit-button">Edit</button>
                    <button class="delete-button">Delete</button>
                </div>
                <div class="note-content hidden">${note.content}</div>
            `;
            notesList.appendChild(noteElement);

            // Toggle note content visibility
            const noteTitleElement = noteElement.querySelector('.note-title');
            const noteContentElement = noteElement.querySelector('.note-content');
            noteTitleElement.addEventListener('click', () => {
                noteContentElement.classList.toggle('hidden');
            });

            // Edit note
            const editButton = noteElement.querySelector('.edit-button');
            editButton.addEventListener('click', () => {
                editNote(index, note);  // Edit functionality
            });

            // Delete note
            const deleteButton = noteElement.querySelector('.delete-button');
            deleteButton.addEventListener('click', () => {
                deleteNote(index);
            });
        });
    });
}

function editNote(index, note) {
    // Prepopulate the input fields with the note to be edited
    noteTitle.value = note.title;
    noteContent.value = note.content;

    // Change button text to "Save Changes" to indicate editing
    addButton.textContent = 'Save Changes';

    // Track the index of the note being edited
    editIndex = index;
}

function updateNote(index, updatedNote) {
    chrome.storage.local.get(['notes'], function(result) {
        const notes = result.notes || [];
        notes[index] = updatedNote;  // Update the specific note
        chrome.storage.local.set({ notes }, loadNotes);
    });
}

function deleteNote(index) {
    chrome.storage.local.get(['notes'], function(result) {
        const notes = result.notes || [];
        notes.splice(index, 1);
        chrome.storage.local.set({ notes }, loadNotes);
    });
}

// Export notes as a .txt file
exportButton.addEventListener('click', () => {
    chrome.storage.local.get(['notes'], function(result) {
        const notes = result.notes || [];
        const noteText = notes.map(note => `${note.title}\n\n${note.content}`).join('\n\n-----\n\n');
        const blob = new Blob([noteText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'notes.txt';
        a.click();
        URL.revokeObjectURL(url);
    });
});

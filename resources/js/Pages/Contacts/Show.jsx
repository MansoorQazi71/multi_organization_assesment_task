import React from 'react';
import { Inertia } from '@inertiajs/inertia';

console.log('inertia', Inertia);

const Show = ({ contact }) => {

    // Ensure notes and meta are always arrays, even if undefined
    const notes = contact.notes || [];  // Default to an empty array if notes are undefined
    const meta = contact.contact_meta || [];  // Default to an empty array if contact_meta is undefined

    // Handle adding a note to the contact
    const handleAddNote = () => {
        const noteBody = prompt('Enter your note:');
        if (noteBody) {
            Inertia.post(`/contacts/${contact.id}/notes`, { body: noteBody });
        }
    };

    // Handle editing the contact
    const handleEditContact = () => {
        Inertia.visit(`/contacts/${contact.id}/edit`);
    };

    return (
        <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
            <h1 className="text-3xl font-semibold text-gray-800 mb-4">{contact.first_name} {contact.last_name}</h1>
            <p className="text-lg text-gray-600 mb-4">Email: {contact.email}</p>
            <p className="text-lg text-gray-600 mb-4">Phone: {contact.phone}</p>

            {/* Edit button */}
            <button 
                onClick={handleEditContact}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
            >
                Edit Contact
            </button>

            {/* Notes Section */}
            <div className="mt-8">
                <h2 className="text-2xl font-semibold text-gray-700">Notes</h2>
                <button
                    onClick={handleAddNote}
                    className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition mt-4"
                >
                    Add Note
                </button>
                <ul className="space-y-4 mt-6">
                    {notes.length === 0 ? (
                        <p className="text-gray-600">No notes available for this contact.</p>
                    ) : (
                        notes.map(note => (
                            <li key={note.id} className="bg-gray-50 p-4 rounded-md">
                                <p className="text-gray-800">{note.body}</p>
                                <small className="text-gray-500">By: {note.user.name}</small>
                            </li>
                        ))
                    )}
                </ul>
            </div>

            {/* Custom Fields Section (Contact Meta) */}
            <div className="mt-8">
                <h2 className="text-2xl font-semibold text-gray-700">Custom Fields</h2>
                <ul className="space-y-4 mt-6">
                    {meta.length === 0 ? (
                        <p className="text-gray-600">No custom fields available for this contact.</p>
                    ) : (
                        meta.map(metaItem => (
                            <li key={metaItem.id} className="bg-gray-50 p-4 rounded-md">
                                <p className="text-gray-800">{metaItem.key}: {metaItem.value}</p>
                            </li>
                        ))
                    )}
                </ul>
            </div>
        </div>
    );
};

export default Show;

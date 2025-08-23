import React, { useState } from 'react';
import { Inertia } from '@inertiajs/inertia';
import NavBar from '@/Components/NavBar';

const ManageOrganization = ({ organization }) => {
  const [selectedContact, setSelectedContact] = useState(null);

  const handleViewContact = (contactId) => Inertia.visit(`/contacts/${contactId}`);
  const handleEditContact = (contactId) => Inertia.visit(`/contacts/${contactId}/edit`);

  const handleDeleteContact = (contactId) => {
    if (confirm('Are you sure you want to delete this contact?')) {
      Inertia.delete(`/contacts/${contactId}`);
    }
  };

  const handleDuplicateContact = (contactId) => {
    // your route is POST contacts/{id}/duplicate
    Inertia.post(`/contacts/${contactId}/duplicate`);
  };

  const handleAddNote = (contactId) => {
    const noteBody = prompt('Enter your note:');
    if (noteBody) {
      Inertia.post(`/contacts/${contactId}/notes`, { body: noteBody });
    }
  };

  if (!organization) {
    return (
      <div className="min-h-screen bg-gray-100">
        <NavBar />
        <div className="max-w-4xl mx-auto p-6">Loading…</div>
      </div>
    );
  }

  const contacts = organization.contacts ?? [];

  return (
    <div className="min-h-screen bg-gray-100">
      <NavBar />
      <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
        <h1 className="text-3xl font-semibold text-gray-800 mb-4">
          {organization.name ?? 'Organization'} - Manage
        </h1>

        {/* Contacts */}
        <div className="mt-8">
          <h2 className="text-2xl font-semibold text-gray-700">Contacts</h2>
          <button
            onClick={() => Inertia.visit(`/contacts/create`)}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition mt-4"
          >
            Create New Contact
          </button>

          <ul className="space-y-4 mt-6">
            {contacts.map((contact) => (
              <li
                key={contact.id}
                className="flex justify-between items-center bg-white p-4 rounded-lg shadow-md hover:shadow-lg"
              >
                <span className="text-xl font-medium text-gray-800">
                  {(contact.first_name ?? '') + ' ' + (contact.last_name ?? '')}
                </span>

                <div className="flex space-x-2">
                  <button
                    onClick={() => handleViewContact(contact.id)}
                    className="bg-yellow-500 text-white px-3 py-1 rounded-md hover:bg-yellow-600"
                  >
                    View
                  </button>
                  <button
                    onClick={() => handleEditContact(contact.id)}
                    className="bg-yellow-500 text-white px-3 py-1 rounded-md hover:bg-yellow-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteContact(contact.id)}
                    className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600"
                  >
                    Delete
                  </button>
                  {/* <button
                    onClick={() => handleDuplicateContact(contact.id)}
                    className="bg-green-500 text-white px-3 py-1 rounded-md hover:bg-green-600"
                  >
                    Duplicate
                  </button> */}
                  <button
                    onClick={() => handleAddNote(contact.id)}
                    className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600"
                  >
                    Add Note
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Notes */}
        <div className="mt-8">
          <h2 className="text-2xl font-semibold text-gray-700">Notes</h2>
          <ul className="space-y-4 mt-6">
            {(contacts ?? []).flatMap((c) => (c.notes ?? [])).map((note) => (
              <li key={note.id} className="bg-gray-50 p-4 rounded-md">
                <p className="text-gray-800">{note.body ?? ''}</p>
                <small className="text-gray-500">
                  By: {note.user?.name ?? 'Unknown'}
                </small>
              </li>
            ))}
          </ul>
        </div>

        {/* Custom Fields */}
        <div className="mt-8">
          <h2 className="text-2xl font-semibold text-gray-700">Custom Fields</h2>
          <ul className="space-y-4 mt-6">
            {(contacts ?? []).flatMap((c) => (c.meta ?? [])).map((meta) => (
              <li key={meta.id} className="bg-gray-50 p-4 rounded-md">
                <p className="text-gray-800">
                  {meta.key ?? ''}: {meta.value ?? ''}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ManageOrganization;

import React from 'react';

import { Inertia } from '@inertiajs/inertia';

console.log('inertia', Inertia);

const Index = ({ contacts }) => {

    const handleDeleteContact = (contactId) => {
        if (confirm('Are you sure you want to delete this contact?')) {
            Inertia.delete(`/contacts/${contactId}`);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
            <h1 className="text-3xl font-semibold text-gray-800 mb-4">Contacts</h1>
            <button
                onClick={() => Inertia.visit('/contacts/create')}
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition mt-4"
            >
                Create New Contact
            </button>

            <ul className="space-y-4 mt-6">
                {contacts.map(contact => (
                    <li key={contact.id} className="flex justify-between items-center bg-white p-4 rounded-lg shadow-md hover:shadow-lg">
                        <span className="text-xl font-medium text-gray-800">{contact.first_name} {contact.last_name}</span>
                        <div className="flex space-x-2">
                            <button 
                                onClick={() => Inertia.visit(`/contacts/${contact.id}/edit`)}
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
                            <button
                                onClick={() => Inertia.visit(`/contacts/${contact.id}/duplicate`)}
                                className="bg-green-500 text-white px-3 py-1 rounded-md hover:bg-green-600"
                            >
                                Duplicate
                            </button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Index;

import React, { useState } from 'react';
import { Inertia } from '@inertiajs/inertia';

console.log('inertia', Inertia);

const Create = () => {
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        custom_fields: {},
        notes: [],  // Store notes as an array
    });

    // Handle input changes for standard fields (first name, last name, etc.)
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    };

    // Handle custom field input changes
    const handleCustomFieldChange = (key, value) => {
        setFormData((prevState) => ({
            ...prevState,
            custom_fields: {
                ...prevState.custom_fields,
                [key]: value,
            },
        }));
    };

    // Handle note input changes
    const handleNoteChange = (index, value) => {
        const updatedNotes = [...formData.notes];
        updatedNotes[index] = value;
        setFormData((prevState) => ({
            ...prevState,
            notes: updatedNotes,
        }));
    };

    // Add a new note input field
    const handleAddNote = () => {
        setFormData((prevState) => ({
            ...prevState,
            notes: [...prevState.notes, ''], // Add an empty note field
        }));
    };

    // Handle form submission
    const handleSubmit = (e) => {
        e.preventDefault();
        // Send form data including custom fields and notes to the backend via Inertia
        Inertia.post('/contacts/create', formData);
    };

    return (
        <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
            <h1 className="text-3xl font-semibold text-gray-800 mb-4">Create New Contact</h1>

            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    placeholder="First Name"
                    className="w-full p-2 border border-gray-300 rounded-md mb-4"
                />
                <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    placeholder="Last Name"
                    className="w-full p-2 border border-gray-300 rounded-md mb-4"
                />
                <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Email"
                    className="w-full p-2 border border-gray-300 rounded-md mb-4"
                />
                <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Phone"
                    className="w-full p-2 border border-gray-300 rounded-md mb-4"
                />

                {/* Custom Fields */}
                <div className="mt-4">
                    <h3 className="text-lg font-semibold text-gray-600">Custom Fields (meta data)</h3>
                    <input
                        type="text"
                        onChange={(e) => handleCustomFieldChange('field1', e.target.value)}
                        placeholder="Custom Field 1"
                        className="w-full p-2 border border-gray-300 rounded-md mb-4"
                    />
                    <input
                        type="text"
                        onChange={(e) => handleCustomFieldChange('field2', e.target.value)}
                        placeholder="Custom Field 2"
                        className="w-full p-2 border border-gray-300 rounded-md mb-4"
                    />
                </div>

                {/* Notes Section */}
                <div className="mt-4">
                    <h3 className="text-lg font-semibold text-gray-600">Notes</h3>
                    {formData.notes.map((note, index) => (
                        <div key={index} className="mb-4">
                            <textarea
                                value={note}
                                onChange={(e) => handleNoteChange(index, e.target.value)}
                                placeholder="Enter your note"
                                className="w-full p-2 border border-gray-300 rounded-md"
                            />
                        </div>
                    ))}
                    <button
                        type="button"
                        onClick={handleAddNote}
                        className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 mt-4"
                    >
                        Add Note
                    </button>
                </div>

                <button
                    type="submit"
                    className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 mt-6"
                >
                    Create Contact
                </button>
            </form>
        </div>
    );
};

export default Create;

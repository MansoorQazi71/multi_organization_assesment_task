import React, { useState } from 'react';
import { Inertia } from '@inertiajs/inertia-react';  // Correct import for Inertia

const CreateOrganization = () => {
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
    });

    const [errors, setErrors] = useState([]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        Inertia.post('/organizations/create', formData, {
            onError: (errors) => {
                setErrors(errors);  // Set form validation errors
            },
            onSuccess: () => {
                Inertia.visit('/organizations');  // Redirect to organizations list page
            },
        });
    };

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <div className="container mx-auto">
                <h1 className="text-3xl font-bold mb-6 text-gray-900">Create New Organization</h1>
                
                <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
                    <div className="mb-4">
                        <label htmlFor="name" className="block text-gray-700 font-semibold">Organization Name</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full mt-2 p-2 border border-gray-300 rounded-md"
                        />
                        {errors.name && <div className="text-red-500 text-sm mt-1">{errors.name}</div>}
                    </div>

                    <div className="mb-4">
                        <label htmlFor="slug" className="block text-gray-700 font-semibold">Organization Slug</label>
                        <input
                            type="text"
                            id="slug"
                            name="slug"
                            value={formData.slug}
                            onChange={handleChange}
                            className="w-full mt-2 p-2 border border-gray-300 rounded-md"
                        />
                        {errors.slug && <div className="text-red-500 text-sm mt-1">{errors.slug}</div>}
                    </div>

                    <button
                        type="submit"
                        className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                    >
                        Create Organization
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CreateOrganization;

import React, { useState } from 'react';
import { Inertia } from '@inertiajs/inertia';

console.log('inertia', Inertia);

const OrganizationIndex = ({ organizations }) => {
    const [selectedOrg, setSelectedOrg] = useState(null);

    const handleSwitchOrg = (orgId) => {
        // Use Inertia.get() for navigation
        Inertia.post(route('organizations.switch', orgId));
    };

    const handleCreateOrg = () => {
        // Use Inertia.get() for navigation to create organization page
        Inertia.get('/organization/create');
    };

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <div className="container mx-auto">
                <h1 className="text-3xl font-bold mb-6 text-gray-900">Organizations</h1>
                
                <button 
                    onClick={handleCreateOrg} 
                    className="bg-blue-500 text-white px-4 py-2 rounded-md mb-4 hover:bg-blue-600"
                >
                    Create New Organization
                </button>

                <ul className="space-y-4">
                    {organizations.map((org) => (
                        <li key={org.id} className="flex justify-between items-center bg-white p-4 rounded-lg shadow-md hover:shadow-lg">
                            <span className="text-xl font-medium text-gray-800">{org.name}</span>
                            
                            <button 
                                onClick={() => handleSwitchOrg(org.id)} 
                                className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600"
                            >
                                Switch
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default OrganizationIndex;

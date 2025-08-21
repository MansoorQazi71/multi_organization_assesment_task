import React from 'react';

const OrganizationShow = ({ organization }) => {
    return (
        <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
            <h1 className="text-3xl font-semibold text-gray-800 mb-4">{organization.name}</h1>
            <p className="text-lg text-gray-600">
                Welcome to the <span className="font-bold text-blue-500">{organization.name}</span> organization!
            </p>

            {/* Add any other sections related to the organization */}
            <div className="mt-8">
                <h2 className="text-2xl font-semibold text-gray-700">About</h2>
                <p className="text-gray-600 mt-2">
                    This is where you can add more information about the organization. You can include details like the 
                    organization’s mission, goals, or any other relevant data.
                </p>
            </div>

            {/* Additional styling or content can go here */}
            <div className="mt-6 flex items-center space-x-4">
                <button className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition">
                    Edit Organization
                </button>
                <button className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition">
                    Leave Organization
                </button>
            </div>
        </div>
    );
};

export default OrganizationShow;

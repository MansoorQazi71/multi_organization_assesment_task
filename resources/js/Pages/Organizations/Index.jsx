import React, { useState } from 'react';
import { Inertia } from '@inertiajs/inertia';
import { usePage, Link } from '@inertiajs/react';
import NavBar from '@/Components/NavBar';

const OrganizationIndex = ({ organizations }) => {
  const { props } = usePage();

  // Detect admin role from shared props; supports ['admin'] or [{name:'admin'}]
  const roles = props?.auth?.roles || props?.auth?.user?.roles || [];
  const isAdmin = Array.isArray(roles)
    ? roles.some(r => (typeof r === 'string' ? r : r?.name) === 'admin')
    : (props?.auth?.user?.role === 'admin' || props?.auth?.user?.is_admin === true);

  const [selectedOrg, setSelectedOrg] = useState(null);

  const handleSwitchOrg = (orgId) => {
    // Switch route is POST /switch-org/{orgId} (admin-only per your routes)
    Inertia.post(route('organizations.switch', orgId));
  };

  const handleCreateOrg = () => {
    Inertia.get(route('organizations.createForm'));
  };

  const handleEditOrg = (orgId) => {
    // You have GET organizations/{id}/manage (admin-only)
    Inertia.visit(route('organizations.manage', orgId));
  };

  const handleViewOrg = (orgId) => {
    Inertia.visit(route('organizations.show', orgId));
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <NavBar />

      <div className="max-w-5xl mx-auto p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Organizations</h1>
          {/* Admin-only create */}
          {isAdmin && (
            <button
              onClick={handleCreateOrg}
              className="rounded-md bg-gray-900 text-white px-4 py-2 hover:bg-gray-800 transition"
            >
              Create Organization
            </button>
          )}
        </div>

        <ul className="space-y-3 mt-6">
          {organizations.map((org) => (
            <li
              key={org.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-white p-4 shadow-sm ring-1 ring-gray-200"
            >
              <div className="min-w-0">
                <p className="text-lg font-medium text-gray-900 truncate">{org.name}</p>
                {/* Optional: link to show page for quick view */}
                <Link
                  href={route('organizations.show', org.id)}
                  className="text-sm text-gray-600 hover:text-gray-800 underline"
                >
                  View details
                </Link>
              </div>

              <div className="flex flex-wrap gap-2">
                {/* Everyone can view */}
                <button
                  onClick={() => handleViewOrg(org.id)}
                  className="px-3 py-1 rounded-md border border-gray-300 text-gray-800 hover:bg-gray-100"
                >
                  View
                </button>

                {/* Admin-only actions */}
                {isAdmin && (
                  <>
                    <button
                      onClick={() => handleEditOrg(org.id)}
                      className="px-3 py-1 rounded-md bg-gray-900 text-white hover:bg-gray-800"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleSwitchOrg(org.id)}
                      className="px-3 py-1 rounded-md border border-gray-300 text-gray-800 hover:bg-gray-100"
                    >
                      Switch
                    </button>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default OrganizationIndex;

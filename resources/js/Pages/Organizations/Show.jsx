import React from "react";
import { Inertia } from "@inertiajs/inertia";
import { usePage } from "@inertiajs/react";
import NavBar from "@/Components/NavBar";

const OrganizationShow = ({ organization }) => {
  const { props } = usePage();
  const user = props?.auth?.user;

  // Detect roles from shared props (supports ['admin'] or [{name:'admin'}])
  const roles = props?.auth?.roles || props?.auth?.user?.roles || [];
  const isAdmin = Array.isArray(roles)
    ? roles.some((r) => (typeof r === "string" ? r : r?.name) === "admin")
    : (props?.auth?.user?.role === "admin" || props?.auth?.user?.is_admin === true);

  const isOwner = !!user && organization?.owner_user_id === user.id;

  const handleEdit = () => Inertia.visit(`/organizations/${organization.id}/edit`);
  const handleLeave = () => {
    if (isOwner) return; // optionally block owner leaving
    Inertia.post(`/organizations/${organization.id}/leave`);
  };
  const handleManageContacts = () => Inertia.get(`/organizations/${organization.id}/manage`);
  const handleViewContacts = () => Inertia.visit(`/contacts`);

  if (!organization) {
    return (
      <div className="min-h-screen bg-gray-100">
        <NavBar />
        <div className="max-w-4xl mx-auto p-6">Loading…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <NavBar />
      <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
        <h1 className="text-3xl font-semibold text-gray-900 mb-2">
          {organization.name}
        </h1>
        <p className="text-sm text-gray-500 mb-6">
          Role: {isAdmin ? "Admin" : "Member"}{isOwner ? " • Owner" : ""}
        </p>

        {/* About */}
        <div>
          <h2 className="text-2xl font-semibold text-gray-800">About</h2>
          <p className="text-gray-600 mt-2">
            This is where you can add more information about the organization.
          </p>
        </div>

        {/* Actions */}
        <div className="mt-6 flex flex-wrap gap-3">
          {isAdmin ? (
            <>
              <button
                onClick={handleEdit}
                className="px-4 py-2 rounded-md bg-gray-900 text-white hover:bg-gray-800 transition"
              >
                Edit Organization
              </button>

              <button
                onClick={handleManageContacts}
                className="px-4 py-2 rounded-md border border-gray-300 text-gray-800 hover:bg-gray-100 transition"
              >
                Manage Contacts & Notes
              </button>

              {!isOwner && (
                <button
                  onClick={handleLeave}
                  className="px-4 py-2 rounded-md border border-gray-300 text-gray-800 hover:bg-gray-100 transition"
                >
                  Leave Organization
                </button>
              )}
              {isOwner && (
                <span className="text-xs text-gray-500 self-center">
                  Owners can’t leave their own organization.
                </span>
              )}
            </>
          ) : (
            <>
              <button
                onClick={handleViewContacts}
                className="px-4 py-2 rounded-md bg-gray-900 text-white hover:bg-gray-800 transition"
              >
                View Contacts
              </button>

              <button
                onClick={handleLeave}
                className="px-4 py-2 rounded-md border border-gray-300 text-gray-800 hover:bg-gray-100 transition"
              >
                Leave Organization
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrganizationShow;

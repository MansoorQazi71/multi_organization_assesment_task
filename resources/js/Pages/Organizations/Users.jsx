import React, { useState } from 'react';
import { Inertia } from '@inertiajs/inertia';
import NavBar from '@/Components/NavBar';

export default function OrgUsers({ organization, allUsers }) {
  const [adding, setAdding] = useState(false);
  const [updatingUserId, setUpdatingUserId] = useState(null);
  const [removingUserId, setRemovingUserId] = useState(null);

  const handleAdd = (e) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setAdding(true);
    Inertia.post(`/organizations/${organization.id}/users`, fd, {
      onFinish: () => setAdding(false),
    });
  };

  const handleRole = (userId, role) => {
    setUpdatingUserId(userId);
    Inertia.put(
      `/organizations/${organization.id}/users/${userId}`,
      { role },
      { onFinish: () => setUpdatingUserId(null) }
    );
  };

  const handleRemove = (userId) => {
    if (!confirm('Remove this user from the organization?')) return;
    setRemovingUserId(userId);
    Inertia.delete(`/organizations/${organization.id}/users/${userId}`, {
      onFinish: () => setRemovingUserId(null),
    });
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <NavBar />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900">
            {organization.name} — Members
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Invite users to this organization and set their org-level role.
          </p>
        </div>

        {/* Add user to org */}
        <form
          onSubmit={handleAdd}
          className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6 shadow-sm"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                User
              </label>
              <select
                name="user_id"
                className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-1 focus:ring-gray-400 bg-white"
                required
                defaultValue=""
              >
                <option value="" disabled>
                  Select a user…
                </option>
                {allUsers.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.email})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Role
              </label>
              <select
                name="role"
                className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-1 focus:ring-gray-400 bg-white"
                defaultValue="member"
              >
                <option value="member">Member</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                disabled={adding}
                className="w-full md:w-auto px-4 py-2 bg-black text-white rounded-md border border-black hover:bg-gray-900 disabled:opacity-60"
                aria-busy={adding}
              >
                {adding ? 'Adding…' : 'Add'}
              </button>
            </div>
          </div>
        </form>

        {/* Members list */}
        <div className="mt-8">
          {/* Table for md+ */}
          <div className="hidden md:block bg-white border border-gray-200 rounded-xl shadow-sm">
            <div className="overflow-x-auto rounded-xl">
              <table className="w-full text-left">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-xs font-medium text-gray-700 uppercase tracking-wide">
                      Name
                    </th>
                    <th className="px-4 py-3 text-xs font-medium text-gray-700 uppercase tracking-wide">
                      Email
                    </th>
                    <th className="px-4 py-3 text-xs font-medium text-gray-700 uppercase tracking-wide">
                      Role
                    </th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {organization.users.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-6 text-gray-500">
                        No members yet.
                      </td>
                    </tr>
                  ) : (
                    organization.users.map((u) => (
                      <tr key={u.id} className="border-t border-gray-100">
                        <td className="px-4 py-3 text-gray-900">{u.name}</td>
                        <td className="px-4 py-3 text-gray-700">{u.email}</td>
                        <td className="px-4 py-3">
                          <select
                            defaultValue={u.role}
                            onChange={(e) => handleRole(u.id, e.target.value)}
                            disabled={updatingUserId === u.id}
                            className="border border-gray-300 rounded-md p-2 bg-white disabled:opacity-60"
                            aria-busy={updatingUserId === u.id}
                          >
                            <option value="member">Member</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => handleRemove(u.id)}
                            disabled={removingUserId === u.id}
                            className="px-3 py-2 border border-gray-300 rounded-md text-red-600 hover:bg-gray-50 disabled:opacity-60"
                          >
                            {removingUserId === u.id ? 'Removing…' : 'Remove'}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Cards for < md */}
          <div className="md:hidden space-y-3">
            {organization.users.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-xl p-4 text-gray-600">
                No members yet.
              </div>
            ) : (
              organization.users.map((u) => (
                <div
                  key={u.id}
                  className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-base font-medium text-gray-900">
                        {u.name}
                      </div>
                      <div className="text-sm text-gray-600">{u.email}</div>
                    </div>
                    <button
                      onClick={() => handleRemove(u.id)}
                      disabled={removingUserId === u.id}
                      className="px-3 py-1.5 border border-gray-300 rounded-md text-red-600 hover:bg-gray-50 disabled:opacity-60"
                    >
                      {removingUserId === u.id ? '…' : 'Remove'}
                    </button>
                  </div>

                  <div className="mt-3">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Role
                    </label>
                    <select
                      defaultValue={u.role}
                      onChange={(e) => handleRole(u.id, e.target.value)}
                      disabled={updatingUserId === u.id}
                      className="w-full border border-gray-300 rounded-md p-2 bg-white disabled:opacity-60"
                    >
                      <option value="member">Member</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

import React from "react";
import { Head, Link, usePage, router } from "@inertiajs/react";
import NavBar from "@/Components/NavBar";

export default function Dashboard(props) {
  const {
    user,
    roles = [],
    isAdmin = false,
    orgs = [],
    currentOrg = null,
    counts = { contacts: 0, notes: 0 },
    recentContacts = [],
    recentNotes = [],
  } = props;

  const hasOrg = !!currentOrg;

  const handleSwitch = (e) => {
    const orgId = e.target.value;
    if (!orgId) return;
    // Your switch route is POST /switch-org/{orgId} and is admin-only in your routes
    router.post(route("organizations.switch", orgId));
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Head title="Dashboard" />
      <NavBar />

      <div className="mx-auto max-w-7xl p-6 space-y-8">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
            <p className="text-sm text-gray-500">
              Welcome back, {user?.name}. Role: {isAdmin ? "Admin" : "Member"}
            </p>
          </div>

          {/* Org switcher (admin only, per your route policy) */}
          {isAdmin && (
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-700">Organization</label>
              <select
                defaultValue={currentOrg?.id || ""}
                onChange={handleSwitch}
                className="border border-gray-300 rounded-md p-2 text-sm bg-white"
              >
                {orgs.length === 0 && <option value="">No organizations</option>}
                {orgs.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="bg-white rounded-lg shadow-sm ring-1 ring-gray-200 p-5">
            <div className="text-xs uppercase text-gray-500">Current Org</div>
            <div className="mt-2 text-lg font-medium text-gray-900">
              {hasOrg ? currentOrg.name : "No organization selected"}
            </div>
            <div className="mt-3">
              {hasOrg ? (
                <Link
                  href={route("organizations.show", currentOrg.id)}
                  className="text-sm underline text-gray-800 hover:text-gray-900"
                >
                  View organization →
                </Link>
              ) : (
                isAdmin && (
                  <Link
                    href={route("organizations.createForm")}
                    className="text-sm underline text-gray-800 hover:text-gray-900"
                  >
                    Create an organization →
                  </Link>
                )
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm ring-1 ring-gray-200 p-5">
            <div className="text-xs uppercase text-gray-500">Contacts</div>
            <div className="mt-2 text-3xl font-semibold text-gray-900">
              {counts.contacts ?? 0}
            </div>
            {hasOrg && (
              <div className="mt-3 flex gap-3">
                <Link
                  href={route("contacts.index")}
                  className="text-sm underline text-gray-800 hover:text-gray-900"
                >
                  View contacts
                </Link>
                {isAdmin && (
                  <Link
                    href={route("contacts.createForm")}
                    className="text-sm underline text-gray-800 hover:text-gray-900"
                  >
                    Create contact
                  </Link>
                )}
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-sm ring-1 ring-gray-200 p-5">
            <div className="text-xs uppercase text-gray-500">Notes</div>
            <div className="mt-2 text-3xl font-semibold text-gray-900">
              {counts.notes ?? 0}
            </div>
            {hasOrg && (
              <div className="mt-3">
                <Link
                  href={route("contacts.index")}
                  className="text-sm underline text-gray-800 hover:text-gray-900"
                >
                  Add / view notes
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm ring-1 ring-gray-200 p-5">
          <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
          <div className="mt-4 flex flex-wrap gap-3">
            {isAdmin ? (
              <>
                <Link
                  href={route("organizations.createForm")}
                  className="px-4 py-2 rounded-md bg-gray-900 text-white hover:bg-gray-800"
                >
                  Create Organization
                </Link>
                {hasOrg && (
                  <>
                    <Link
                      href={route("organizations.manage", currentOrg.id)}
                      className="px-4 py-2 rounded-md border border-gray-300 text-gray-800 hover:bg-gray-100"
                    >
                      Manage Organization
                    </Link>
                    <Link
                      href={`/organizations/${currentOrg.id}/users`} // adjust if you named the route
                      className="px-4 py-2 rounded-md border border-gray-300 text-gray-800 hover:bg-gray-100"
                    >
                      Manage Members
                    </Link>
                    <Link
                      href={route("contacts.createForm")}
                      className="px-4 py-2 rounded-md border border-gray-300 text-gray-800 hover:bg-gray-100"
                    >
                      New Contact
                    </Link>
                  </>
                )}
              </>
            ) : (
              <>
                <Link
                  href={route("contacts.index")}
                  className="px-4 py-2 rounded-md bg-gray-900 text-white hover:bg-gray-800"
                >
                  View Contacts
                </Link>
                {hasOrg && (
                  <Link
                    href={route("organizations.show", currentOrg.id)}
                    className="px-4 py-2 rounded-md border border-gray-300 text-gray-800 hover:bg-gray-100"
                  >
                    Organization Details
                  </Link>
                )}
              </>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Recent Contacts */}
          <div className="bg-white rounded-lg shadow-sm ring-1 ring-gray-200 p-5">
            <h3 className="text-lg font-semibold text-gray-900">Recent Contacts</h3>
            {recentContacts.length === 0 ? (
              <p className="mt-3 text-sm text-gray-500">No contacts yet.</p>
            ) : (
              <ul className="mt-4 divide-y divide-gray-200">
                {recentContacts.map((c) => (
                  <li key={c.id} className="py-3 flex items-center gap-3">
                    {c.avatar_url ? (
                      <img
                        src={c.avatar_url}
                        alt=""
                        className="h-10 w-10 rounded-full object-cover ring-1 ring-gray-200"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-sm text-gray-600">
                        {(c.name || "?")
                          .split(" ")
                          .map((p) => p[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0">
                      <Link
                        href={route("contacts.show", c.id)}
                        className="text-sm font-medium text-gray-900 underline"
                      >
                        {c.name || "Untitled"}
                      </Link>
                      <div className="text-xs text-gray-500">{c.email || "—"}</div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Recent Notes */}
          <div className="bg-white rounded-lg shadow-sm ring-1 ring-gray-200 p-5">
            <h3 className="text-lg font-semibold text-gray-900">Recent Notes</h3>
            {recentNotes.length === 0 ? (
              <p className="mt-3 text-sm text-gray-500">No notes yet.</p>
            ) : (
              <ul className="mt-4 divide-y divide-gray-200">
                {recentNotes.map((n) => (
                  <li key={n.id} className="py-3">
                    <div className="text-sm text-gray-900 line-clamp-2">{n.body}</div>
                    <div className="mt-1 text-xs text-gray-500">
                      by {n.user?.name || "Unknown"} on{" "}
                      {n.contact?.name ? (
                        <Link
                          href={route("contacts.show", n.contact.id)}
                          className="underline hover:text-gray-700"
                        >
                          {n.contact.name}
                        </Link>
                      ) : (
                        "Unknown contact"
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-gray-500 py-8">
          MULTI ORGANIZATION CONTACTS AND NOTES APPLICATION — powered by Zikra Infotech LLC
        </div>
      </div>
    </div>
  );
}

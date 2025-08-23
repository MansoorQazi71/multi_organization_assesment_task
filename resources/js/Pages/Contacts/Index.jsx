import React, { useState } from "react";
import { Inertia } from "@inertiajs/inertia";
import { usePage } from "@inertiajs/react";
import NavBar from "@/Components/NavBar";

const Index = ({ contacts, filters }) => {
  const { props } = usePage();
  const [q, setQ] = useState(filters?.q ?? "");

  const [busyIds, setBusyIds] = useState(new Set());

  const handleDeleteContact = (contactId) => {
    if (confirm("Are you sure you want to delete this contact?")) {
      Inertia.delete(`/contacts/${contactId}`);
    }
  };

  const handleDuplicate = (id) => {
    if (busyIds.has(id)) return;
    const next = new Set(busyIds);
    next.add(id);
    setBusyIds(next);

    Inertia.post(
      `/contacts/${id}/duplicate`,
      {},
      {
        onFinish: () => {
          setBusyIds((prev) => {
            const s = new Set(prev);
            s.delete(id);
            return s;
          });
        },
      }
    );
  };

  const submitSearch = (e) => {
    e.preventDefault();
    const params = q.trim() ? { q } : {};
    Inertia.get("/contacts", params, { preserveState: true, replace: true });
  };

  const clearSearch = () => {
    setQ("");
    Inertia.get("/contacts", {}, { preserveState: false, replace: true });
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <NavBar />
      <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h1 className="text-3xl font-semibold text-gray-800">Contacts</h1>
          <button
            onClick={() => Inertia.visit("/contacts/create")}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
          >
            Create New Contact
          </button>
        </div>

        {/* Search */}
        <form onSubmit={submitSearch} className="mt-4 flex gap-2">
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name or email…"
            className="flex-1 p-2 border border-gray-300 rounded-md"
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-md border border-gray-300 bg-gray-100 hover:bg-gray-200"
          >
            Search
          </button>
          {q?.trim() ? (
            <button
              type="button"
              onClick={clearSearch}
              className="px-4 py-2 rounded-md border border-gray-200 text-gray-700 hover:bg-gray-100"
            >
              Clear
            </button>
          ) : null}
        </form>

        {/* List */}
        <ul className="space-y-4 mt-6">
          {contacts.length === 0 ? (
            <li className="text-gray-500">No contacts found.</li>
          ) : (
            contacts.map((contact) => {
              const isBusy = busyIds.has(contact.id);
              return (
                <li
                  key={contact.id}
                  className="flex justify-between items-center bg-white p-4 rounded-lg shadow-md hover:shadow-lg"
                >
                  <span className="text-xl font-medium text-gray-800">
                    {(contact.first_name ?? "") + " " + (contact.last_name ?? "")}
                    {contact.email ? (
                      <span className="ml-2 text-sm text-gray-500">
                        &lt;{contact.email}&gt;
                      </span>
                    ) : null}
                  </span>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => Inertia.visit(`/contacts/${contact.id}`)}
                      className="bg-yellow-500 text-white px-3 py-1 rounded-md hover:bg-yellow-600"
                    >
                      View
                    </button>
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
                    {/* <button
                      onClick={() => handleDuplicate(contact.id)}
                      disabled={isBusy}
                      className={`bg-green-500 text-white px-3 py-1 rounded-md ${
                        isBusy ? "opacity-50 cursor-not-allowed" : "hover:bg-green-600"
                      }`}
                    >
                      {isBusy ? "Duplicating…" : "Duplicate"}
                    </button> */}
                  </div>
                </li>
              );
            })
          )}
        </ul>
      </div>
    </div>
  );
};

export default Index;

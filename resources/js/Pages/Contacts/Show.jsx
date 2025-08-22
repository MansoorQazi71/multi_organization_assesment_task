import React from "react";
import { Inertia } from "@inertiajs/inertia";
import NavBar from "@/Components/NavBar";
import { usePage } from "@inertiajs/react";

const Show = ({ contact }) => {
  const { props } = usePage();
  const duplicate = Boolean(props?.duplicate_detected); // 👈 now works

  const notes = contact.notes || [];
  const meta  = contact.meta  || [];

  const handleAddNote = () => {
    const noteBody = prompt("Enter your note:");
    if (noteBody) Inertia.post(`/contacts/${contact.id}/notes`, { body: noteBody });
  };

  const handleEditContact = () => Inertia.visit(`/contacts/${contact.id}/edit`);

  const avatarUrl =
    contact.avatar_url ?? (contact.avatar_path ? `/storage/${contact.avatar_path}` : null);

  const initials = `${(contact.first_name?.[0] || "").toUpperCase()}${(contact.last_name?.[0] || "").toUpperCase()}`;

  return (
    <div className="min-h-screen bg-gray-100">
      <NavBar />
      <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
        {duplicate && (
          <div className="mb-4 rounded border border-yellow-300 bg-yellow-50 p-3 text-yellow-800">
            Duplicate email detected. No new contact was created.
          </div>
        )}

        {/* header */}
        <div className="flex items-center gap-4 mb-6">
          {avatarUrl ? (
            <img src={avatarUrl} alt={`${contact.first_name || ""} ${contact.last_name || ""}`} className="h-24 w-24 rounded-full object-cover ring-1 ring-gray-200" />
          ) : (
            <div className="h-24 w-24 rounded-full bg-gray-200 flex items-center justify-center text-2xl font-semibold text-gray-600">
              {initials || "?"}
            </div>
          )}
          <div>
            <h1 className="text-3xl font-semibold text-gray-800">
              {contact.first_name} {contact.last_name}
            </h1>
            {contact.email && <p className="text-lg text-gray-600">Email: {contact.email}</p>}
            {contact.phone && <p className="text-lg text-gray-600">Phone: {contact.phone}</p>}
          </div>
        </div>

        {/* actions */}
        <div className="flex gap-3">
          <button onClick={handleEditContact} className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition">
            Edit Contact
          </button>
          <button onClick={handleAddNote} className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-black transition">
            Add Note
          </button>
        </div>

        {/* notes */}
        <div className="mt-8">
          <h2 className="text-2xl font-semibold text-gray-700">Notes</h2>
          <ul className="space-y-4 mt-6">
            {notes.length === 0 ? (
              <p className="text-gray-600">No notes available for this contact.</p>
            ) : (
              notes.map((note) => (
                <li key={note.id} className="bg-gray-50 p-4 rounded-md">
                  <p className="text-gray-800">{note.body}</p>
                  <small className="text-gray-500">By: {note.user?.name ?? "Unknown"}</small>
                </li>
              ))
            )}
          </ul>
        </div>

        {/* custom fields */}
        <div className="mt-8">
          <h2 className="text-2xl font-semibold text-gray-700">Custom Fields</h2>
          <ul className="space-y-4 mt-6">
            {(meta || []).length === 0 ? (
              <p className="text-gray-600">No custom fields available for this contact.</p>
            ) : (
              meta.map((m) => (
                <li key={m.id} className="bg-gray-50 p-4 rounded-md">
                  <p className="text-gray-800">{m.key}: {m.value}</p>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Show;

import React, { useState } from "react";
import { Inertia } from "@inertiajs/inertia";

const Edit = ({ contact }) => {
  // Safely normalize incoming props
  const initialCustomFields = Array.isArray(contact?.meta)
    ? contact.meta.reduce((acc, m) => {
        if (m?.key) acc[m.key] = m?.value ?? "";
        return acc;
      }, {})
    : {};

  const initialNotes = Array.isArray(contact?.notes)
    ? contact.notes
        .map((n) => n?.body ?? "")
        .filter((v) => typeof v === "string")
    : [];

  const [formData, setFormData] = useState({
    first_name: contact?.first_name ?? "",
    last_name: contact?.last_name ?? "",
    email: contact?.email ?? "",
    phone: contact?.phone ?? "",
    custom_fields: initialCustomFields, // { [key]: value }
    notes: initialNotes, // ["note 1", "note 2"]
  });

  // For adding a new custom field
  const [newField, setNewField] = useState({ key: "", value: "" });

  // Standard field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Update a custom field's value
  const handleCustomFieldValueChange = (key, value) => {
    setFormData((prev) => ({
      ...prev,
      custom_fields: { ...prev.custom_fields, [key]: value },
    }));
  };

  // (Optional) Rename a custom field key
  const handleRenameCustomFieldKey = (oldKey, newKey) => {
    if (!oldKey || !newKey || oldKey === newKey) return;
    setFormData((prev) => {
      const { [oldKey]: oldVal, ...rest } = prev.custom_fields;
      // If newKey already exists, it will be overwritten—adjust if you want to prevent that
      return {
        ...prev,
        custom_fields: { ...rest, [newKey]: oldVal },
      };
    });
  };

  // Remove a custom field entirely
  const handleRemoveCustomField = (key) => {
    setFormData((prev) => {
      const { [key]: _, ...rest } = prev.custom_fields;
      return { ...prev, custom_fields: rest };
    });
  };

  // Add a brand-new custom field
  const handleAddCustomField = () => {
    const key = newField.key.trim();
    if (!key) return;
    setFormData((prev) => ({
      ...prev,
      custom_fields: {
        ...prev.custom_fields,
        [key]: newField.value ?? "",
      },
    }));
    setNewField({ key: "", value: "" });
  };

  // Note changes
  const handleNoteChange = (index, value) => {
    setFormData((prev) => {
      const notes = [...prev.notes];
      notes[index] = value;
      return { ...prev, notes };
    });
  };

  const handleAddNote = () => {
    setFormData((prev) => ({ ...prev, notes: [...prev.notes, ""] }));
  };

  const handleRemoveNote = (index) => {
    setFormData((prev) => {
      const notes = prev.notes.filter((_, i) => i !== index);
      return { ...prev, notes };
    });
  };

  // Submit with the exact payload your backend expects
  const handleSubmit = (e) => {
    e.preventDefault();

    const payload = {
      first_name: formData.first_name,
      last_name: formData.last_name,
      email: formData.email,
      phone: formData.phone,
      custom_fields: formData.custom_fields, // key->value object
      notes: formData.notes, // array of strings
    };

    // Use Ziggy route if available; otherwise fallback to a RESTful URL
    const updateUrl =
      typeof route === "function"
        ? route("contact.update", contact.id) // adjust if your route name differs
        : `/contacts/${contact.id}`;

    Inertia.put(updateUrl, payload);
  };

  const customFieldEntries = Object.entries(formData.custom_fields);

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-3xl font-semibold text-gray-800 mb-4">
        Edit Contact
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Core fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            name="first_name"
            value={formData.first_name}
            onChange={handleChange}
            placeholder="First Name"
            className="w-full p-2 border border-gray-300 rounded-md"
          />
          <input
            type="text"
            name="last_name"
            value={formData.last_name}
            onChange={handleChange}
            placeholder="Last Name"
            className="w-full p-2 border border-gray-300 rounded-md"
          />
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email"
            className="w-full p-2 border border-gray-300 rounded-md"
          />
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="Phone"
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>

        {/* Custom Fields */}
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-3">
            Custom Fields
          </h3>

          {customFieldEntries.length === 0 && (
            <p className="text-sm text-gray-500 mb-2">
              No custom fields yet. Add one below.
            </p>
          )}

          <div className="space-y-4">
            {customFieldEntries.map(([key, value], idx) => (
              <div
                key={`${key}-${idx}`}
                className="grid grid-cols-1 md:grid-cols-5 gap-2 items-center"
              >
                {/* Key (rename-able) */}
                <input
                  type="text"
                  defaultValue={key}
                  onBlur={(e) =>
                    handleRenameCustomFieldKey(key, e.target.value.trim())
                  }
                  placeholder="Field key (e.g. twitter)"
                  className="md:col-span-2 w-full p-2 border border-gray-300 rounded-md"
                />
                {/* Value */}
                <input
                  type="text"
                  value={value}
                  onChange={(e) =>
                    handleCustomFieldValueChange(key, e.target.value)
                  }
                  placeholder="Field value (e.g. @handle)"
                  className="md:col-span-2 w-full p-2 border border-gray-300 rounded-md"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveCustomField(key)}
                  className="text-red-600 hover:text-red-700 px-3 py-2 border border-red-200 rounded-md"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          {/* Add new custom field */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-5 gap-2 items-center">
            <input
              type="text"
              value={newField.key}
              onChange={(e) =>
                setNewField((p) => ({ ...p, key: e.target.value }))
              }
              placeholder="New field key"
              className="md:col-span-2 w-full p-2 border border-gray-300 rounded-md"
            />
            <input
              type="text"
              value={newField.value}
              onChange={(e) =>
                setNewField((p) => ({ ...p, value: e.target.value }))
              }
              placeholder="New field value"
              className="md:col-span-2 w-full p-2 border border-gray-300 rounded-md"
            />
            <button
              type="button"
              onClick={handleAddCustomField}
              className="bg-gray-800 text-white px-4 py-2 rounded-md hover:bg-gray-900"
            >
              Add Field
            </button>
          </div>
        </div>

        {/* Notes */}
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-3">Notes</h3>

          {formData.notes.length === 0 && (
            <p className="text-sm text-gray-500 mb-2">
              No notes yet. Add one below.
            </p>
          )}

          <div className="space-y-4">
            {formData.notes.map((note, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-2">
                <textarea
                  value={note}
                  onChange={(e) => handleNoteChange(index, e.target.value)}
                  placeholder="Enter your note"
                  className="md:col-span-4 w-full p-2 border border-gray-300 rounded-md"
                  rows={3}
                />
                <button
                  type="button"
                  onClick={() => handleRemoveNote(index)}
                  className="text-red-600 hover:text-red-700 px-3 py-2 border border-red-200 rounded-md h-fit"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={handleAddNote}
            className="mt-3 bg-gray-100 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-200 border"
          >
            Add Note
          </button>
        </div>

        {/* Submit */}
        <div className="pt-2">
          <button
            type="submit"
            className="bg-blue-600 text-white px-5 py-2 rounded-md hover:bg-blue-700"
          >
            Update Contact
          </button>
        </div>
      </form>
    </div>
  );
};

export default Edit;

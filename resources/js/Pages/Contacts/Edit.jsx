import React, { useState } from "react";
import { Inertia } from "@inertiajs/inertia";
import NavBar from "@/Components/NavBar";

const Edit = ({ contact }) => {
    // --- build a URL for the existing avatar (if your model exposes avatar_url use that) ---
    const initialAvatarUrl =
        contact?.avatar_url ??
        (contact?.avatar_path ? `/storage/${contact.avatar_path}` : null);

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
        custom_fields: initialCustomFields,
        notes: initialNotes,
    });

    // --- NEW: avatar state ---
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(initialAvatarUrl);
    const [removeAvatar, setRemoveAvatar] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files?.[0] || null;
        setAvatarFile(file);
        setRemoveAvatar(false); // if picking a file, don't remove
        if (file) setAvatarPreview(URL.createObjectURL(file));
    };

    const handleRemoveAvatarToggle = (e) => {
        const on = e.target.checked;
        setRemoveAvatar(on);
        if (on) {
            setAvatarFile(null);
            setAvatarPreview(null);
        } else {
            setAvatarPreview(initialAvatarUrl);
        }
    };

    const handleCustomFieldValueChange = (key, value) => {
        setFormData((prev) => ({
            ...prev,
            custom_fields: { ...prev.custom_fields, [key]: value },
        }));
    };

    const handleRenameCustomFieldKey = (oldKey, newKey) => {
        if (!oldKey || !newKey || oldKey === newKey) return;
        setFormData((prev) => {
            const { [oldKey]: oldVal, ...rest } = prev.custom_fields;
            return { ...prev, custom_fields: { ...rest, [newKey]: oldVal } };
        });
    };

    const handleRemoveCustomField = (key) => {
        setFormData((prev) => {
            const { [key]: _, ...rest } = prev.custom_fields;
            return { ...prev, custom_fields: rest };
        });
    };

    const [newField, setNewField] = useState({ key: "", value: "" });
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

    const handleNoteChange = (index, value) => {
        setFormData((prev) => {
            const notes = [...prev.notes];
            notes[index] = value;
            return { ...prev, notes };
        });
    };
    const handleAddNote = () =>
        setFormData((p) => ({ ...p, notes: [...p.notes, ""] }));
    const handleRemoveNote = (index) =>
        setFormData((prev) => ({
            ...prev,
            notes: prev.notes.filter((_, i) => i !== index),
        }));

    // --- SUBMIT AS FORMDATA (to send file). Use POST + _method=put for Inertia ---
    const handleSubmit = (e) => {
        e.preventDefault();

        const data = new FormData();
        data.append("_method", "put");
        data.append("first_name", formData.first_name);
        data.append("last_name", formData.last_name);
        if (formData.email) data.append("email", formData.email);
        if (formData.phone) data.append("phone", formData.phone);

        // custom_fields[field]=value (skip blanks)
        Object.entries(formData.custom_fields || {}).forEach(([k, v]) => {
            const val = typeof v === "string" ? v.trim() : v;
            if (val !== undefined && val !== null && val !== "") {
                data.append(`custom_fields[${k}]`, val);
            }
        });

        // notes[] (skip blanks)
        (formData.notes || []).forEach((n) => {
            const val = (n || "").trim();
            if (val !== "") data.append("notes[]", val);
        });

        if (avatarFile) data.append("avatar", avatarFile);
        data.append("remove_avatar", removeAvatar ? "1" : "0");

        // Edit.jsx — in handleSubmit
        Inertia.post(route("contacts.update", contact.id), data, {
            forceFormData: true,
        });
    };

    const customFieldEntries = Object.entries(formData.custom_fields);

    // initials fallback (optional)
    const initials = `${(formData.first_name?.[0] || "").toUpperCase()}${(
        formData.last_name?.[0] || ""
    ).toUpperCase()}`;

    return (
        <div className="min-h-screen bg-gray-100">
            <NavBar />
            <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
                <h1 className="text-3xl font-semibold text-gray-800 mb-4">
                    Edit Contact
                </h1>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Avatar block */}
                    <div className="flex items-center gap-4">
                        {avatarPreview ? (
                            <img
                                src={avatarPreview}
                                alt="Avatar preview"
                                className="h-20 w-20 rounded-full object-cover ring-1 ring-gray-200"
                            />
                        ) : (
                            <div className="h-20 w-20 rounded-full bg-gray-200 flex items-center justify-center text-xl font-semibold text-gray-600">
                                {initials || "?"}
                            </div>
                        )}
                        <div className="space-y-2">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleAvatarChange}
                            />
                            <label className="flex items-center gap-2 text-sm text-gray-700">
                                <input
                                    type="checkbox"
                                    checked={removeAvatar}
                                    onChange={handleRemoveAvatarToggle}
                                />
                                Remove avatar
                            </label>
                            <p className="text-xs text-gray-500">
                                JPG, PNG, WEBP, AVIF up to 2 MB.
                            </p>
                        </div>
                    </div>

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

                    {/* Custom fields (unchanged) */}
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
                                    <input
                                        type="text"
                                        defaultValue={key}
                                        onBlur={(e) =>
                                            handleRenameCustomFieldKey(
                                                key,
                                                e.target.value.trim()
                                            )
                                        }
                                        placeholder="Field key (e.g. twitter)"
                                        className="md:col-span-2 w-full p-2 border border-gray-300 rounded-md"
                                    />
                                    <input
                                        type="text"
                                        value={value}
                                        onChange={(e) =>
                                            handleCustomFieldValueChange(
                                                key,
                                                e.target.value
                                            )
                                        }
                                        placeholder="Field value (e.g. @handle)"
                                        className="md:col-span-2 w-full p-2 border border-gray-300 rounded-md"
                                    />
                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleRemoveCustomField(key)
                                        }
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
                                    setNewField((p) => ({
                                        ...p,
                                        key: e.target.value,
                                    }))
                                }
                                placeholder="New field key"
                                className="md:col-span-2 w-full p-2 border border-gray-300 rounded-md"
                            />
                            <input
                                type="text"
                                value={newField.value}
                                onChange={(e) =>
                                    setNewField((p) => ({
                                        ...p,
                                        value: e.target.value,
                                    }))
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

                    {/* Notes (unchanged structure) */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-700 mb-3">
                            Notes
                        </h3>
                        {formData.notes.length === 0 && (
                            <p className="text-sm text-gray-500 mb-2">
                                No notes yet. Add one below.
                            </p>
                        )}
                        <div className="space-y-4">
                            {formData.notes.map((note, index) => (
                                <div
                                    key={index}
                                    className="grid grid-cols-1 md:grid-cols-5 gap-2"
                                >
                                    <textarea
                                        value={note}
                                        onChange={(e) =>
                                            handleNoteChange(
                                                index,
                                                e.target.value
                                            )
                                        }
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
        </div>
    );
};

export default Edit;

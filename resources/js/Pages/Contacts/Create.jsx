import React, { useState } from "react";
import { Inertia } from "@inertiajs/inertia";
import axios from "axios";
import NavBar from "@/Components/NavBar";

const Create = () => {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    custom_fields: {},
    notes: [],
  });
  const [avatar, setAvatar] = useState(null);
  const [errors, setErrors] = useState({}); // Laravel validator errors

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0] || null;
    setAvatar(file);
  };

  const handleCustomFieldChange = (key, value) => {
    setFormData((prev) => ({
      ...prev,
      custom_fields: { ...prev.custom_fields, [key]: value },
    }));
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    const data = new FormData();
    data.append("first_name", formData.first_name);
    data.append("last_name", formData.last_name);
    if (formData.email) data.append("email", formData.email);
    if (formData.phone) data.append("phone", formData.phone);

    // custom_fields[field]=value
    Object.entries(formData.custom_fields || {}).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") {
        data.append(`custom_fields[${k}]`, v);
      }
    });

    // notes[]
    (formData.notes || []).forEach((n) => {
      if (n && n.trim() !== "") data.append("notes[]", n);
    });

    // avatar
    if (avatar) data.append("avatar", avatar);

    // CSRF header (works with Breeze’s <meta name="csrf-token">)
    const token =
      document
        .querySelector('meta[name="csrf-token"]')
        ?.getAttribute("content") || "";

    try {
      await axios.post("/contacts/create", data, {
        headers: {
          "Content-Type": "multipart/form-data",
          "X-CSRF-TOKEN": token,
          "X-Requested-With": "XMLHttpRequest",
        },
        withCredentials: true,
      });

      // success → go back to index
      Inertia.visit("/contacts");
    } catch (error) {
      const res = error?.response;

      // Exact DUPLICATE payload from the controller
      if (res?.status === 422 && res.data?.code === "DUPLICATE_EMAIL") {
        const id = res.data.existing_contact_id;
        Inertia.visit(`/contacts/${id}`, { data: { duplicate: 1 } }); // => ?duplicate=1
        return;
      }

      // Standard validator errors
      if (res?.status === 422 && res.data?.errors) {
        setErrors(res.data.errors);
        return;
      }

      alert("Failed to create contact. Please try again.");
      // optional: console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <NavBar />

      <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg mt-8">
        <h1 className="text-3xl font-semibold text-gray-800 mb-6">
          Create New Contact
        </h1>

        <form onSubmit={handleSubmit} noValidate>
          {/* Names / email / phone */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                placeholder="First Name"
                className="w-full p-2 border border-gray-300 rounded-md"
              />
              {errors.first_name && (
                <p className="mt-1 text-sm text-red-600">{errors.first_name}</p>
              )}
            </div>

            <div>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                placeholder="Last Name"
                className="w-full p-2 border border-gray-300 rounded-md"
              />
              {errors.last_name && (
                <p className="mt-1 text-sm text-red-600">{errors.last_name}</p>
              )}
            </div>

            <div>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email"
                className="w-full p-2 border border-gray-300 rounded-md"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            <div>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Phone"
                className="w-full p-2 border border-gray-300 rounded-md"
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
              )}
            </div>

            {/* Avatar upload */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Avatar
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
              {avatar && (
                <div className="mt-2 text-sm text-gray-600">
                  Selected: {avatar.name}
                </div>
              )}
              {errors.avatar && (
                <p className="mt-1 text-sm text-red-600">{errors.avatar}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                JPG, PNG, WEBP, AVIF up to 2 MB.
              </p>
            </div>
          </div>

          {/* Custom Fields */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-3">
              Custom Fields (meta data)
            </h3>
            <input
              type="text"
              onChange={(e) =>
                handleCustomFieldChange("field1", e.target.value)
              }
              placeholder="Custom Field 1"
              className="w-full p-2 border border-gray-300 rounded-md mb-4"
            />
            <input
              type="text"
              onChange={(e) =>
                handleCustomFieldChange("field2", e.target.value)
              }
              placeholder="Custom Field 2"
              className="w-full p-2 border border-gray-300 rounded-md mb-4"
            />
          </div>

          {/* Notes */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-3">Notes</h3>
            {formData.notes.map((note, index) => (
              <div key={index} className="mb-4">
                <textarea
                  value={note}
                  onChange={(e) => handleNoteChange(index, e.target.value)}
                  placeholder="Enter your note"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  rows={3}
                />
              </div>
            ))}
            <button
              type="button"
              onClick={handleAddNote}
              className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
            >
              Add Note
            </button>
          </div>

          {/* Submit */}
          <div className="mt-8">
            <button
              type="submit"
              className="bg-blue-600 text-white px-5 py-2 rounded-md hover:bg-blue-700"
            >
              Create Contact
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Create;

import React from 'react';
import { useForm, Link } from '@inertiajs/react';
import NavBar from '@/Components/NavBar';

export default function Edit({ organization }) {
  const { data, setData, put, processing, errors } = useForm({
    name: organization?.name || '',
    slug: organization?.slug || '',
  });

  const submit = (e) => {
    e.preventDefault();
    put(route('organizations.update', organization.id));
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <NavBar />

      <div className="max-w-3xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-sm ring-1 ring-gray-200 p-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Edit Organization</h1>
              <p className="text-sm text-gray-500 mt-1">ID: {organization.id}</p>
            </div>
            <Link
              href={route('organizations.show', organization.id)}
              className="text-sm text-gray-700 underline hover:text-gray-900"
            >
              Back to details
            </Link>
          </div>

          <form onSubmit={submit} className="mt-6 space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                value={data.name}
                onChange={(e) => setData('name', e.target.value)}
                className="mt-1 w-full rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-1 focus:ring-gray-400"
                placeholder="Organization name"
              />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Slug</label>
              <input
                type="text"
                value={data.slug}
                onChange={(e) => setData('slug', e.target.value)}
                className="mt-1 w-full rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-1 focus:ring-gray-400"
                placeholder="unique-slug"
              />
              {errors.slug && <p className="mt-1 text-sm text-red-600">{errors.slug}</p>}
              <p className="mt-1 text-xs text-gray-500">Only letters, numbers, dashes, and underscores.</p>
            </div>

            <div className="pt-2 flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={processing}
                className="rounded-md bg-gray-900 text-white px-4 py-2 hover:bg-gray-800 disabled:opacity-50"
              >
                {processing ? 'Saving…' : 'Save Changes'}
              </button>

              <Link
                href={route('organizations.show', organization.id)}
                className="rounded-md border border-gray-300 px-4 py-2 text-gray-800 hover:bg-gray-100"
              >
                Cancel
              </Link>
            </div>
          </form>

          <div className="mt-6 text-xs text-gray-500">
            Owner user ID: {organization.owner_user_id}
          </div>
        </div>
      </div>
    </div>
  );
}

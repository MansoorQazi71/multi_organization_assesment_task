<?php

namespace App\Http\Controllers;

use App\Models\ContactMeta;
use Illuminate\Http\Request;

class ContactMetaController extends Controller
{
    /**
     * Display a listing of the contact meta.
     */
    public function index()
    {
        return response()->json(ContactMeta::all());
    }

    /**
     * Store a newly created contact meta in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'contact_id' => 'required|exists:contacts,id',
            'key'        => 'required|string|max:255',
            'value'      => 'nullable|string',
        ]);

        $meta = ContactMeta::create($validated);

        return response()->json([
            'message' => 'Contact meta created successfully',
            'data'    => $meta
        ], 201);
    }

    /**
     * Display the specified contact meta.
     */
    public function show(ContactMeta $contactMeta)
    {
        return response()->json($contactMeta);
    }

    /**
     * Update the specified contact meta in storage.
     */
    public function update(Request $request, ContactMeta $contactMeta)
    {
        $validated = $request->validate([
            'key'   => 'sometimes|required|string|max:255',
            'value' => 'nullable|string',
        ]);

        $contactMeta->update($validated);

        return response()->json([
            'message' => 'Contact meta updated successfully',
            'data'    => $contactMeta
        ]);
    }

    /**
     * Remove the specified contact meta from storage.
     */
    public function destroy(ContactMeta $contactMeta)
    {
        $contactMeta->delete();

        return response()->json([
            'message' => 'Contact meta deleted successfully'
        ]);
    }
}

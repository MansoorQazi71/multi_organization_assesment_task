<?php

namespace App\Http\Controllers;

use App\Models\ContactNote;
use Illuminate\Http\Request;

class ContactNoteController extends Controller
{
    /**
     * Display a listing of the contact notes.
     */
    public function index()
    {
        return response()->json(ContactNote::all());
    }

    /**
     * Store a newly created contact note in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'contact_id' => 'required|exists:contacts,id',
            'note'       => 'required|string',
        ]);

        $note = ContactNote::create($validated);

        return response()->json([
            'message' => 'Contact note created successfully',
            'data'    => $note
        ], 201);
    }

    /**
     * Display the specified contact note.
     */
    public function show(ContactNote $contactNote)
    {
        return response()->json($contactNote);
    }

    /**
     * Update the specified contact note in storage.
     */
    public function update(Request $request, ContactNote $contactNote)
    {
        $validated = $request->validate([
            'note' => 'required|string',
        ]);

        $contactNote->update($validated);

        return response()->json([
            'message' => 'Contact note updated successfully',
            'data'    => $contactNote
        ]);
    }

    /**
     * Remove the specified contact note from storage.
     */
    public function destroy(ContactNote $contactNote)
    {
        $contactNote->delete();

        return response()->json([
            'message' => 'Contact note deleted successfully'
        ]);
    }
}

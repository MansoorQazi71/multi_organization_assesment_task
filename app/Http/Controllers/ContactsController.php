<?php

namespace App\Http\Controllers;

use App\Models\Contact;
use App\Models\ContactMeta;
use App\Models\ContactNote;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ContactsController extends Controller
{
    public function index()
    {
        $contacts = Contact::where('organization_id', session('current_organization'))
            ->get();
        return inertia('Contacts/Index', ['contacts' => $contacts]);
    }

    public function create(Request $request)
    {
        // Validate the incoming request
        $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'nullable|email|unique:contacts,email,NULL,id,organization_id,' . session('current_organization'),
            'phone' => 'nullable|string|max:255',
            'notes' => 'nullable|array',  // Ensure notes are an array
            'notes.*' => 'nullable|string',  // Each note should be a string
        ]);

        // Create the contact
        $contact = Contact::create([
            'organization_id' => session('current_organization'),  // Ensure the contact belongs to the current organization
            'first_name' => $request->first_name,
            'last_name' => $request->last_name,
            'email' => $request->email,
            'phone' => $request->phone,
            'created_by' => Auth::id(),  // The user who created the contact
        ]);

        // Add custom fields (contact_meta) if they are provided
        foreach ($request->input('custom_fields', []) as $key => $value) {
            ContactMeta::create([
                'contact_id' => $contact->id,
                'key' => $key,
                'value' => $value,
            ]);
        }

        // Add notes if they are provided
        if ($request->has('notes')) {
            foreach ($request->input('notes') as $noteBody) {
                ContactNote::create([
                    'contact_id' => $contact->id,
                    'user_id' => Auth::id(),  // The user who created the note
                    'body' => $noteBody,
                ]);
            }
        }

        // Redirect to the contacts index page after successful creation
        return redirect()->route('contacts.index');
    }

    public function show($id)
    {
        $contact = Contact::findOrFail($id);
        return inertia('Contacts/Show', ['contact' => $contact]);
    }

    public function destroy($id)
    {
        $contact = Contact::findOrFail($id);
        $contact->delete();
        return redirect()->route('contacts.index');
    }

    public function duplicate($id)
    {
        $contact = Contact::findOrFail($id);
        $duplicateContact = $contact->replicate();
        $duplicateContact->email = null; // Set email to null for new contact
        $duplicateContact->save();

        return redirect()->route('contacts.show', $duplicateContact->id);
    }

    public function createForm()
    {
        return inertia('Contacts/Create');
    }

    public function edit($id)
    {
        $contact = Contact::with('meta','notes')  // Include custom fields (contact_meta)
            ->findOrFail($id);

        return inertia('Contacts/Edit', [
            'contact' => $contact,
        ]);
    }
    public function update(Request $request, $id)
    {
        // Validate the incoming request
        $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'nullable|email|unique:contacts,email,' . $id . ',id,organization_id,' . session('current_organization'),
            'phone' => 'nullable|string|max:255',
            'notes' => 'nullable|array',
            'notes.*' => 'nullable|string',  // Validate notes
        ]);

        $contact = Contact::findOrFail($id);

        // Ensure the contact belongs to the current organization
        if ($contact->organization_id !== session('current_organization')) {
            return redirect()->route('contacts.index')->with('error', 'You cannot edit this contact.');
        }

        // Update the contact details
        $contact->update([
            'first_name' => $request->first_name,
            'last_name' => $request->last_name,
            'email' => $request->email,
            'phone' => $request->phone,
        ]);

        // Update custom fields (contact_meta) if they are provided
        if ($request->has('custom_fields')) {
            foreach ($request->input('custom_fields', []) as $key => $value) {
                ContactMeta::updateOrCreate(
                    ['contact_id' => $contact->id, 'key' => $key],
                    ['value' => $value]
                );
            }
        }

        // Add or update notes (if provided)
        if ($request->has('notes')) {
            foreach ($request->input('notes') as $noteBody) {
                ContactNote::updateOrCreate(
                    ['contact_id' => $contact->id, 'user_id' => Auth::id(), 'body' => $noteBody]
                );
            }
        }

        // Redirect to the contact detail page after successful update
        return redirect()->route('contacts.show', $contact->id);
    }
}

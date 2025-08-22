<?php

namespace App\Http\Controllers;

use App\Models\Contact;
use App\Models\ContactMeta;
use App\Models\ContactNote;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;

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
        $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name'  => 'required|string|max:255',
            'email'      => 'nullable|email|unique:contacts,email,NULL,id,organization_id,' . session('current_organization'),
            'phone'      => 'nullable|string|max:255',
            'notes'      => 'nullable|array',
            'notes.*'    => 'nullable|string',
            'avatar'     => 'nullable|image|max:2048', // <— NEW (2MB)
        ]);

        // Handle avatar upload (optional)
        $avatarPath = null;
        if ($request->hasFile('avatar')) {
            // stores to storage/app/public/avatars/...
            $avatarPath = $request->file('avatar')->store('avatars', 'public');
        }

        $contact = Contact::create([
            'organization_id' => session('current_organization'),
            'first_name'      => $request->first_name,
            'last_name'       => $request->last_name,
            'email'           => $request->email,
            'phone'           => $request->phone,
            'avatar_path'     => $avatarPath,     // <— NEW
            'created_by'      => Auth::id(),
        ]);

        foreach ($request->input('custom_fields', []) as $key => $value) {
            if ($value !== null && $value !== '') {
                ContactMeta::create([
                    'contact_id' => $contact->id,
                    'key'        => $key,
                    'value'      => $value,
                ]);
            }
        }

        if ($request->has('notes')) {
            foreach ($request->input('notes') as $noteBody) {
                if ($noteBody && trim($noteBody) !== '') {
                    ContactNote::create([
                        'contact_id' => $contact->id,
                        'user_id'    => Auth::id(),
                        'body'       => $noteBody,
                    ]);
                }
            }
        }

        return redirect()->route('contacts.index');
    }



    public function show($id)
    {
        $contact = Contact::with(['notes.user', 'meta'])->findOrFail($id);
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

        return redirect()->route('contacts.index', $duplicateContact->id);
    }

    public function createForm()
    {
        return inertia('Contacts/Create');
    }

    public function edit($id)
    {
        $contact = Contact::with('meta', 'notes')  // Include custom fields (contact_meta)
            ->findOrFail($id);

        return inertia('Contacts/Edit', [
            'contact' => $contact,
        ]);
    }


    public function update(Request $request, $id)
    {
        // Validate (limit custom fields to 5, allow image up to 2MB)
        $request->validate([
            'first_name'      => 'required|string|max:255',
            'last_name'       => 'required|string|max:255',
            'email'           => 'nullable|email|unique:contacts,email,' . $id . ',id,organization_id,' . session('current_organization'),
            'phone'           => 'nullable|string|max:255',

            'custom_fields'   => 'nullable|array|max:5',
            'custom_fields.*' => 'nullable|string',

            'notes'           => 'nullable|array',
            'notes.*'         => 'nullable|string',

            'avatar'          => 'nullable|image|mimes:jpg,jpeg,png,webp,avif|max:2048',
            'remove_avatar'   => 'nullable|boolean',
        ]);

        $contact = Contact::findOrFail($id);

        // Enforce org isolation
        if ($contact->organization_id !== session('current_organization')) {
            return redirect()->route('contacts.index')->with('error', 'You cannot edit this contact.');
        }

        // ---- Core fields ----
        $contact->first_name = $request->first_name;
        $contact->last_name  = $request->last_name;
        $contact->email      = $request->email;
        $contact->phone      = $request->phone;

        // ---- Avatar remove / replace ----
        if ($request->boolean('remove_avatar') && $contact->avatar_path) {
            Storage::disk('public')->delete($contact->avatar_path);
            $contact->avatar_path = null;
        }

        if ($request->hasFile('avatar')) {
            if ($contact->avatar_path) {
                Storage::disk('public')->delete($contact->avatar_path);
            }
            $contact->avatar_path = $request->file('avatar')->store('avatars', 'public'); // => 'avatars/xxx.jpg'
        }

        $contact->save();

        // =========================================================
        //  Sync CUSTOM FIELDS (ContactMeta)
        //  Treat missing input as empty => removing all clears all.
        // =========================================================
        $incomingMeta = (array) $request->input('custom_fields', []);

        // Delete all existing meta for this contact…
        ContactMeta::where('contact_id', $contact->id)->delete();
        // …then recreate from submitted non-empty values.
        foreach ($incomingMeta as $key => $value) {
            $val = is_string($value) ? trim($value) : $value;
            if ($val !== '' && $val !== null) {
                ContactMeta::create([
                    'contact_id' => $contact->id,
                    'key'        => $key,
                    'value'      => $val,
                ]);
            }
        }

        // ===========================================
        //  Sync NOTES
        //  Treat missing input as empty => clear all.
        // ===========================================
        $incomingNotes = $request->input('notes', []);

        // Delete all existing notes, then recreate from incoming non-empty notes
        ContactNote::where('contact_id', $contact->id)->delete();

        foreach ($incomingNotes as $noteBody) {
            $val = is_string($noteBody) ? trim($noteBody) : $noteBody;
            if ($val !== '' && $val !== null) {
                ContactNote::create([
                    'contact_id' => $contact->id,
                    'user_id'    => Auth::id(),
                    'body'       => $val,
                ]);
            }
        }

        // Go back to Show page
        return Inertia::location(route('contacts.show', $contact->id));
    }



    public function storeNote(Request $request, int $id)
    {
        // Validate note body
        $data = $request->validate([
            'body' => 'required|string|max:2000',
        ]);

        // Find contact in the CURRENT org only (prevents cross-org writes)
        $contact = Contact::where('organization_id', session('current_organization'))
            ->findOrFail($id);

        // Create the note
        $note = ContactNote::create([
            'contact_id' => $contact->id,
            'user_id'    => Auth::id(),
            'body'       => $data['body'],
        ]);

        // If an XHR/JSON request, return the new note (with author) for immediate UI use
        if ($request->wantsJson()) {
            return response()->json($note->load('user'), 201);
        }

        // For Inertia: redirect back to the same page (Manage or Show) with a flash message
        return back()->with('success', 'Note added.');
    }
}

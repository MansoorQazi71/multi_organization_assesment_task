<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\Contact;
use App\Models\ContactMeta;
use App\Models\ContactNote;
use Illuminate\Support\Str;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class ContactsController extends Controller
{
    public function index(Request $request)
    {
        $orgId = session('current_organization');
        abort_unless($orgId, 403);

        $q = trim((string) $request->input('q', ''));

        $contacts = Contact::query()
            ->where('organization_id', $orgId)
            ->when($q !== '', function ($query) use ($q) {
                $query->where(function ($inner) use ($q) {
                    $inner->where('first_name', 'like', "%{$q}%")
                        ->orWhere('last_name', 'like', "%{$q}%")
                        ->orWhere('email', 'like', "%{$q}%");
                });
            })
            ->orderBy('first_name')
            ->orderBy('last_name')
            ->get();

        return Inertia::render('Contacts/Index', [
            'contacts' => $contacts,
            'filters'  => ['q' => $q], // pass current search back to the page
        ]);
    }


    public function create(Request $request)
    {
        $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name'  => 'required|string|max:255',
            // IMPORTANT: remove the unique rule here so we can return the exact custom 422 payload
            'email'      => 'nullable|email',
            'phone'      => 'nullable|string|max:255',
            'notes'      => 'nullable|array',
            'notes.*'    => 'nullable|string',
            'avatar'     => 'nullable|image|max:2048',
        ]);

        $orgId = (int) session('current_organization');

        // --- EXACT DEDUP LOGIC (case-insensitive) ---
        if ($email = $request->input('email')) {
            $existing = Contact::where('organization_id', $orgId)
                ->whereRaw('LOWER(email) = ?', [Str::lower($email)])
                ->first();

            if ($existing) {
                Log::info('duplicate_contact_blocked', [
                    'org_id'  => $orgId,
                    'email'   => $email,
                    'user_id' => Auth::id(),
                ]);

                // Return EXACT payload the UI expects
                return response()->json([
                    'code' => 'DUPLICATE_EMAIL',
                    'existing_contact_id' => $existing->id,
                ], 422);
            }
        }

        // Avatar upload (optional)
        $avatarPath = null;
        if ($request->hasFile('avatar')) {
            $avatarPath = $request->file('avatar')->store('avatars', 'public');
        }

        // Create the contact
        $contact = Contact::create([
            'organization_id' => $orgId,
            'first_name'      => $request->first_name,
            'last_name'       => $request->last_name,
            'email'           => $request->email,
            'phone'           => $request->phone,
            'avatar_path'     => $avatarPath,
            'created_by'      => Auth::id(),
        ]);

        // Custom fields (meta)
        foreach ($request->input('custom_fields', []) as $key => $value) {
            if ($value !== null && $value !== '') {
                ContactMeta::create([
                    'contact_id' => $contact->id,
                    'key'        => $key,
                    'value'      => $value,
                ]);
            }
        }

        // Notes
        foreach ($request->input('notes', []) as $noteBody) {
            if ($noteBody && trim($noteBody) !== '') {
                ContactNote::create([
                    'contact_id' => $contact->id,
                    'user_id'    => Auth::id(),
                    'body'       => $noteBody,
                ]);
            }
        }

        return redirect()->route('contacts.index');
    }



    public function show($id, Request $request)
    {
        $contact = Contact::with(['notes.user', 'meta'])
            ->where('organization_id', session('current_organization'))
            ->findOrFail($id);

        return Inertia::render('Contacts/Show', [
            'contact' => $contact,
            'duplicate_detected' => $request->boolean('duplicate'), // 👈 add this
        ]);
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
        // Normalize session org id to an integer
        $orgId = (int) session('current_organization');

        $request->validate([
            'first_name'      => 'required|string|max:255',
            'last_name'       => 'required|string|max:255',
            'email'           => [
                'nullable',
                'email',
                Rule::unique('contacts', 'email')
                    ->ignore($id)
                    ->where(fn($q) => $q->where('organization_id', $orgId)),
            ],
            'phone'           => 'nullable|string|max:255',

            'custom_fields'   => 'nullable|array|max:5',
            'custom_fields.*' => 'nullable|string',

            'notes'           => 'nullable|array',
            'notes.*'         => 'nullable|string',

            'avatar'          => 'nullable|image|mimes:jpg,jpeg,png,webp,avif|max:2048',
            'remove_avatar'   => 'nullable|boolean',
        ]);

        $contact = Contact::findOrFail($id);

        // Enforce org isolation (cast both sides to int)
        if ((int) $contact->organization_id !== $orgId) {
            return redirect()
                ->route('contacts.index')
                ->with('error', 'You cannot edit this contact.');
        }

        // Core fields
        $contact->first_name = $request->first_name;
        $contact->last_name  = $request->last_name;
        $contact->email      = $request->email;
        $contact->phone      = $request->phone;

        // Avatar remove/replace
        if ($request->boolean('remove_avatar') && $contact->avatar_path) {
            Storage::disk('public')->delete($contact->avatar_path);
            $contact->avatar_path = null;
        }
        if ($request->hasFile('avatar')) {
            if ($contact->avatar_path) {
                Storage::disk('public')->delete($contact->avatar_path);
            }
            $contact->avatar_path = $request->file('avatar')->store('avatars', 'public');
        }

        $contact->save();

        // Re-sync meta (treat missing as empty)
        ContactMeta::where('contact_id', $contact->id)->delete();
        foreach ((array) $request->input('custom_fields', []) as $key => $value) {
            $val = is_string($value) ? trim($value) : $value;
            if ($val !== '' && $val !== null) {
                ContactMeta::create([
                    'contact_id' => $contact->id,
                    'key'        => (string) $key,
                    'value'      => $val,
                ]);
            }
        }

        // Re-sync notes (treat missing as empty)
        ContactNote::where('contact_id', $contact->id)->delete();
        foreach ((array) $request->input('notes', []) as $noteBody) {
            $val = is_string($noteBody) ? trim($noteBody) : $noteBody;
            if ($val !== '' && $val !== null) {
                ContactNote::create([
                    'contact_id' => $contact->id,
                    'user_id'    => Auth::id(),
                    'body'       => $val,
                ]);
            }
        }

        return redirect()->route('contacts.show', $contact->id);
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

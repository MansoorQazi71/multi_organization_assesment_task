<?php

namespace App\Http\Controllers;

use App\Models\Contact;
use App\Http\Requests\ContactRequest;
use App\Services\CurrentOrganization;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class ContactController extends Controller
{
    public function index(Request $request)
    {
        $query = Contact::query();

        // search filter
        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->whereRaw('LOWER(first_name) LIKE ?', ['%'.strtolower($search).'%'])
                  ->orWhereRaw('LOWER(last_name) LIKE ?', ['%'.strtolower($search).'%'])
                  ->orWhereRaw('LOWER(email) LIKE ?', ['%'.strtolower($search).'%']);
            });
        }

        $contacts = $query->orderBy('last_name')->paginate(15);

        return inertia('Contacts/Index', ['contacts' => $contacts]);
    }

    public function store(ContactRequest $request)
    {
        $currentOrg = app(CurrentOrganization::class)->get();

        $email = $request->input('email');

        if ($email) {
            $exists = Contact::whereRaw('LOWER(email) = ?', [strtolower($email)])
                ->where('organization_id', $currentOrg->id)
                ->exists();

            if ($exists) {
                $existingContact = Contact::whereRaw('LOWER(email) = ?', [strtolower($email)])
                    ->where('organization_id', $currentOrg->id)
                    ->first();

                Log::info('duplicate_contact_blocked', [
                    'org_id' => $currentOrg->id,
                    'email' => $email,
                    'user_id' => Auth::id(),
                ]);

                return response()->json([
                    'code' => 'DUPLICATE_EMAIL',
                    'existing_contact_id' => $existingContact->id,
                ], 422);
            }
        }

        $contactData = $request->validated();
        $contactData['created_by'] = Auth::id();
        $contactData['updated_by'] = Auth::id();

        if ($request->hasFile('avatar')) {
            $avatarPath = $request->file('avatar')->store('avatars', 'public');
            $contactData['avatar_path'] = $avatarPath;
        }

        $contact = Contact::create($contactData);

        return redirect()->route('contacts.show', $contact);
    }

    public function show(Contact $contact)
    {
        $contact->load('notes.user', 'meta');

        return inertia('Contacts/Show', ['contact' => $contact]);
    }

    // Other CRUD methods (update, delete, duplicate) will be similar with validation and scoping...
}

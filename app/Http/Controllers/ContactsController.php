<?php

namespace App\Http\Controllers;

use App\Models\Contact;
use Illuminate\Http\Request;

class ContactsController extends Controller
{
    public function index()
    {
        $contacts = Contact::where('organization_id', session('current_organization'))
                           ->get();
        return inertia('Contacts/Index', ['contacts' => $contacts]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'email' => 'required|email|unique:contacts,email,NULL,id,organization_id,' . session('current_organization'),
            'first_name' => 'required|string',
            'last_name' => 'required|string',
        ]);

        $contact = new Contact([
            'organization_id' => session('current_organization'),
            'first_name' => $request->first_name,
            'last_name' => $request->last_name,
            'email' => $request->email,
            'phone' => $request->phone,
            'avatar_path' => $request->avatar,  // Handle avatar upload logic
            'created_by' => auth()->id(),
        ]);
        $contact->save();

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
}


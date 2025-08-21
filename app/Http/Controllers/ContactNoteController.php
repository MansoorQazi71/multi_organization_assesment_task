<?php

namespace App\Http\Controllers;

use App\Models\ContactNote;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ContactNoteController extends Controller
{
    public function store(Request $request, $contactId)
    {
        $request->validate([
            'body' => 'required|string',
        ]);

        ContactNote::create([
            'contact_id' => $contactId,
            'user_id' => Auth::id(),
            'body' => $request->body,
        ]);

        return redirect()->route('contacts.show', $contactId);
    }
}

<?php

namespace App\Http\Controllers;

use App\Models\ContactMeta;
use Illuminate\Http\Request;

class ContactMetaController extends Controller
{
    public function store(Request $request, $contactId)
    {
        $request->validate([
            'key' => 'required|string',
            'value' => 'required|string',
        ]);

        // Add custom field to contact
        ContactMeta::create([
            'contact_id' => $contactId,
            'key' => $request->key,
            'value' => $request->value,
        ]);

        return redirect()->route('contacts.show', $contactId);
    }
}


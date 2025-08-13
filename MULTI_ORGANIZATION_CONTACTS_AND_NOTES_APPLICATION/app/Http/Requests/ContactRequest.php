<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use App\Services\CurrentOrganization;

class ContactRequest extends FormRequest
{
    public function authorize()
    {
        // Optionally check user role in org (admin can create/edit)
        $currentOrg = app(CurrentOrganization::class)->get();

        return $currentOrg && $this->user()->organizations()->where('organization_id', $currentOrg->id)->exists();
    }

    public function rules()
    {
        $org = app(CurrentOrganization::class)->get();

        return [
            'first_name' => ['required', 'string', 'max:255'],
            'last_name'  => ['required', 'string', 'max:255'],
            'email'      => [
                'nullable',
                'email',
                'max:255',
                // uniqueness manually handled in controller for case-insensitive and scoped
            ],
            'phone'      => ['nullable', 'string', 'max:20'],
            'avatar'     => ['nullable', 'image', 'max:1024'], // max 1MB
        ];
    }
}

<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreOrganizationUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return (bool) $this->user()?->hasRole('admin');
    }

    public function rules(): array
    {
        return [
            'user_id' => 'required|integer|exists:users,id',
            'role'    => 'required|in:admin,member',
        ];
    }
}

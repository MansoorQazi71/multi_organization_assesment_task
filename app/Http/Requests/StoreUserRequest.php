<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return (bool) $this->user()?->hasRole('admin');
    }

    public function rules(): array
    {
        return [
            'name'         => 'required|string|max:255',
            'email'        => 'required|email:rfc,dns|unique:users,email',
            'password'     => 'required|string|min:8|confirmed',
            'global_role'  => 'required|in:admin,member',
        ];
    }
}

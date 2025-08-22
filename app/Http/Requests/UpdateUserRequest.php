<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return (bool) $this->user()?->hasRole('admin');
    }

    public function rules(): array
    {
        $id = (int) $this->route('id');

        return [
            'name'         => 'required|string|max:255',
            'email'        => 'required|email:rfc,dns|unique:users,email,'.$id,
            'password'     => 'nullable|string|min:8|confirmed',
            'global_role'  => 'required|in:admin,member',
        ];
    }
}

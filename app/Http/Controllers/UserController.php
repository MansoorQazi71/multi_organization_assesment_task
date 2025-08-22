<?php

// app/Http/Controllers/UserController.php
namespace App\Http\Controllers;

use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Models\User;
use Inertia\Inertia;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    public function index()
    {
        $users = User::select('id','name','email','created_at')
            ->with('roles:id,name') // spatie roles
            ->orderBy('name')
            ->get();

        return Inertia::render('Users/Index', [
            'users' => $users,
        ]);
    }

    public function create()
    {
        return Inertia::render('Users/Create');
    }

    public function store(StoreUserRequest $request)
    {
        $user = User::create([
            'name'     => $request->name,
            'email'    => $request->email,
            'password' => Hash::make($request->password),
        ]);

        // Assign global role (Spatie)
        $user->syncRoles([$request->global_role]);

        return redirect()->route('users.index')->with('success', 'User created.');
    }

    public function edit(int $id)
    {
        $user = User::with('roles:id,name')->findOrFail($id);

        return Inertia::render('Users/Edit', [
            'user' => [
                'id'    => $user->id,
                'name'  => $user->name,
                'email' => $user->email,
                'role'  => $user->roles->pluck('name')->first() ?? 'member',
            ],
        ]);
    }

    public function update(UpdateUserRequest $request, int $id)
    {
        $user = User::findOrFail($id);

        $user->name  = $request->name;
        $user->email = $request->email;
        if ($request->filled('password')) {
            $user->password = Hash::make($request->password);
        }
        $user->save();

        $user->syncRoles([$request->global_role]);

        return redirect()->route('users.index')->with('success', 'User updated.');
    }

    public function destroy(int $id)
    {
        $user = User::findOrFail($id);

        // Optional: prevent deleting yourself
        if (auth()->id() === $user->id) {
            return back()->with('error', "You can't delete your own account.");
        }

        $user->delete();
        return redirect()->route('users.index')->with('success', 'User deleted.');
    }
}

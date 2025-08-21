<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Organization extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'owner_user_id',
    ];

    // Relationship: An organization can have many contacts
    public function contacts()
    {
        return $this->hasMany(Contact::class);
    }

    // Relationship: An organization can have many users (many-to-many with pivot 'role')
    public function users()
    {
        return $this->belongsToMany(User::class)->withPivot('role');
    }

    // Relationship: An organization belongs to the owner user
    public function owner()
    {
        return $this->belongsTo(User::class, 'owner_user_id');
    }

    // Helper method to get a user's role in the organization
    public function getUserRole(User $user)
    {
        $role = $this->users()->where('user_id', $user->id)->first()->pivot->role;
        return $role;
    }

    // Scope for organizations the current user belongs to
    public function scopeForUser($query, User $user)
    {
        return $query->whereHas('users', function($q) use ($user) {
            $q->where('user_id', $user->id);
        });
    }

    // Check if the current user is the owner of the organization
    public function isOwner(User $user)
    {
        return $this->owner_user_id === $user->id;
    }
}

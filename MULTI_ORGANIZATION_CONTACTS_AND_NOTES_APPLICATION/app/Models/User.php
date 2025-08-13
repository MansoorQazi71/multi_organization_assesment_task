<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Spatie\Permission\Traits\HasRoles;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class User extends Authenticatable
{
    use HasFactory, Notifiable, HasRoles;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    /**
     * The organizations this user belongs to.
     */
    public function organizations(): BelongsToMany
    {
        return $this->belongsToMany(Organization::class)
                    ->withPivot('role')
                    ->withTimestamps();
    }

    /**
     * Get the user's role in a given organization.
     */
    public function roleInOrganization(Organization $org): ?string
    {
        $pivot = $this->organizations()->where('organization_id', $org->id)->first()?->pivot;
        return $pivot->role ?? null;
    }

    /**
     * Get the first organization of the user (useful for fallback).
     */
    public function firstOrganization(): ?Organization
    {
        return $this->organizations()->first();
    }
}

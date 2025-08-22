<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Contact extends Model
{
    use HasFactory;

    protected $fillable = [
        'organization_id',
        'first_name',
        'last_name',
        'email',
        'phone',
        'avatar_path',
        'created_by',
        'avatar_path',
    ];

     protected $appends = ['avatar_url']; // <-- include in JSON/Inertia

    public function getAvatarUrlAttribute(): ?string
    {
        return $this->avatar_path ? Storage::url($this->avatar_path) : null;
    }

    // Relationship: A contact belongs to an organization
    public function organization()
    {
        return $this->belongsTo(Organization::class);
    }

    // Relationship: A contact belongs to the user who created it
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    // Relationship: A contact can have many notes
    public function notes()
    {
        return $this->hasMany(ContactNote::class);
    }

    // Relationship: A contact can have many custom fields (meta)
    public function meta()
    {
        return $this->hasMany(ContactMeta::class);
    }

    // Method to check for duplicate email within the same organization
    public static function checkDuplicateEmail($email, $organizationId)
    {
        return self::where('email', $email)
                   ->where('organization_id', $organizationId)
                   ->first();
    }
}

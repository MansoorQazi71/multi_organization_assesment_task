<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\BelongsToOrganization;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Contact extends Model
{
    use BelongsToOrganization;

    protected $fillable = [
        'first_name',
        'last_name',
        'email',
        'phone',
        'avatar_path',
        'created_by',
        'updated_by',
    ];

    public function notes(): HasMany
    {
        return $this->hasMany(ContactNote::class);
    }

    public function meta(): HasMany
    {
        return $this->hasMany(ContactMeta::class);
    }
}

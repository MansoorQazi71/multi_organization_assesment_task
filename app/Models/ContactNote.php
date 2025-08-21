<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ContactNote extends Model
{
    use HasFactory;

    protected $fillable = [
        'contact_id',
        'user_id',
        'body',
    ];

    // Relationship: A note belongs to a contact
    public function contact()
    {
        return $this->belongsTo(Contact::class);
    }

    // Relationship: A note is created by a user
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}

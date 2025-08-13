<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ContactNote extends Model
{
    protected $fillable = [
        'contact_id',
        'user_id',
        'body',
    ];

    public function contact()
    {
        return $this->belongsTo(Contact::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}

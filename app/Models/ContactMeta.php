<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ContactMeta extends Model
{
    use HasFactory;

    protected $table = 'contact_meta'; // Specify the table name if it differs from the default pluralized form

    protected $fillable = [
        'contact_id',
        'key',
        'value',
    ];

    // Relationship: A contact meta belongs to a contact
    public function contact()
    {
        return $this->belongsTo(Contact::class);
    }
}

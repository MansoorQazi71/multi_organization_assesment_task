<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ContactMeta extends Model
{
    protected $table = 'contact_meta';

    protected $fillable = [
        'contact_id',
        'key',
        'value',
    ];

    public function contact()
    {
        return $this->belongsTo(Contact::class);
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Report extends Model
{
    protected $table = 'reports';
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'id', 'store_id', 'reporter_id', 'type',
        'description', 'status', 'admin_note'
    ];
}

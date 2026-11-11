<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StoreDocument extends Model
{
    protected $table = 'store_documents';
    protected $keyType = 'string';
    public $incrementing = false;
    public $timestamps = false;

    protected $fillable = [
        'id', 'store_id', 'file_path', 'type', 'review_note', 'created_at'
    ];
}

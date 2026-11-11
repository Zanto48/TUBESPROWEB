<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SearchLog extends Model
{
    protected $table = 'search_logs';
    protected $keyType = 'string';
    public $incrementing = false;
    public $timestamps = false;

    protected $fillable = ['id', 'keyword', 'user_id', 'lat', 'lng', 'created_at'];

    protected $casts = [
        'lat' => 'float',
        'lng' => 'float',
    ];
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Review extends Model
{
    protected $table = 'reviews';
    protected $keyType = 'string';
    public $incrementing = false;
    public $timestamps = false;

    protected $fillable = ['id', 'store_id', 'customer_id', 'rating', 'comment', 'created_at'];

    protected $casts = [
        'rating' => 'integer',
    ];
}

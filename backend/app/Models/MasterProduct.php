<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MasterProduct extends Model
{
    protected $table = 'master_products';
    protected $keyType = 'string';
    public $incrementing = false;
    public $timestamps = false;

    protected $fillable = [
        'id', 'category_id', 'name', 'brand', 'unit',
        'description', 'suggested_price', 'image', 'created_at'
    ];

    protected $casts = [
        'suggested_price' => 'integer',
    ];
}

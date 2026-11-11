<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StoreProduct extends Model
{
    protected $table = 'store_products';
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'id', 'store_id', 'master_product_id', 'name', 'brand',
        'category_id', 'unit', 'variant', 'price', 'stock',
        'low_stock_threshold', 'is_available', 'votes_available',
        'votes_empty', 'confidence_score', 'is_doubtful'
    ];

    protected $casts = [
        'price' => 'integer',
        'stock' => 'integer',
        'low_stock_threshold' => 'integer',
        'is_available' => 'boolean',
        'votes_available' => 'integer',
        'votes_empty' => 'integer',
        'confidence_score' => 'integer',
        'is_doubtful' => 'boolean',
    ];
}

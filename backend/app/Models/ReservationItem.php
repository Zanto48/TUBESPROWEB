<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ReservationItem extends Model
{
    protected $table = 'reservation_items';
    protected $keyType = 'string';
    public $incrementing = false;
    public $timestamps = false;

    protected $fillable = [
        'id', 'reservation_id', 'store_product_id', 'product_name',
        'variant', 'unit', 'qty', 'price_snapshot'
    ];

    protected $casts = [
        'qty' => 'integer',
        'price_snapshot' => 'integer',
    ];
}

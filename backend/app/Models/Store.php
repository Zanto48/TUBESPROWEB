<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Store extends Model
{
    protected $table = 'stores';
    protected $keyType = 'string';
    public $incrementing = false;
    public $timestamps = false;

    protected $fillable = [
        'id', 'owner_id', 'name', 'description', 'address',
        'lat', 'lng', 'phone', 'opening_hours', 'status',
        'verified_at', 'rating', 'total_reviews', 'created_at'
    ];

    protected $casts = [
        'lat' => 'float',
        'lng' => 'float',
        'rating' => 'float',
        'total_reviews' => 'integer',
    ];

    public function documents()
    {
        return $this->hasMany(StoreDocument::class, 'store_id', 'id');
    }

    public function products()
    {
        return $this->hasMany(StoreProduct::class, 'store_id', 'id');
    }

    public function reviews()
    {
        return $this->hasMany(Review::class, 'store_id', 'id');
    }
}

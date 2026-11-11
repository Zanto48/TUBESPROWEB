<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StockVote extends Model
{
    protected $table = 'stock_votes';
    protected $keyType = 'string';
    public $incrementing = false;
    public $timestamps = false;

    protected $fillable = ['id', 'store_product_id', 'user_id', 'vote', 'created_at'];
}

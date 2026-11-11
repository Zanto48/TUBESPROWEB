<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Reservation extends Model
{
    protected $table = 'reservations';
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'id', 'code', 'customer_id', 'store_id', 'status',
        'total_amount', 'note', 'pickup_estimated_time', 'expires_at'
    ];

    protected $casts = [
        'total_amount' => 'integer',
    ];

    public function items()
    {
        return $this->hasMany(ReservationItem::class, 'reservation_id', 'id');
    }
}

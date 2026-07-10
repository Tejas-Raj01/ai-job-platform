<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class JobPosting extends Model
{
    use HasFactory;

    protected $fillable = ['title', 'company', 'description', 'url'];

    public function analyses()
    {
        return $this->hasMany(AnalysisResult::class, 'job_id');
    }
}

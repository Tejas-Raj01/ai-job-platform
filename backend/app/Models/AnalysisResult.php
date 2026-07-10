<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AnalysisResult extends Model
{
    use HasFactory;

    protected $fillable = ['resume_id', 'job_id', 'match_score', 'missing_skills'];

    protected $casts = [
        'missing_skills' => 'array',
    ];

    public function resume()
    {
        return $this->belongsTo(Resume::class);
    }

    public function job()
    {
        return $this->belongsTo(JobPosting::class, 'job_id');
    }
}

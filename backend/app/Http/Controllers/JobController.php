<?php

namespace App\Http\Controllers;

use App\Models\JobPosting;
use App\Jobs\ScrapeJobs;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Queue;

class JobController extends Controller
{
    public function index()
    {
        return response()->json(JobPosting::all());
    }

    public function triggerScraping()
    {
        $jobId = app(\Illuminate\Contracts\Bus\Dispatcher::class)->dispatch(new ScrapeJobs());
        return response()->json(['task_id' => $jobId, 'message' => 'Scraping started']);
    }

    // Since Laravel standard queues don't easily return the status of a job without Horizon or Job batches,
    // we'll return a mock status for now to match the FastAPI behavior.
    public function getScrapingStatus($taskId)
    {
        return response()->json([
            'task_id' => $taskId,
            'task_status' => 'PENDING',
            'task_result' => null
        ]);
    }
}

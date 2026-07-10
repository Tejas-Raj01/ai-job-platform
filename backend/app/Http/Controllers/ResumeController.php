<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Resume;
use App\Models\JobPosting;
use App\Models\AnalysisResult;
use App\Services\PdfParserService;
use App\Services\AiMatcherService;
use App\Services\JobSearcherService;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ResumeController extends Controller
{
    public function upload(Request $request, PdfParserService $parser)
    {
        $request->validate([
            'user_id' => 'required|integer',
            'file' => 'required|file|mimes:pdf'
        ]);

        $file = $request->file('file');
        $parsedText = $parser->extractTextFromPdf($file->getPathname());
        
        $user = User::firstOrCreate(
            ['id' => $request->user_id],
            ['email' => "user{$request->user_id}@example.com", 'name' => 'Test User', 'password' => bcrypt('password')]
        );

        $resume = Resume::create([
            'user_id' => $user->id,
            'file_path' => $file->getClientOriginalName(),
            'parsed_text' => $parsedText,
            'skills' => 'Parsed by AI'
        ]);

        return response()->json([
            'resume_id' => $resume->id,
            'filename' => $file->getClientOriginalName(),
            'message' => 'Resume uploaded successfully'
        ]);
    }

    public function match(Request $request, AiMatcherService $matcher)
    {
        $request->validate([
            'resume_id' => 'required|exists:resumes,id',
            'job_id' => 'required|exists:job_postings,id'
        ]);

        $resume = Resume::findOrFail($request->resume_id);
        $job = JobPosting::findOrFail($request->job_id);

        $score = $matcher->calculateSimilarity($resume->parsed_text, $job->description);
        $gaps = $matcher->analyzeGaps($resume->parsed_text, $job->description);

        $analysis = AnalysisResult::create([
            'resume_id' => $resume->id,
            'job_id' => $job->id,
            'match_score' => $score,
            'missing_skills' => $gaps['missing_skills'] ?? []
        ]);

        return response()->json([
            'analysis_id' => $analysis->id,
            'match_score' => $score,
            'summary' => $gaps['summary'] ?? '',
            'missing_skills' => $gaps['missing_skills'] ?? [],
            'recommendations' => $gaps['recommendations'] ?? []
        ]);
    }

    public function analyzeAndFetch($resumeId, AiMatcherService $matcher, JobSearcherService $searcher)
    {
        $resume = Resume::findOrFail($resumeId);
        
        $keywords = $matcher->extractSearchKeywords($resume->parsed_text);
        
        $scrapedData = $searcher->scrapeJobsForProfile($keywords, 15);
        if (empty($scrapedData)) {
            $scrapedData = $searcher->scrapeJobsForProfile("Software", 10);
            if (empty($scrapedData)) {
                return response()->json(['matches' => []]);
            }
        }

        $freshJobs = collect();
        foreach ($scrapedData as $data) {
            $job = JobPosting::firstOrCreate(
                ['url' => $data['url']],
                [
                    'title' => $data['title'],
                    'company' => $data['company'],
                    'description' => $data['description']
                ]
            );
            $freshJobs->push($job);
        }

        $matches = $matcher->findTopJobs($resume->parsed_text, $freshJobs, 10);

        foreach ($matches as &$match) {
            $job = $freshJobs->firstWhere('id', $match['job_id']);
            if ($job) {
                $match['url'] = $job->url;
                $match['short_description'] = substr($job->description, 0, 150) . '...';
            }
        }

        return response()->json(['matches' => $matches]);
    }

    public function matchCustom($resumeId, Request $request, AiMatcherService $matcher)
    {
        $request->validate([
            'title' => 'string',
            'company' => 'string',
            'jd_text' => 'required|string'
        ]);

        try {
            $resume = Resume::findOrFail($resumeId);

            $job = JobPosting::create([
                'title' => substr($request->input('title', 'Custom Target Job'), 0, 100),
                'company' => substr($request->input('company', 'Target Company'), 0, 100),
                'description' => $request->jd_text,
                'url' => 'custom-paste-' . Str::uuid()
            ]);

            $matches = $matcher->findTopJobs($resume->parsed_text, collect([$job]), 1);

            if (!empty($matches)) {
                $matches[0]['short_description'] = substr($job->description, 0, 150) . '...';
            }

            return response()->json(['matches' => $matches]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => $e->getMessage(),
                'traceback' => $e->getTraceAsString()
            ], 500);
        }
    }
}

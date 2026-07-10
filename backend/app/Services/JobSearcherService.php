<?php

namespace App\Services;

use GuzzleHttp\Client;
use Illuminate\Support\Facades\Log;

class JobSearcherService
{
    protected string $apiKey;
    protected Client $client;

    public function __construct()
    {
        $this->apiKey = env('JSEARCH_API_KEY', '');
        $this->client = new Client([
            'timeout' => 15,
        ]);
    }

    public function scrapeJobsForProfile(string $keywords, int $limit = 10): array
    {
        Log::info("Starting Multi-Provider Search for: {$keywords}");
        
        $jobs = [];
        
        // 1. Fetch from JSearch
        $jsearchJobs = $this->fetchFromJSearch($keywords, $limit);
        $jobs = array_merge($jobs, $jsearchJobs);
        
        // 2. Mock Wellfound
        $wellfoundJobs = $this->fetchFromWellfoundMock($keywords);
        $jobs = array_merge($jobs, $wellfoundJobs);
        
        // Deduplicate
        $seenUrls = [];
        $uniqueJobs = [];
        foreach ($jobs as $job) {
            $url = $job['url'] ?? '';
            $key = $url ?: ($job['title'] . '-' . $job['company']);
            
            if (!in_array($key, $seenUrls)) {
                $seenUrls[] = $key;
                $uniqueJobs[] = $job;
            }
        }
        
        return array_slice($uniqueJobs, 0, $limit);
    }
    
    protected function fetchFromJSearch(string $keywords, int $limit): array
    {
        if (empty($this->apiKey)) {
            Log::warning("JSEARCH_API_KEY is not set. Skipping JSearch.");
            return [];
        }
        
        Log::info("JSearchProvider: Searching for '{$keywords}'");
        $jobs = [];
        
        try {
            $response = $this->client->request('GET', 'https://jsearch.p.rapidapi.com/search', [
                'headers' => [
                    'x-rapidapi-host' => 'jsearch.p.rapidapi.com',
                    'x-rapidapi-key' => $this->apiKey,
                ],
                'query' => [
                    'query' => $keywords,
                    'page' => '1',
                    'num_pages' => '1'
                ]
            ]);
            
            if ($response->getStatusCode() == 200) {
                $data = json_decode($response->getBody(), true);
                $results = $data['data'] ?? [];
                
                foreach (array_slice($results, 0, $limit) as $item) {
                    $desc = $item['job_description'] ?? '';
                    if ($desc) {
                        $jobs[] = [
                            'title' => substr($item['job_title'] ?? 'Job Posting', 0, 100),
                            'company' => substr($item['employer_name'] ?? 'Unknown Company', 0, 100),
                            'description' => substr($desc, 0, 10000),
                            'url' => $item['job_apply_link'] ?? ''
                        ];
                    }
                }
            }
        } catch (\Exception $e) {
            Log::error("JSearchProvider error: " . $e->getMessage());
        }
        
        return $jobs;
    }
    
    protected function fetchFromWellfoundMock(string $keywords): array
    {
        return [
            [
                "title" => "Lead {$keywords} Developer",
                "company" => "Fallback Startup Inc",
                "description" => "Seeking a lead developer with {$keywords} experience to build scalable applications. Strong problem-solving skills required.",
                "url" => "https://wellfound.com"
            ]
        ];
    }
}

<?php

namespace App\Jobs;

use App\Models\JobPosting;
use GuzzleHttp\Client;
use Symfony\Component\DomCrawler\Crawler;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;

class ScrapeJobs implements ShouldQueue
{
    use Queueable;

    public function handle(): void
    {
        $url = "https://realpython.github.io/fake-jobs/";
        $client = new Client();
        
        try {
            $response = $client->request('GET', $url);
            $html = (string) $response->getBody();
            
            $crawler = new Crawler($html);
            $jobsSaved = 0;
            
            $crawler->filter('.card-content')->each(function (Crawler $node) use (&$jobsSaved) {
                $title = $node->filter('h2.title')->count() ? $node->filter('h2.title')->text() : null;
                $company = $node->filter('h3.company')->count() ? $node->filter('h3.company')->text() : null;
                
                $links = $node->filter('a');
                $url = $links->count() > 1 ? $links->eq(1)->attr('href') : null;
                
                if ($title && $company && $url) {
                    $desc = "Software Engineering Role at {$company}.";
                    
                    $exists = JobPosting::where('url', $url)->exists();
                    if (!$exists) {
                        JobPosting::create([
                            'title' => trim($title),
                            'company' => trim($company),
                            'description' => $desc,
                            'url' => trim($url)
                        ]);
                        $jobsSaved++;
                    }
                }
            });
            
            Log::info("ScrapeJobs: Saved {$jobsSaved} jobs.");
        } catch (\Exception $e) {
            Log::error("ScrapeJobs Error: " . $e->getMessage());
        }
    }
}

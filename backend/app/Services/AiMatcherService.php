<?php

namespace App\Services;

use GuzzleHttp\Client;
use Illuminate\Support\Facades\Log;

class AiMatcherService
{
    protected string $apiKey;
    protected array $activeModels = [];
    protected Client $client;

    public function __construct()
    {
        $this->apiKey = env('GROQ_API_KEY', 'dummy_key');
        $this->client = new Client([
            'base_uri' => 'https://api.groq.com/openai/v1/',
            'timeout' => 30,
        ]);
        $this->activeModels = $this->getActiveGroqModels();
    }

    protected function getActiveGroqModels(): array
    {
        try {
            if ($this->apiKey === 'dummy_key') {
                return ["llama3-70b-8192", "llama3-8b-8192", "mixtral-8x7b-32768", "gemma-7b-it"];
            }

            $response = $this->client->get('models', [
                'headers' => [
                    'Authorization' => "Bearer {$this->apiKey}"
                ]
            ]);

            $data = json_decode($response->getBody(), true);
            $modelsData = $data['data'] ?? [];
            
            $textModels = [];
            foreach ($modelsData as $m) {
                if (stripos($m['id'], 'whisper') === false) {
                    $textModels[] = $m['id'];
                }
            }

            $priority = ["llama-3.3-70b-versatile", "llama-3.1-70b-versatile", "llama3-70b-8192", "mixtral-8x7b-32768"];
            $sortedModels = [];

            foreach ($priority as $p) {
                if (in_array($p, $textModels)) {
                    $sortedModels[] = $p;
                    $textModels = array_diff($textModels, [$p]);
                }
            }

            return array_merge($sortedModels, $textModels);
        } catch (\Exception $e) {
            Log::warning("Failed to fetch dynamic Groq models: " . $e->getMessage());
            return ["llama3-70b-8192", "llama3-8b-8192", "mixtral-8x7b-32768", "gemma-7b-it"];
        }
    }

    protected function executeWithFallback(string $systemPrompt, string $userPrompt, bool $enforceJson = false): string
    {
        foreach ($this->activeModels as $i => $modelName) {
            try {
                $payload = [
                    'model' => $modelName,
                    'messages' => [
                        ['role' => 'system', 'content' => $systemPrompt],
                        ['role' => 'user', 'content' => $userPrompt]
                    ],
                    'temperature' => 0.0,
                ];

                if ($enforceJson) {
                    $payload['response_format'] = ['type' => 'json_object'];
                }

                $response = $this->client->post('chat/completions', [
                    'headers' => [
                        'Authorization' => "Bearer {$this->apiKey}",
                        'Content-Type' => 'application/json'
                    ],
                    'json' => $payload
                ]);

                $data = json_decode($response->getBody(), true);
                $content = $data['choices'][0]['message']['content'] ?? '';
                
                Log::info("RAW LLM RESPONSE FROM {$modelName}: " . $content);
                return $content;
            } catch (\Exception $e) {
                Log::warning("Model {$modelName} failed: " . $e->getMessage());
                
                if ($i === count($this->activeModels) - 1) {
                    throw new \RuntimeException("All Groq models failed. Last error: " . $e->getMessage());
                }
                
                sleep(1);
            }
        }
        return "";
    }

    public function extractSearchKeywords(string $resumeText): string
    {
        $systemPrompt = "Analyze this resume and extract a highly condensed search string (max 4-5 words) of the core role and primary skill.\nExample: \"Senior React Developer\" or \"Python Backend Engineer\".\nRespond ONLY with the search string and nothing else.";
        $userPrompt = "Resume:\n" . substr($resumeText, 0, 5000);
        
        try {
            $content = $this->executeWithFallback($systemPrompt, $userPrompt, false);
            return trim(str_replace(["\n", '"'], '', $content));
        } catch (\Exception $e) {
            Log::error("Keyword extraction error: " . $e->getMessage());
            return "Software Engineer";
        }
    }

    public function analyzeGaps(string $resumeText, string $jdText): array
    {
        $systemPrompt = "Compare this Resume with this JD. What specific keywords, projects, or phrasing are missing from the resume to make it a 100% match for this exact job?\n\nReturn the result strictly as a valid JSON object matching the exact schema below:\n{\n  \"summary\": \"Short 2-sentence summary of the fit.\",\n  \"missing_skills\": [\"Skill 1\", \"Skill 2\", \"Skill 3\"],\n  \"recommendations\": [\"Actionable tip 1\", \"Actionable tip 2\"]\n}\n\nCRITICAL INSTRUCTION: Return ONLY the raw JSON object. Do NOT wrap the output in markdown code blocks (e.g., no ```json). Do NOT include any conversational text before or after.";
        $userPrompt = "Resume:\n" . substr($resumeText, 0, 5000) . "\n\nJob Description:\n" . substr($jdText, 0, 5000);
        
        try {
            $content = $this->executeWithFallback($systemPrompt, $userPrompt, true);
            $content = preg_replace('/```json\s*|\s*```/i', '', $content);
            $content = trim($content);
            
            // Extract json
            preg_match('/\{.*\}/s', $content, $matches);
            $jsonStr = $matches[0] ?? $content;
            
            $result = json_decode($jsonStr, true);
            if (json_last_error() !== JSON_ERROR_NONE) {
                throw new \Exception("JSON parsing failed: " . json_last_error_msg());
            }
            
            return [
                'summary' => $result['summary'] ?? 'No summary provided.',
                'missing_skills' => $result['missing_skills'] ?? [],
                'recommendations' => $result['recommendations'] ?? []
            ];
        } catch (\Exception $e) {
            Log::error("LLM gap analysis error: " . $e->getMessage());
            return [
                'summary' => 'Analysis completed, but response formatting failed. Please try analyzing again.',
                'missing_skills' => ['Error parsing skills'],
                'recommendations' => ['Error parsing recommendations']
            ];
        }
    }

    /**
     * Calculates cosine similarity between two texts.
     */
    public function calculateSimilarity(string $text1, string $text2): float
    {
        $v1 = $this->getWordFrequencies($text1);
        $v2 = $this->getWordFrequencies($text2);
        
        $dotProduct = 0.0;
        $mag1 = 0.0;
        $mag2 = 0.0;
        
        $allKeys = array_unique(array_merge(array_keys($v1), array_keys($v2)));
        
        foreach ($allKeys as $key) {
            $val1 = $v1[$key] ?? 0;
            $val2 = $v2[$key] ?? 0;
            
            $dotProduct += $val1 * $val2;
            $mag1 += $val1 * $val1;
            $mag2 += $val2 * $val2;
        }
        
        $mag1 = sqrt($mag1);
        $mag2 = sqrt($mag2);
        
        if ($mag1 == 0 || $mag2 == 0) return 0.0;
        
        $sim = $dotProduct / ($mag1 * $mag2);
        return round(max(0.0, min(1.0, $sim)) * 100, 2);
    }
    
    public function findTopJobs(string $resumeText, \Illuminate\Support\Collection $jobs, int $topK = 10): array
    {
        if ($jobs->isEmpty() || empty(trim($resumeText))) {
            return [];
        }
        
        $matches = [];
        foreach ($jobs as $job) {
            $score = $this->calculateSimilarity($resumeText, $job->description ?? '');
            $matches[] = [
                'job_id' => $job->id,
                'title' => $job->title,
                'company' => $job->company,
                'match_score' => $score
            ];
        }
        
        usort($matches, function($a, $b) {
            return $b['match_score'] <=> $a['match_score'];
        });
        
        return array_slice($matches, 0, $topK);
    }

    protected function getWordFrequencies(string $text): array
    {
        $text = strtolower(preg_replace('/[^a-zA-Z0-9\s]/', ' ', $text));
        $words = str_word_count($text, 1);
        
        $stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'];
        $words = array_diff($words, $stopWords);
        
        $freqs = array_count_values($words);
        return $freqs;
    }
}

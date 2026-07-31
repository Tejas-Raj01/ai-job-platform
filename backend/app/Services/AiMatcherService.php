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
        $defaultModels = ["llama-3.3-70b-versatile", "llama-3.1-8b-instant", "llama-3.1-70b-versatile", "gemma2-9b-it"];

        try {
            if ($this->apiKey === 'dummy_key' || empty($this->apiKey)) {
                return $defaultModels;
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
                if (isset($m['id']) && stripos($m['id'], 'whisper') === false && stripos($m['id'], 'guard') === false) {
                    $textModels[] = $m['id'];
                }
            }

            $sortedModels = [];
            foreach ($defaultModels as $p) {
                if (in_array($p, $textModels)) {
                    $sortedModels[] = $p;
                    $textModels = array_diff($textModels, [$p]);
                }
            }

            return !empty($sortedModels) ? array_merge($sortedModels, $textModels) : $defaultModels;
        } catch (\Exception $e) {
            Log::warning("Failed to fetch dynamic Groq models: " . $e->getMessage());
            return $defaultModels;
        }
    }

    protected function executeWithFallback(string $systemPrompt, string $userPrompt, bool $enforceJson = false): string
    {
        if (empty($this->apiKey) || $this->apiKey === 'dummy_key') {
            throw new \RuntimeException("GROQ_API_KEY is not configured.");
        }

        foreach ($this->activeModels as $i => $modelName) {
            try {
                $payload = [
                    'model' => $modelName,
                    'messages' => [
                        ['role' => 'system', 'content' => $systemPrompt],
                        ['role' => 'user', 'content' => $userPrompt]
                    ],
                    'temperature' => 0.1,
                ];

                if ($enforceJson) {
                    $payload['response_format'] = ['type' => 'json_object'];
                }

                try {
                    $response = $this->client->post('chat/completions', [
                        'headers' => [
                            'Authorization' => "Bearer {$this->apiKey}",
                            'Content-Type' => 'application/json'
                        ],
                        'json' => $payload
                    ]);
                } catch (\Exception $e) {
                    if ($enforceJson) {
                        unset($payload['response_format']);
                        $response = $this->client->post('chat/completions', [
                            'headers' => [
                                'Authorization' => "Bearer {$this->apiKey}",
                                'Content-Type' => 'application/json'
                            ],
                            'json' => $payload
                        ]);
                    } else {
                        throw $e;
                    }
                }

                $data = json_decode($response->getBody(), true);
                $content = $data['choices'][0]['message']['content'] ?? '';
                
                Log::info("RAW LLM RESPONSE FROM {$modelName}: " . $content);
                return $content;
            } catch (\Exception $e) {
                Log::warning("Model {$modelName} failed: " . $e->getMessage());
                
                if ($i === count($this->activeModels) - 1) {
                    throw new \RuntimeException("All Groq models failed. Last error: " . $e->getMessage());
                }
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
            $parsed = $this->parseJsonResponse($content);
            
            if ($parsed && isset($parsed['summary']) && isset($parsed['missing_skills']) && isset($parsed['recommendations'])) {
                return [
                    'summary' => (string)$parsed['summary'],
                    'missing_skills' => is_array($parsed['missing_skills']) ? array_values($parsed['missing_skills']) : [],
                    'recommendations' => is_array($parsed['recommendations']) ? array_values($parsed['recommendations']) : []
                ];
            }
            
            throw new \Exception("Parsed response structure invalid.");
        } catch (\Exception $e) {
            Log::info("LLM gap analysis error/unavailable: " . $e->getMessage() . ". Fallback to heuristic gap analysis.");
            return $this->fallbackGapAnalysis($resumeText, $jdText);
        }
    }

    protected function parseJsonResponse(string $content): ?array
    {
        if (empty(trim($content))) {
            return null;
        }

        $clean = preg_replace('/```(?:json)?\s*/i', '', $content);
        $clean = preg_replace('/\s*```/', '', $clean);
        $clean = trim($clean);

        if (preg_match('/\{[\s\S]*\}/', $clean, $matches)) {
            $jsonCandidate = $matches[0];
        } else {
            $jsonCandidate = $clean;
        }

        $decoded = json_decode($jsonCandidate, true);
        if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
            return $decoded;
        }

        // Attempt repair on trailing commas
        $repaired = preg_replace('/,\s*([\}\]])/', '$1', $jsonCandidate);
        $decoded = json_decode($repaired, true);
        if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
            return $decoded;
        }

        return null;
    }

    public function fallbackGapAnalysis(string $resumeText, string $jdText): array
    {
        $commonSkills = [
            'React', 'React.js', 'Next.js', 'Vue', 'Vue.js', 'Angular', 'TypeScript', 'JavaScript',
            'Node.js', 'Express', 'Python', 'Django', 'Flask', 'FastAPI', 'Java', 'Spring', 'Spring Boot',
            'PHP', 'Laravel', 'C++', 'C#', '.NET', 'Go', 'Golang', 'Rust', 'Ruby', 'Rails',
            'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'Elasticsearch', 'SQLite',
            'Docker', 'Kubernetes', 'AWS', 'GCP', 'Azure', 'DevOps', 'CI/CD', 'GitHub Actions',
            'GraphQL', 'REST API', 'Microservices', 'Tailwind', 'TailwindCSS', 'Bootstrap',
            'System Design', 'Agile', 'Scrum', 'Git', 'Linux', 'Unit Testing', 'Jest', 'PyTest',
            'Machine Learning', 'AI', 'PyTorch', 'TensorFlow', 'NLP', 'LLM', 'Kafka', 'RabbitMQ'
        ];

        $requiredSkillsInJd = [];
        foreach ($commonSkills as $skill) {
            $pattern = '/\b' . preg_quote(strtolower($skill), '/') . '\b/i';
            if (preg_match($pattern, $jdText)) {
                $requiredSkillsInJd[] = $skill;
            }
        }

        $missingSkills = [];
        $matchedSkills = [];

        foreach ($requiredSkillsInJd as $skill) {
            $pattern = '/\b' . preg_quote(strtolower($skill), '/') . '\b/i';
            if (preg_match($pattern, $resumeText)) {
                $matchedSkills[] = $skill;
            } else {
                $missingSkills[] = $skill;
            }
        }

        if (empty($requiredSkillsInJd)) {
            preg_match_all('/\b[A-Z][a-zA-Z0-9\+\#\.\-]{2,}\b/', $jdText, $wordsMatches);
            $extractedWords = array_unique($wordsMatches[0] ?? []);
            $ignoredWords = ['Seeking', 'Lead', 'Developer', 'Engineer', 'Software', 'Required', 'Experience', 'Strong', 'Team', 'Role', 'Company', 'Building', 'Working'];
            
            foreach ($extractedWords as $w) {
                if (in_array($w, $ignoredWords)) continue;
                if (!preg_match('/\b' . preg_quote(strtolower($w), '/') . '\b/i', $resumeText)) {
                    $missingSkills[] = $w;
                } else {
                    $matchedSkills[] = $w;
                }
            }
        }

        $missingSkills = array_values(array_unique($missingSkills));
        $matchedSkills = array_values(array_unique($matchedSkills));

        if (!empty($missingSkills)) {
            $topMissing = array_slice($missingSkills, 0, 3);
            $summary = "Candidate demonstrates technical capability, but lacks explicit experience with key requirements: " . implode(', ', $topMissing) . ".";
        } else if (!empty($matchedSkills)) {
            $summary = "Strong technical match! Your resume effectively covers the core skills and tools specified in this job description.";
        } else {
            $summary = "General profile alignment detected. Consider tailoring your experience bullet points to mirror key phrases in the job description.";
        }

        $recommendations = [];
        if (!empty($missingSkills)) {
            $recommendations[] = "Add targeted bullet points showcasing hands-on experience or projects using " . implode(', ', array_slice($missingSkills, 0, 2)) . ".";
            if (count($missingSkills) > 2) {
                $recommendations[] = "Include keywords like " . $missingSkills[2] . " in your skills summary to optimize for ATS screening.";
            }
            $recommendations[] = "Quantify your achievements with measurable metrics and results to highlight technical impact.";
        } else {
            $recommendations[] = "Highlight recent achievements with specific metrics (e.g., latency reduction, performance gains) to stand out.";
            $recommendations[] = "Tailor project descriptions to align with the core business domain of the target role.";
        }

        return [
            'summary' => $summary,
            'missing_skills' => array_slice($missingSkills, 0, 8),
            'recommendations' => $recommendations
        ];
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

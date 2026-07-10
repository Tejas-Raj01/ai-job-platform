<?php

namespace App\Services;

use Smalot\PdfParser\Parser;

class PdfParserService
{
    protected Parser $parser;

    public function __construct()
    {
        $this->parser = new Parser();
    }

    /**
     * Extracts and cleans text from a PDF file path.
     */
    public function extractTextFromPdf(string $filePath): string
    {
        try {
            $pdf = $this->parser->parseFile($filePath);
            $text = $pdf->getText();
            
            // Basic cleaning: remove extra whitespace
            $text = preg_replace('/\s+/', ' ', $text);
            $text = trim($text);
            
            // Keep mostly ASCII
            $text = preg_replace('/[^\x20-\x7E\n]/', '', $text);
            
            return $text;
        } catch (\Exception $e) {
            \Log::error("PDF Extraction Error: " . $e->getMessage());
            return "";
        }
    }
}

<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\JobController;
use App\Http\Controllers\ResumeController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::prefix('jobs')->group(function () {
    Route::get('/', [JobController::class, 'index']);
    Route::post('/scrape', [JobController::class, 'triggerScraping']);
    Route::get('/scrape/{task_id}', [JobController::class, 'getScrapingStatus']);
});

Route::prefix('resumes')->group(function () {
    Route::post('/upload', [ResumeController::class, 'upload']);
    Route::post('/match', [ResumeController::class, 'match']);
    Route::post('/{resume_id}/analyze-and-fetch', [ResumeController::class, 'analyzeAndFetch']);
    Route::post('/{resume_id}/match_custom', [ResumeController::class, 'matchCustom']);
});

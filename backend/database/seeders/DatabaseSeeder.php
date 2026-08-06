<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $user = User::firstOrCreate(
            ['email' => 'test@example.com'],
            ['name' => 'Tejas Raj', 'password' => bcrypt('password')]
        );

        \App\Models\Resume::firstOrCreate(
            ['file_path' => 'Tejas_resume_vLLM.pdf'],
            [
                'user_id' => $user->id,
                'parsed_text' => 'Tejas Raj B.Tech - Computer Science and Engineering Roll Number:23CS8132 Email:rajtejas.xyz@gmail.com Phone:6398801836 LinkedIn Skills Summary Programming Languages:C/C++, Python, JavaScript (ES6+), TypeScript, SQL, PHP Frameworks & Libraries:React.js, FastAPI, Express.js, Node.js, PyTorch FX, Tailwind CSS Architecture & Tools:Distributed Systems, Docker, Linux (Arch), Git/GitHub, PostgreSQL, Redis Core CS Concepts:Data Structures & Algorithms, Operating Systems, DBMS, Networking Fundamentals Open Source Contributions vllm-project / vllm Python, C++, Distributed Systems, LLM Serving Priority Scheduler Request Skipping Fix:Resolved a critical logic bug in SchedulingPolicy.PRIORITY preemption path where preempted requests appearing prior to the iteration cursor corrupted req_index bookkeeping, causing silent request skipping during scheduling steps; added regression tests in tests/v1/core/test_priority_preemption_bug.py under sustained KV pressure.[PR #49206] pytorch / pytorch Python, PyTorch FX, C++ Type Annotations:Resolved strict static type checker failures by dynamically constructing proper tuple type annotations forfx operator schemas.[Merged PR #189142] Sparse Tensor Stability:Fixed a hard Floating Point Exception (Division by Zero) crash insparsecompressedtodensefor malformed BSR tensors by implementing strict C++ dimension bounds.[Merged PR #190191] Automattic / jetpack PHP, React.js, WordPress API Schema Reliability:Updated the Jetpack Publicize REST API connection status schema to utilizeoneOfto prevent strict OpenAPI parser failures.[Merged PR #50030] Editor Stability:Resolved a block editor crash during standard Gallery to Slideshow transformations by safely extracting image data from nested innerBlocks.[Merged PR #50035] Architecture Refactoring:Replaced the usage of string IDs with the actual store object inuseSelectanduseDispatchcalls across shared stores to preserve TypeScript types.[Merged PR #49810] canonical / snapcraft Python, Linux DevOps Core Framework Fix:Resolved hardcoded fallbacks in framework linters by dynamically passingbuildbaseparameters, ensuring accurate base detection for complex systems.[Merged PR #6272] cpeditor / cpeditor C++, Qt, Python Core Features & Bug Fixes:Implemented dynamic font scaling configuration and resolved a critical duplicated search keyword bug in the editor interface.[Merged PR #1501], Training and Placement Cell National Institute of Technology Durgapur Projects Distributed Key-Value Database C++, React.js, Multithreading, Networking Architected a decentralized, peer-to-peer key-valuestorage solutioninC++, leveraging Consistent Hashing for balanced data partitioning and a Gossip Protocol for autonomous node discovery. Engineered ahigh-performanceconcurrent engine usingmulti-threadingandstd::sharedmutex, ensuring strictsynchro- nizationand thread-safe operations under heavy request loads. Implemented tunable Quorum Replication (N, W, R) for customizable consistency levels and a Write-Ahead Log (WAL) mecha- nism, guaranteeing instantaneous crash recovery.',
                'skills' => 'Parsed by AI'
            ]
        );
    }
}

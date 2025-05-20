# Run Performance Tests Script
# This script runs the performance tests for the ALT_LAS Chat Interface

param (
    [Parameter(Mandatory=$false)]
    [ValidateSet("load", "stress", "endurance", "all")]
    [string]$TestType = "load",
    
    [Parameter(Mandatory=$false)]
    [string]$BaseUrl = "http://localhost:3000",
    
    [Parameter(Mandatory=$false)]
    [int]$VUs = 10,
    
    [Parameter(Mandatory=$false)]
    [string]$Duration = "1m",
    
    [Parameter(Mandatory=$false)]
    [switch]$GenerateReport = $true
)

# Create results directory if it doesn't exist
$resultsDir = Join-Path $PSScriptRoot "..\performance\results"
if (-not (Test-Path $resultsDir)) {
    New-Item -ItemType Directory -Path $resultsDir | Out-Null
}

# Function to run a test
function Run-Test {
    param (
        [string]$TestName,
        [string]$TestScript,
        [string]$BaseUrl,
        [int]$VUs,
        [string]$Duration
    )
    
    Write-Host "Running $TestName test..." -ForegroundColor Green
    
    # Set environment variables for the test
    $env:K6_BASE_URL = $BaseUrl
    
    # Determine if we're using the script's stages or custom VUs and duration
    $k6Args = @()
    
    if ($TestType -eq "all") {
        # Use the script's stages
        $k6Args = @("run", $TestScript)
    } else {
        # Use custom VUs and duration
        $k6Args = @("run", "--vus", $VUs, "--duration", $Duration, $TestScript)
    }
    
    # Run the test
    & k6 $k6Args
    
    # Check if the test was successful
    if ($LASTEXITCODE -eq 0) {
        Write-Host "$TestName test completed successfully." -ForegroundColor Green
    } else {
        Write-Host "$TestName test failed with exit code $LASTEXITCODE." -ForegroundColor Red
    }
    
    # Copy the results to the results directory
    if ($GenerateReport) {
        $timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
        $resultFile = Join-Path $resultsDir "$($TestName.ToLower())-$timestamp.html"
        
        if (Test-Path "$($TestName.ToLower())-summary.html") {
            Copy-Item "$($TestName.ToLower())-summary.html" $resultFile
            Write-Host "Test report saved to $resultFile" -ForegroundColor Green
        } else {
            Write-Host "No test report found." -ForegroundColor Yellow
        }
    }
}

# Check if k6 is installed
try {
    $k6Version = & k6 version
    Write-Host "Using $k6Version" -ForegroundColor Green
} catch {
    Write-Host "k6 is not installed or not in the PATH. Please install k6 from https://k6.io/docs/getting-started/installation/" -ForegroundColor Red
    exit 1
}

# Run the tests
$performanceDir = Join-Path $PSScriptRoot "..\performance"

switch ($TestType) {
    "load" {
        $testScript = Join-Path $performanceDir "load-test.js"
        Run-Test -TestName "Load" -TestScript $testScript -BaseUrl $BaseUrl -VUs $VUs -Duration $Duration
    }
    "stress" {
        $testScript = Join-Path $performanceDir "stress-test.js"
        Run-Test -TestName "Stress" -TestScript $testScript -BaseUrl $BaseUrl -VUs $VUs -Duration $Duration
    }
    "endurance" {
        $testScript = Join-Path $performanceDir "endurance-test.js"
        Run-Test -TestName "Endurance" -TestScript $testScript -BaseUrl $BaseUrl -VUs $VUs -Duration $Duration
    }
    "all" {
        # Run all tests with their default configurations
        $loadTestScript = Join-Path $performanceDir "load-test.js"
        Run-Test -TestName "Load" -TestScript $loadTestScript -BaseUrl $BaseUrl -VUs $VUs -Duration $Duration
        
        $stressTestScript = Join-Path $performanceDir "stress-test.js"
        Run-Test -TestName "Stress" -TestScript $stressTestScript -BaseUrl $BaseUrl -VUs $VUs -Duration $Duration
        
        $enduranceTestScript = Join-Path $performanceDir "endurance-test.js"
        Run-Test -TestName "Endurance" -TestScript $enduranceTestScript -BaseUrl $BaseUrl -VUs $VUs -Duration $Duration
    }
}

# Generate combined report if all tests were run
if ($TestType -eq "all" -and $GenerateReport) {
    Write-Host "Generating combined report..." -ForegroundColor Green
    
    $timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
    $combinedReportFile = Join-Path $resultsDir "combined-report-$timestamp.html"
    
    # Create a simple HTML report that links to the individual reports
    $combinedReport = @"
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ALT_LAS Performance Test Report</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }
        h1, h2 {
            color: #0066cc;
        }
        .report-links {
            margin: 20px 0;
        }
        .report-link {
            display: block;
            margin: 10px 0;
            padding: 10px;
            background-color: #f5f5f5;
            border-radius: 5px;
            text-decoration: none;
            color: #333;
        }
        .report-link:hover {
            background-color: #e0e0e0;
        }
    </style>
</head>
<body>
    <h1>ALT_LAS Performance Test Report</h1>
    <p>Generated on $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")</p>
    
    <h2>Test Reports</h2>
    <div class="report-links">
        <a href="load-$timestamp.html" class="report-link">Load Test Report</a>
        <a href="stress-$timestamp.html" class="report-link">Stress Test Report</a>
        <a href="endurance-$timestamp.html" class="report-link">Endurance Test Report</a>
    </div>
</body>
</html>
"@
    
    $combinedReport | Out-File -FilePath $combinedReportFile -Encoding utf8
    
    Write-Host "Combined report saved to $combinedReportFile" -ForegroundColor Green
}

Write-Host "Performance tests completed." -ForegroundColor Green

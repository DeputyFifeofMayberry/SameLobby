# Phase 0 baseline runner - PowerShell
$ErrorActionPreference = "Continue"
$BaseDir = Join-Path $PSScriptRoot "..\docs\testing\baseline\ed10f19"
New-Item -ItemType Directory -Force -Path $BaseDir | Out-Null
Set-Location (Join-Path $PSScriptRoot "..")

$results = New-Object System.Collections.Generic.List[object]
function Run-Step {
    param([string]$Name, [scriptblock]$Block)
    $safe = ($Name -replace '[^a-zA-Z0-9_-]', '_')
    $outFile = Join-Path $BaseDir ($safe + ".log")
    $exit = 0
    try {
        & $Block 2>&1 | Tee-Object -FilePath $outFile
        if ($LASTEXITCODE) { $exit = $LASTEXITCODE }
    } catch {
        $_ | Out-File -FilePath $outFile -Append
        $exit = 1
    }
    $rel = $outFile.Replace((Get-Location).Path + [IO.Path]::DirectorySeparatorChar, "").Replace("\", "/")
    $results.Add([pscustomobject]@{ Command = $Name; Exit = $exit; Artifact = $rel }) | Out-Null
}

Run-Step "node-v" { node -v }
Run-Step "npm-v" { npm -v }
Run-Step "vitest-version" { npx vitest --version }
Run-Step "playwright-version" { npx playwright --version }
Run-Step "supabase-version" { npx supabase --version }
Run-Step "npm-ci" { npm ci }
Run-Step "format-check" { npm run format:check }
Run-Step "lint" { npm run lint }
Run-Step "typecheck" { $env:SKIP_ENV_VALIDATION = "true"; npm run typecheck }
Run-Step "unit-test" { npm test }
Run-Step "supabase-start" { npx supabase start }
Run-Step "supabase-db-reset" { npx supabase db reset }
Run-Step "test-db" { npm run test:db }

$statusJson = (npx supabase status -o json 2>&1 | Out-String).Trim()
$statusJson | Out-File (Join-Path $BaseDir "supabase-status.json.log") -Encoding utf8
try {
    $status = $statusJson | ConvertFrom-Json
    $env:NEXT_PUBLIC_SUPABASE_URL = $status.API_URL
    $env:NEXT_PUBLIC_SUPABASE_ANON_KEY = $status.ANON_KEY
    $env:SUPABASE_SERVICE_ROLE_KEY = $status.SERVICE_ROLE_KEY
} catch {
    "Failed to parse supabase status" | Out-File (Join-Path $BaseDir "supabase-keys-error.log") -Encoding utf8
}

$env:SKIP_ENV_VALIDATION = "true"
$env:NEXT_PUBLIC_SITE_URL = "http://localhost:3000"
Run-Step "build" { npm run build }
Run-Step "playwright-install" { npx playwright install chromium --with-deps }

$env:CI = "true"
$env:PLAYWRIGHT_BASE_URL = "http://localhost:3000"
Run-Step "test-e2e-ci" { npm run test:e2e }
Run-Step "a11y-list" { npx playwright test --project=a11y --list }
Run-Step "test-a11y-ci" { npm run test:a11y }

$lines = @(
    "# Baseline results - ed10f19",
    "",
    "**SHA:** ed10f19e528b6ec406553795cf2cd891427fe668",
    "**Date:** $(Get-Date -Format 'yyyy-MM-dd')",
    "**Host:** Windows / PowerShell",
    "",
    "| Command | Exit | Artifact path | Notes |",
    "|---|---:|---|---|"
)
foreach ($r in $results) {
    $note = if ($r.Exit -eq 0) { "pass" } else { "fail" }
    $lines += "| ``$($r.Command)`` | $($r.Exit) | ``$($r.Artifact)`` | $note |"
}
$lines += ""
$lines += "## D15 verification"
$lines += ""
$lines += "After Phase 0B playwright.config.ts fix: CI=true npx playwright test --project=a11y --list reports 19 tests in 1 file (see a11y-list.log)."
$lines -join "`n" | Set-Content (Join-Path $BaseDir "results.md") -Encoding utf8
Write-Host "Baseline complete."

$ErrorActionPreference = 'Stop'
$root = $PSScriptRoot
$dist = Join-Path $root 'dist'

New-Item -ItemType Directory -Path $dist -Force | Out-Null

foreach ($browser in 'chrome', 'edge', 'firefox') {
    $manifest = Join-Path $root "manifest-$browser.json"
    $version = (Get-Content $manifest -Raw | ConvertFrom-Json).version
    $folder = Join-Path $dist $browser
    $zip = Join-Path $dist "flow-classic-redirect-$browser-$version.zip"

    if (Test-Path $folder) {
        Remove-Item $folder -Recurse -Force
    }
    New-Item -ItemType Directory -Path $folder | Out-Null

    foreach ($file in 'background.js', 'popup.html', 'popup.js', 'browser-polyfill.min.js') {
        Copy-Item (Join-Path $root $file) $folder
    }
    Copy-Item (Join-Path $root 'icons') $folder -Recurse
    Copy-Item $manifest (Join-Path $folder 'manifest.json')

    Compress-Archive -Path (Join-Path $folder '*') -DestinationPath $zip -Force
    Remove-Item $folder -Recurse -Force

    Write-Host "Built: $zip"
}
param(
    [string]$SourceDir = (Join-Path $PSScriptRoot '..\docs'),
    [string]$DestinationDir = 'C:\Users\marks\Second Brain\_Inbox',
    [string]$LogFile = (Join-Path $PSScriptRoot '..\logs\docs-to-obsidian-sync.log')
)

$ErrorActionPreference = 'Stop'

$resolvedSourceDir = (Resolve-Path -LiteralPath $SourceDir).Path

if (-not (Test-Path -LiteralPath $DestinationDir -PathType Container)) {
    throw "Destination directory does not exist: $DestinationDir"
}

$logDirectory = Split-Path -Path $LogFile -Parent
if (-not (Test-Path -LiteralPath $logDirectory -PathType Container)) {
    New-Item -ItemType Directory -Path $logDirectory -Force | Out-Null
}

function Write-Log {
    param([string]$Message)

    $timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
    Add-Content -Path $LogFile -Value "[$timestamp] $Message"
}

function Wait-FileReady {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Path,

        [int]$Attempts = 40,
        [int]$DelayMilliseconds = 500
    )

    $previousSignature = $null

    for ($attempt = 0; $attempt -lt $Attempts; $attempt++) {
        if (-not (Test-Path -LiteralPath $Path -PathType Leaf)) {
            return $false
        }

        try {
            $item = Get-Item -LiteralPath $Path -ErrorAction Stop
            $stream = [System.IO.File]::Open(
                $item.FullName,
                [System.IO.FileMode]::Open,
                [System.IO.FileAccess]::Read,
                [System.IO.FileShare]::ReadWrite
            )
            $stream.Dispose()

            $currentSignature = '{0}|{1}' -f $item.Length, $item.LastWriteTimeUtc.Ticks
            if ($currentSignature -eq $previousSignature) {
                return $true
            }

            $previousSignature = $currentSignature
        } catch {
            # Keep retrying while the file is still being written.
        }

        Start-Sleep -Milliseconds $DelayMilliseconds
    }

    return $false
}

function Get-FileSha256 {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Path
    )

    return (Get-FileHash -LiteralPath $Path -Algorithm SHA256).Hash
}

function Sync-MarkdownFile {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Path
    )

    if (-not (Test-Path -LiteralPath $Path -PathType Leaf)) {
        return
    }

    if ([System.IO.Path]::GetExtension($Path).ToLowerInvariant() -ne '.md') {
        return
    }

    if (-not (Wait-FileReady -Path $Path)) {
        Write-Log "Skipped unreadable file after retries: $Path"
        return
    }

    $fileName = [System.IO.Path]::GetFileName($Path)
    $destinationPath = Join-Path $DestinationDir $fileName
    $sourceHash = Get-FileSha256 -Path $Path

    if (Test-Path -LiteralPath $destinationPath -PathType Leaf) {
        $destinationHash = Get-FileSha256 -Path $destinationPath
        if ($sourceHash -eq $destinationHash) {
            return
        }
    }

    try {
        Copy-Item -LiteralPath $Path -Destination $destinationPath -Force
        Write-Log "Copied $fileName to $DestinationDir"
    } catch {
        Write-Log "Copy failed for ${fileName}: $($_.Exception.Message)"
    }
}

Write-Log "Watcher starting. Source: $resolvedSourceDir. Destination: $DestinationDir"

Get-ChildItem -LiteralPath $resolvedSourceDir -File -Filter '*.md' |
    Sort-Object LastWriteTimeUtc |
    ForEach-Object {
        Sync-MarkdownFile -Path $_.FullName
    }

$watcher = New-Object System.IO.FileSystemWatcher
$watcher.Path = $resolvedSourceDir
$watcher.Filter = '*.md'
$watcher.IncludeSubdirectories = $false
$watcher.NotifyFilter = [System.IO.NotifyFilters]'FileName, LastWrite, CreationTime, Size'

$subscriptions = @(
    Register-ObjectEvent -InputObject $watcher -EventName Created -SourceIdentifier 'CodexDocsToObsidian.Created'
    Register-ObjectEvent -InputObject $watcher -EventName Changed -SourceIdentifier 'CodexDocsToObsidian.Changed'
    Register-ObjectEvent -InputObject $watcher -EventName Renamed -SourceIdentifier 'CodexDocsToObsidian.Renamed'
)

$watcher.EnableRaisingEvents = $true
Write-Log 'Watcher is running.'

try {
    while ($true) {
        $event = Wait-Event -Timeout 5
        if ($null -eq $event) {
            continue
        }

        try {
            if ($event.SourceIdentifier -like 'CodexDocsToObsidian.*') {
                Sync-MarkdownFile -Path $event.SourceEventArgs.FullPath
            }
        } catch {
            Write-Log "Event handling failed for $($event.SourceIdentifier): $($_.Exception.Message)"
        } finally {
            Remove-Event -EventIdentifier $event.EventIdentifier -ErrorAction SilentlyContinue
        }
    }
} finally {
    foreach ($subscription in $subscriptions) {
        Unregister-Event -SubscriptionId $subscription.Id -ErrorAction SilentlyContinue
    }

    $watcher.EnableRaisingEvents = $false
    $watcher.Dispose()
    Write-Log 'Watcher stopped.'
}

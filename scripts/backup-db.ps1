$ErrorActionPreference = "Stop"
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$backupDir = Join-Path $PSScriptRoot "..\backups"
New-Item -ItemType Directory -Force -Path $backupDir | Out-Null
$target = Join-Path $backupDir "ti-service-desk-$timestamp.sql"
docker exec ti-service-desk-db pg_dump -U ti_admin -d ti_service_desk | Out-File -Encoding utf8 $target
Write-Host "Backup criado em: $target"

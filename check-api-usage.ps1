# check-api-usage.ps1
# Script de Auditoría de Acoplamiento para ApiClient

Write-Host "--- Iniciando Auditoria de Arquitectura ---" -ForegroundColor Cyan
$apiClientUsage = Get-ChildItem -Path src -Recurse -Include *.ts, *.tsx | Select-String -Pattern "ApiClient\."

if ($apiClientUsage) {
    Write-Host "ALERTA: Se encontraron $($apiClientUsage.Count) acoplamientos con ApiClient:" -ForegroundColor Yellow
    foreach ($match in $apiClientUsage) {
        Write-Host "  - [$($match.Path)]: $($match.Line.Trim())"
    }
} else {
    Write-Host "✅ EXITO: No se encontraron acoplamientos remanentes con ApiClient." -ForegroundColor Green
}

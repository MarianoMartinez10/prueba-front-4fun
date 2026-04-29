# Script de Auditoría Interna: Detección de Acoplamiento (TFI UTN)
# --------------------------------------------------------------------------

$searchDir = "src"
$ignoreFiles = @("api.ts", "ProductApiService.ts", "OrderApiService.ts", "UserApiService.ts", "transport.ts")

Write-Host "--- Iniciando Auditoria de Arquitectura ---"

$patterns = "ApiClient.getProducts|ApiClient.getProductById|ApiClient.getUsers|ApiClient.getMyOrders|ApiClient.createOrder|ApiClient.updateOrderStatus"

$files = Get-ChildItem -Path $searchDir -Recurse -Include *.ts, *.tsx
$findings = @()

foreach ($file in $files) {
    if ($ignoreFiles -contains $file.Name) { continue }
    
    $matches = Select-String -Path $file.FullName -Pattern $patterns
    if ($matches) {
        foreach ($m in $matches) {
            $findings += $m
        }
    }
}

if ($findings.Count -gt 0) {
    Write-Host "ALERTA: Se encontraron $($findings.Count) acoplamientos con ApiClient:"
    foreach ($match in $findings) {
        $relativePath = $match.Path.Replace((Get-Location).Path + "\", "")
        Write-Host "  - [$relativePath]: $($match.Line.Trim())"
    }
    Write-Host "`n🚩 Deuda Tecnica: Estos componentes deben migrar a Domain Services."
} else {
    Write-Host "OK: Arquitectura Limpia."
}

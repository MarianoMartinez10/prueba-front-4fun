$srcDir = "src"
$files = Get-ChildItem -Path $srcDir -Filter *.ts* -Recurse | Where-Object { $_.Extension -match "\.tsx?$" }

Write-Host "--- Buscando Archivos Huérfanos ---"
$orphans = @()

foreach ($file in $files) {
    $fileName = $file.Name
    $baseName = [System.IO.Path]::GetFileNameWithoutExtension($fileName)
    
    # Ignorar archivos de sistema de Next.js
    if ($fileName -match "page\.tsx|layout\.tsx|route\.ts|middleware\.ts|loading\.tsx|error\.tsx|not-found\.tsx|globals\.css|index\.ts") {
        continue
    }

    # Buscar si el nombre del archivo aparece en otros archivos (excluyendo el mismo)
    $usage = Get-ChildItem -Path $srcDir -Filter *.ts* -Recurse | Select-String -Pattern "$baseName" -Exclude $fileName
    
    if (-not $usage) {
        $orphans += $file.FullName
    }
}

if ($orphans.Count -gt 0) {
    Write-Host "Se encontraron $($orphans.Count) posibles archivos huérfanos:" -ForegroundColor Yellow
    foreach ($orphan in $orphans) {
        Write-Host "  - $orphan"
    }
} else {
    Write-Host "No se encontraron archivos huérfanos. Estructura optimizada." -ForegroundColor Green
}

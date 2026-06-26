$blogDir = $PSScriptRoot

$newImages = @{
    "photo-1414235077428" = @{
        "index.html" = "photo-1616683670420-f726b59c9503"
    }
    "photo-1478146059778" = @{
        "wedding-budget-breakdown-by-category.html" = "photo-1515378791036-0648a3ef77b2"
        "wedding-catering-cost-guide-2026.html" = "photo-1517282053903-6e4337e57858"
        "index.html" = "photo-1603951772699-2919690d3576"
    }
    "photo-1465495976277" = @{
        "wedding-budget-vs-reality-what-I-saved.html" = "photo-1595076447053-496287238e69"
        "index.html" = "photo-1546519638-68e109498ffc"
    }
    "photo-1595431722838" = @{
        "wedding-photography-pricing-guide.html" = "photo-1498550764793-69dbf1c82f7f"
        "index.html" = "photo-1598979096089-78f1894a69ac"
    }
    "photo-1583939003579" = @{
        "how-to-create-wedding-budget-2026.html" = "photo-1617791160127-8049c17e7e89"
        "wedding-budget-template-free-download.html" = "photo-1595617795006-1f913165647a"
    }
    "photo-1544075164" = @{
        "index.html" = "photo-1519643381401-2277758662ab"
    }
    "photo-1522673607200" = @{
        "wedding-budget-template-free-download.html" = "photo-1504805572947-34fad45aed93"
    }
    "photo-1555243896" = @{
        "cheapest-month-to-get-married-2026.html" = "photo-1518360609644-4f2359d96b5d"
        "destination-wedding-cost-calculator.html" = "photo-1516450360452-9312f5e86fc7"
        "hidden-wedding-costs-you-didnt-expect.html" = "photo-1596326073828-434db08976a0"
        "wedding-catering-cost-guide-2026.html" = "photo-1551935755-213756d0d50e"
    }
    "photo-1519741497674" = @{
        "wedding-photography-pricing-guide.html" = "photo-1576091160399-112ba8d25d1d"
    }
    "photo-1511285560929" = @{
        "hidden-wedding-costs-you-didnt-expect.html" = "photo-1562690865-915da0902878"
        "wedding-budget-vs-reality-what-I-saved.html" = "photo-1557303886-2b2f4326d735"
        "index.html" = "photo-1500648767791-00dcc994a43e"
    }
    "photo-1519225421980" = @{
        "destination-wedding-cost-calculator.html" = "photo-1519163555275-b65007409c74"
        "index.html" = "photo-1546519638-68e109498ffc"
    }
    "photo-1513151233558" = @{
        "cheapest-month-to-get-married-2026.html" = "photo-1492684223066-81342ee5ff30"
        "index.html" = "photo-1557683316-973673baf926"
    }
    "photo-1519167758481" = @{
        "wedding-budget-breakdown-by-category.html" = "photo-1517282053903-6e4337e57858"
        "index.html" = "photo-1598979096089-78f1894a69ac"
    }
}

$files = Get-ChildItem $blogDir -Filter '*.html' | Where-Object { $_.Name -ne 'fix-duplicate-images.ps1' }

foreach ($f in $files) {
    $content = [System.IO.File]::ReadAllText($f.FullName)
    $changed = $false
    
    foreach ($oldId in $newImages.Keys) {
        $replacements = $newImages[$oldId]
        if ($replacements.ContainsKey($f.Name)) {
            $newId = $replacements[$f.Name]
            
            $oldSrc = "src=`"https://images.unsplash.com/photo-$oldId"
            $newSrc = "src=`"https://images.unsplash.com/photo-$newId"
            
            if ($content.Contains($oldSrc)) {
                $content = $content.Replace($oldSrc, $newSrc)
                $changed = $true
                Write-Host "  Replaced photo-$oldId with photo-$newId"
            }
        }
    }
    
    if ($changed) {
        [System.IO.File]::WriteAllText($f.FullName, $content)
        Write-Host "Updated: $($f.Name)"
    } else {
        Write-Host "No changes: $($f.Name)"
    }
}

Write-Host "Done!"

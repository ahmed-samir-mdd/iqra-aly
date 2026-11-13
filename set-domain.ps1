#requires -Version 5.1
<#
  يضبط النطاق النهائي للموقع في index.html وصفحات السياسات و sitemap.xml و robots.txt.
  يقرأ النطاق الحالي من وسم canonical ثم يستبدله في كل المواضع،
  فيمكن تشغيله أكثر من مرة عند تغيير النطاق.

  أمثلة:
    .\set-domain.ps1 -BaseUrl "https://iqraaly.pages.dev"
    .\set-domain.ps1 -BaseUrl "https://username.github.io/iqraaly-website"
#>
param(
  [Parameter(Mandatory = $true)]
  [string]$BaseUrl
)

$ErrorActionPreference = 'Stop'

try { [Console]::OutputEncoding = [System.Text.Encoding]::UTF8 } catch { }

$BaseUrl = $BaseUrl.Trim().TrimEnd('/')

if ($BaseUrl -notmatch '^https://[^/\s]+(\.[^/\s]+)+(/[^\s?#]*)?$') {
  throw 'اكتب رابطًا مطلقًا يبدأ بـ https:// دون / أو ? أو # في النهاية.'
}

$indexPath = Join-Path (Get-Location) 'index.html'
if (-not (Test-Path $indexPath)) {
  throw 'شغّل السكربت من داخل مجلد الموقع (حيث يوجد index.html).'
}

$utf8 = New-Object System.Text.UTF8Encoding($false)
$index = [System.IO.File]::ReadAllText($indexPath, [System.Text.Encoding]::UTF8)

if ($index -notmatch 'rel="canonical" href="([^"]+)"') {
  throw 'لم يُعثر على وسم canonical في index.html.'
}

$old = $Matches[1].TrimEnd('/')
if ($old -eq $BaseUrl) {
  Write-Host "النطاق مضبوط بالفعل: $BaseUrl"
  exit 0
}

$files = @('index.html', 'privacy.html', 'terms.html', 'sitemap.xml', 'robots.txt')
$total = 0

foreach ($file in $files) {
  $path = Join-Path (Get-Location) $file
  if (-not (Test-Path $path)) {
    throw "الملف غير موجود: $file"
  }

  $text = [System.IO.File]::ReadAllText($path, [System.Text.Encoding]::UTF8)
  $count = ([regex]::Matches($text, [regex]::Escape($old))).Count

  if ($count -eq 0) {
    Write-Host "تخطّي $file (لا يحتوي النطاق الحالي)."
    continue
  }

  [System.IO.File]::WriteAllText($path, $text.Replace($old, $BaseUrl), $utf8)
  Write-Host "تم تحديث $file ($count موضعًا)."
  $total += $count
}

if ($total -eq 0) {
  throw "لم يُعثر على النطاق الحالي ($old) في ملفات الموقع."
}

Write-Host ''
Write-Host "النطاق الحالي: $BaseUrl"
Write-Host 'الخطوة التالية: ارفع الموقع ثم أضف sitemap.xml في Google Search Console.'

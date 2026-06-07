$ErrorActionPreference = "Stop"

$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$DataDir = Join-Path $Root "data"
$DataFile = Join-Path $DataDir "classes.json"
$CallbackFile = Join-Path $DataDir "callbacks.json"
$Port = 8080

if (!(Test-Path $DataDir)) {
  New-Item -ItemType Directory -Path $DataDir | Out-Null
}

if (!(Test-Path $DataFile)) {
  "[]" | Set-Content -Path $DataFile -Encoding UTF8
}

if (!(Test-Path $CallbackFile)) {
  "[]" | Set-Content -Path $CallbackFile -Encoding UTF8
}

function Get-ContentType {
  param([string]$Path)

  switch ([System.IO.Path]::GetExtension($Path).ToLowerInvariant()) {
    ".html" { return "text/html; charset=utf-8" }
    ".css" { return "text/css; charset=utf-8" }
    ".js" { return "application/javascript; charset=utf-8" }
    ".json" { return "application/json; charset=utf-8" }
    ".png" { return "image/png" }
    ".jpg" { return "image/jpeg" }
    ".jpeg" { return "image/jpeg" }
    ".svg" { return "image/svg+xml" }
    default { return "application/octet-stream" }
  }
}

function Read-JsonList {
  param([string]$Path)

  $raw = Get-Content -Path $Path -Raw -Encoding UTF8
  if ([string]::IsNullOrWhiteSpace($raw)) {
    return @()
  }

  $parsed = $raw | ConvertFrom-Json
  if ($null -eq $parsed) {
    return @()
  }

  return @($parsed)
}

function Write-JsonList {
  param(
    [string]$Path,
    [array]$Items
  )

  $json = $Items | ConvertTo-Json -Depth 10
  if ([string]::IsNullOrWhiteSpace($json)) {
    $json = "[]"
  }
  Set-Content -Path $Path -Value $json -Encoding UTF8
}

function Read-HttpRequest {
  param([System.Net.Sockets.NetworkStream]$Stream)

  $buffer = New-Object byte[] 8192
  $bytes = New-Object System.Collections.Generic.List[byte]
  $headerText = ""
  $contentLength = 0

  while ($true) {
    $read = $Stream.Read($buffer, 0, $buffer.Length)
    if ($read -le 0) {
      break
    }

    for ($i = 0; $i -lt $read; $i++) {
      $bytes.Add($buffer[$i])
    }

    $text = [System.Text.Encoding]::UTF8.GetString($bytes.ToArray())
    $headerEnd = $text.IndexOf("`r`n`r`n")

    if ($headerEnd -ge 0) {
      $headerText = $text.Substring(0, $headerEnd)
      foreach ($line in $headerText -split "`r`n") {
        if ($line.ToLowerInvariant().StartsWith("content-length:")) {
          $contentLength = [int]($line.Split(":", 2)[1].Trim())
        }
      }

      $bodyStart = $headerEnd + 4
      $bodyBytesRead = $bytes.Count - $bodyStart
      if ($bodyBytesRead -ge $contentLength) {
        $body = ""
        if ($contentLength -gt 0) {
          $body = $text.Substring($bodyStart, $contentLength)
        }

        $firstLine = ($headerText -split "`r`n")[0]
        $parts = $firstLine -split " "
        return @{
          Method = $parts[0]
          Path = $parts[1]
          Body = $body
        }
      }
    }
  }

  return $null
}

function Send-HttpResponse {
  param(
    [System.Net.Sockets.NetworkStream]$Stream,
    [int]$Status,
    [string]$StatusText,
    [byte[]]$BodyBytes,
    [string]$ContentType
  )

  $headers = "HTTP/1.1 $Status $StatusText`r`nContent-Type: $ContentType`r`nContent-Length: $($BodyBytes.Length)`r`nConnection: close`r`n`r`n"
  $headerBytes = [System.Text.Encoding]::ASCII.GetBytes($headers)
  $Stream.Write($headerBytes, 0, $headerBytes.Length)
  if ($BodyBytes.Length -gt 0) {
    $Stream.Write($BodyBytes, 0, $BodyBytes.Length)
  }
}

function Send-Text {
  param(
    [System.Net.Sockets.NetworkStream]$Stream,
    [int]$Status,
    [string]$StatusText,
    [string]$Text,
    [string]$ContentType = "text/plain; charset=utf-8"
  )

  $bodyBytes = [System.Text.Encoding]::UTF8.GetBytes($Text)
  Send-HttpResponse -Stream $Stream -Status $Status -StatusText $StatusText -BodyBytes $bodyBytes -ContentType $ContentType
}

$listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Loopback, $Port)
$listener.Start()

Write-Host ""
Write-Host "RightLearn backend is running."
Write-Host "Open this website address in your browser:"
Write-Host "http://localhost:$Port/"
Write-Host ""
Write-Host "Submitted tuition classes will be saved in:"
Write-Host $DataFile
Write-Host "Callback requests will be saved in:"
Write-Host $CallbackFile
Write-Host ""
Write-Host "Keep this window open while using the website. Press Ctrl+C to stop."

while ($true) {
  $client = $listener.AcceptTcpClient()
  $stream = $client.GetStream()

  try {
    $request = Read-HttpRequest -Stream $stream
    if ($null -eq $request) {
      Send-Text -Stream $stream -Status 400 -StatusText "Bad Request" -Text "Bad request"
      continue
    }

    $pathOnly = ($request.Path -split "\?")[0]

    if ($pathOnly -eq "/api/classes" -and $request.Method -eq "GET") {
      Send-Text -Stream $stream -Status 200 -StatusText "OK" -Text (Get-Content -Path $DataFile -Raw -Encoding UTF8) -ContentType "application/json; charset=utf-8"
      continue
    }

    if ($pathOnly -eq "/api/classes" -and $request.Method -eq "POST") {
      $incoming = $request.Body | ConvertFrom-Json

      if ([string]::IsNullOrWhiteSpace($incoming.name) -or [string]::IsNullOrWhiteSpace($incoming.city) -or [string]::IsNullOrWhiteSpace($incoming.phone)) {
        Send-Text -Stream $stream -Status 400 -StatusText "Bad Request" -Text '{"message":"Class name, city, and phone number are required."}' -ContentType "application/json; charset=utf-8"
        continue
      }

      $classes = Read-JsonList -Path $DataFile
      $saved = [ordered]@{
        id = [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()
        name = [string]$incoming.name
        owner = [string]$incoming.owner
        city = [string]$incoming.city
        locality = [string]$incoming.locality
        subjects = [string]$incoming.subjects
        level = [string]$incoming.level
        fee = [int]$incoming.fee
        phone = [string]$incoming.phone
        address = [string]$incoming.address
        nextBatch = [string]$incoming.nextBatch
        feeHelp = [bool]$incoming.feeHelp
        hostel = [bool]$incoming.hostel
        girlsSafe = [bool]$incoming.girlsSafe
        createdAt = [DateTimeOffset]::UtcNow.ToString("o")
      }

      $classes = @($classes) + @([pscustomobject]$saved)
      Write-JsonList -Path $DataFile -Items $classes
      Send-Text -Stream $stream -Status 201 -StatusText "Created" -Text (($saved | ConvertTo-Json -Depth 10)) -ContentType "application/json; charset=utf-8"
      continue
    }

    if ($pathOnly -eq "/api/callbacks" -and $request.Method -eq "GET") {
      Send-Text -Stream $stream -Status 200 -StatusText "OK" -Text (Get-Content -Path $CallbackFile -Raw -Encoding UTF8) -ContentType "application/json; charset=utf-8"
      continue
    }

    if ($pathOnly -eq "/api/callbacks" -and $request.Method -eq "POST") {
      $incoming = $request.Body | ConvertFrom-Json

      if ([string]::IsNullOrWhiteSpace($incoming.name) -or [string]::IsNullOrWhiteSpace($incoming.phone) -or [string]::IsNullOrWhiteSpace($incoming.need)) {
        Send-Text -Stream $stream -Status 400 -StatusText "Bad Request" -Text '{"message":"Name, phone number, and support need are required."}' -ContentType "application/json; charset=utf-8"
        continue
      }

      $callbacks = Read-JsonList -Path $CallbackFile
      $saved = [ordered]@{
        id = [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()
        name = [string]$incoming.name
        phone = [string]$incoming.phone
        need = [string]$incoming.need
        status = "new"
        createdAt = [DateTimeOffset]::UtcNow.ToString("o")
      }

      $callbacks = @($callbacks) + @([pscustomobject]$saved)
      Write-JsonList -Path $CallbackFile -Items $callbacks
      Send-Text -Stream $stream -Status 201 -StatusText "Created" -Text (($saved | ConvertTo-Json -Depth 10)) -ContentType "application/json; charset=utf-8"
      continue
    }

    $path = [Uri]::UnescapeDataString($pathOnly.TrimStart("/"))
    if ([string]::IsNullOrWhiteSpace($path)) {
      $path = "index.html"
    }

    $filePath = [System.IO.Path]::GetFullPath((Join-Path $Root $path))
    $rootPath = [System.IO.Path]::GetFullPath($Root)

    if (!$filePath.StartsWith($rootPath, [System.StringComparison]::OrdinalIgnoreCase) -or !(Test-Path $filePath -PathType Leaf)) {
      Send-Text -Stream $stream -Status 404 -StatusText "Not Found" -Text "Not found"
      continue
    }

    $bytes = [System.IO.File]::ReadAllBytes($filePath)
    Send-HttpResponse -Stream $stream -Status 200 -StatusText "OK" -BodyBytes $bytes -ContentType (Get-ContentType -Path $filePath)
  } catch {
    Send-Text -Stream $stream -Status 500 -StatusText "Server Error" -Text ("Server error: " + $_.Exception.Message)
  } finally {
    $stream.Close()
    $client.Close()
  }
}

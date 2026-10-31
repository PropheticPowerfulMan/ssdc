$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$envPath = Join-Path $projectRoot '.env'
if (Test-Path -LiteralPath $envPath) { throw '.env existe déjà. Conservation des clés existantes.' }
function New-RandomSecret {
  $bytes = New-Object byte[] 32
  $rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
  $rng.GetBytes($bytes)
  $rng.Dispose()
  return [Convert]::ToBase64String($bytes)
}
$dbSecret = (New-RandomSecret).Replace('+','a').Replace('/','b').Replace('=','')
$contents = @(
  "POSTGRES_PASSWORD=$dbSecret"
  "KEYCLOAK_ADMIN_PASSWORD=$(New-RandomSecret)"
  "OIDC_CLIENT_SECRET=$(New-RandomSecret)"
  "DEVELOPMENT_KEK=$(New-RandomSecret)"
)
[System.IO.File]::WriteAllLines($envPath, $contents)
Write-Host 'Secrets locaux générés dans .env (ignoré par Git).'

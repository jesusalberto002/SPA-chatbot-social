param(
  [Parameter(Mandatory = $false)]
  [string]$AccountId = "262295215678",

  [Parameter(Mandatory = $false)]
  [string]$Region = "ap-southeast-2",

  [Parameter(Mandatory = $false)]
  [string]$RepositoryName = "demo-dev-backend",

  [Parameter(Mandatory = $false)]
  [string]$LocalImageName = "demo-backend",

  [Parameter(Mandatory = $false)]
  [string]$Tag = "",

  [Parameter(Mandatory = $false)]
  [string]$AwsProfile = "",

  [Parameter(Mandatory = $false)]
  [string]$BackendDir = "",

  [Parameter(Mandatory = $false)]
  [string]$TerraformDir = ""
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Invoke-External {
  param(
    [Parameter(Mandatory = $true)]
    [string]$Command
  )
  Write-Host ">> $Command" -ForegroundColor Cyan
  Invoke-Expression $Command
}

if ([string]::IsNullOrWhiteSpace($BackendDir)) {
  $BackendDir = $PSScriptRoot
}

if ([string]::IsNullOrWhiteSpace($TerraformDir)) {
  $TerraformDir = (Resolve-Path (Join-Path $PSScriptRoot "..\terraform")).Path
}

if ([string]::IsNullOrWhiteSpace($Tag)) {
  try {
    $gitSha = (git -C (Resolve-Path (Join-Path $PSScriptRoot "..")).Path rev-parse --short HEAD).Trim()
    if (-not [string]::IsNullOrWhiteSpace($gitSha)) {
      $Tag = "sha-$gitSha"
    }
  } catch {
    # Fall back to timestamp if git is unavailable.
  }

  if ([string]::IsNullOrWhiteSpace($Tag)) {
    $Tag = "ts-" + (Get-Date -Format "yyyyMMdd-HHmmss")
  }
}

$profileArg = ""
if (-not [string]::IsNullOrWhiteSpace($AwsProfile)) {
  $profileArg = "--profile `"$AwsProfile`""
}

$repositoryUri = "$AccountId.dkr.ecr.$Region.amazonaws.com/$RepositoryName"
$localTaggedImage = "$LocalImageName`:$Tag"
$remoteTaggedImage = "$repositoryUri`:$Tag"

Write-Host ""
Write-Host "=== Deploy Configuration ===" -ForegroundColor Yellow
Write-Host "BackendDir     : $BackendDir"
Write-Host "TerraformDir   : $TerraformDir"
Write-Host "Region         : $Region"
Write-Host "AccountId      : $AccountId"
Write-Host "RepositoryName : $RepositoryName"
Write-Host "Image Tag      : $Tag"
if (-not [string]::IsNullOrWhiteSpace($AwsProfile)) {
  Write-Host "AWS Profile    : $AwsProfile"
}
Write-Host ""

# 1) Build image
Set-Location $BackendDir
Invoke-External "docker build -t `"$localTaggedImage`" ."

# 2) ECR login
$loginCmd = "aws ecr get-login-password --region `"$Region`" $profileArg | docker login --username AWS --password-stdin `"$AccountId.dkr.ecr.$Region.amazonaws.com`""
Invoke-External $loginCmd

# 3) Tag and push
Invoke-External "docker tag `"$localTaggedImage`" `"$remoteTaggedImage`""
Invoke-External "docker push `"$remoteTaggedImage`""

# 4) Apply Terraform with this exact tag
Set-Location $TerraformDir
Invoke-External "terraform apply -var `"ecs_image_tag=$Tag`""

Write-Host ""
Write-Host "Deployment complete." -ForegroundColor Green
Write-Host "ECR image: $remoteTaggedImage"
Write-Host "Next: check ECS service events and CloudWatch logs."

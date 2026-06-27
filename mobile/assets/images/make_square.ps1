Add-Type -AssemblyName System.Drawing
$srcPath = "c:\Users\Lenovo\OneDrive\Desktop\eyeglaze\mobile\assets\images\logo.png"
$destPath = "c:\Users\Lenovo\OneDrive\Desktop\eyeglaze\mobile\assets\images\logo_square.png"

$srcImg = [System.Drawing.Image]::FromFile($srcPath)
$bmp = New-Object System.Drawing.Bitmap 1024, 1024
$g = [System.Drawing.Graphics]::FromImage($bmp)

$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
$g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality

$g.Clear([System.Drawing.Color]::Transparent)

# Let's set target width to 600px (around 58% of canvas) to safely fit inside the adaptive icon's circle safe zone
$targetWidth = 600
$targetHeight = [int]($targetWidth * ($srcImg.Height / $srcImg.Width))
$x = [int]((1024 - $targetWidth) / 2)
$y = [int]((1024 - $targetHeight) / 2)

$g.DrawImage($srcImg, $x, $y, $targetWidth, $targetHeight)

$g.Dispose()
$srcImg.Dispose()

$bmp.Save($destPath, [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Dispose()
Write-Output "Successfully created square logo image at $destPath"

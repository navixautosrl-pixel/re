# Generates an authorized test video on Windows: synthetic speech (System.Speech, the system's
# English voice) over an FFmpeg test pattern. Used in CI for the real-Whisper end-to-end test.
#   powershell -File make_test_speech.ps1 -Out test_speech.mp4 -Ffmpeg path\to\ffmpeg.exe
param([string]$Out = "test_speech.mp4", [string]$Ffmpeg = "ffmpeg")
$ErrorActionPreference = "Stop"

$sentences = @(
  "Hello and welcome to this test episode about recording clean audio.",
  "The first step is choosing a quiet room without strong echo.",
  "Bare walls reflect sound, so curtains and carpets help a lot.",
  "The second step is keeping the microphone at a constant distance.",
  "About one hand away from your mouth works well for speech.",
  "If you move too much, the loudness of your voice changes from one sentence to the next.",
  "The third step is checking the input level before you record.",
  "The peaks should never reach the red zone of the meter.",
  "It is easier to raise the volume later than to repair distortion.",
  "Now let us talk about editing.",
  "When editing, remove very long pauses but keep the natural rhythm of speech.",
  "Short breaths can stay, because they make the voice sound human.",
  "Constant background noise can be reduced with a simple filter.",
  "Do not overdo the filter, or the voice starts to sound metallic.",
  "Why does all of this matter for short clips?",
  "Because people close a clip in the first seconds if the sound is unpleasant.",
  "Clean sound helps them stay focused on the message.",
  "Subtitles help just as much, especially when the phone is on silent.",
  "Many people watch clips without sound on public transport.",
  "That is why the text must be large, high contrast and correctly synchronized.",
  "The last tip is to listen to the full recording before publishing.",
  "This is how you find the mistakes you missed while editing.",
  "Also check the rights for any music or images used in the material.",
  "Only use content that you are allowed to publish.",
  "In short, a quiet room, a stable microphone, a correct level and careful editing.",
  "With these simple steps, any recording can sound much more professional.",
  "Thank you for listening, and see you in the next episode."
)

Add-Type -AssemblyName System.Speech
$synth = New-Object System.Speech.Synthesis.SpeechSynthesizer
$wav = Join-Path (Get-Location).Path ([System.IO.Path]::GetFileNameWithoutExtension($Out) + ".wav")
$synth.SetOutputToWaveFile($wav)
$prompt = New-Object System.Speech.Synthesis.PromptBuilder
foreach ($s in $sentences) {
  $prompt.AppendText($s)
  $prompt.AppendBreak([TimeSpan]::FromMilliseconds((Get-Random -Minimum 400 -Maximum 1300)))
}
$synth.Speak($prompt)
$synth.Dispose()

& $Ffmpeg -hide_banner -loglevel error -y -f lavfi -i "testsrc2=size=1280x720:rate=30" -i $wav `
  -shortest -c:v libx264 -preset veryfast -pix_fmt yuv420p -c:a aac $Out
if ($LASTEXITCODE -ne 0) { throw "ffmpeg failed" }
Remove-Item $wav
Write-Host "Test video: $Out"

---
name: video-optimization
description: Web video done right — when to use video vs image/animation, ffmpeg encoding to AV1/VP9/H.264 MP4+WebM with sane bitrates, poster frames, hero background video rules, lazy loading, captions (WebVTT), autoplay/mute policies, and third-party embeds via facade. Use when a page includes any video. Requires ffmpeg (present in this sandbox).
---

# Video optimization

## Purpose

Video that looks good, starts fast, never becomes the LCP bottleneck, and is accessible.

## When to activate

Hero/background videos, product demos, testimonials on video, YouTube/Vimeo embeds.

## Decide first

- Does motion carry information (product use, process)? If it's ambience only, a still image or CSS gradient animation is cheaper.
- Hero background video: ≤ ~1.5–2.5 MB for a ~8–12s loop at 1280–1920px; otherwise use a poster image and play on demand.

## Procedure (ffmpeg — verified present at `/usr/bin/ffmpeg`)

1. **Inspect source**: `ffprobe -v error -show_entries stream=codec_name,width,height,r_frame_rate,bit_rate -of compact input.mov`
2. **Encode H.264 MP4 (universal)**:
   ```bash
   ffmpeg -i in.mov -an -vf "scale=1600:-2,fps=30" -c:v libx264 -preset slow -crf 26 -pix_fmt yuv420p -movflags +faststart hero-1600.mp4
   ```
   `-an` drops audio for background loops; `+faststart` moves the index to the start (playback begins before full download).
3. **Encode VP9 WebM** (smaller in Chromium/Firefox): `ffmpeg -i in.mov -an -vf "scale=1600:-2,fps=30" -c:v libvpx-vp9 -b:v 0 -crf 36 -row-mt 1 hero-1600.webm`
   AV1 (`libsvtav1`/`libaom-av1`) only if the ffmpeg build has it: `ffmpeg -hide_banner -encoders | grep -E "av1"`.
4. **Mobile variant**: `scale=960:-2`, higher CRF; select with `<source media>`.
5. **Poster**: `ffmpeg -ss 00:00:01 -i hero-1600.mp4 -frames:v 1 -q:v 3 poster.jpg` → then convert with `image-optimization` to AVIF/WebP.
6. **Markup**:
   ```html
   <video class="hero-video" autoplay muted loop playsinline preload="none" poster="/media/poster.avif" width="1600" height="900" aria-hidden="true">
     <source src="/media/hero-960.webm" type="video/webm" media="(max-width: 800px)">
     <source src="/media/hero-1600.webm" type="video/webm">
     <source src="/media/hero-1600.mp4" type="video/mp4">
   </video>
   <button class="video-toggle" aria-pressed="false">Oprește animația</button>
   ```
   Under `prefers-reduced-motion: reduce` remove `autoplay` via JS (or don't add it) and show the poster. Decorative → `aria-hidden`; informative → visible text equivalent + captions.
7. **Captions** for speech: `<track kind="captions" src="/media/demo.ro.vtt" srclang="ro" label="Română" default>`.
8. **Embeds (YouTube/Vimeo)**: facade pattern — static thumbnail + play button; load the iframe on click (`youtube-nocookie.com`), with `title` on the iframe. Saves ~500 KB+ JS and avoids pre-consent cookies (see `gdpr-privacy`).
9. **Lazy**: below-the-fold videos `preload="none"` and start loading via IntersectionObserver.

## Failure prevention

- Video as LCP element with no poster → slow LCP; the poster (optimized image) should be the LCP candidate.
- Autoplay without `muted playsinline` → blocked on iOS/Chrome.
- Missing pause control on loops > 5s (WCAG 2.2.2).
- Serving a 30 MB camera file.

## Verification checklist

- [ ] `ls -la media/` sizes within budget; `ffprobe` confirms codec, dimensions, `-movflags faststart` (moov before mdat).
- [ ] Network tab (Playwright `page.on('response')`): video not requested before LCP when `preload="none"`.
- [ ] Reduced motion run shows poster, no playback.
- [ ] Keyboard can pause; captions toggle available for speech.

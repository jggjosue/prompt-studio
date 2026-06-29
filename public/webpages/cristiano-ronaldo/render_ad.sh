#!/bin/zsh
set -euo pipefail

input_a="images/Render_3D_cinematográfico_y_dinámico_202606091350 (1).jpeg"
input_b="images/Render_3D_cinematográfico_y_dinámico_202606091350 (2).jpeg"
output="cr7_portugal_2026_ad_5s_4k60.mp4"

ffmpeg -y \
  -loop 1 -framerate 60 -t 3 -i "$input_a" \
  -loop 1 -framerate 60 -t 4 -i "$input_b" \
  -f lavfi -t 5 -i "anoisesrc=color=brown:amplitude=0.16:sample_rate=48000" \
  -f lavfi -t 5 -i "sine=frequency=52:sample_rate=48000" \
  -f lavfi -t 0.55 -i "anoisesrc=color=white:amplitude=0.55:sample_rate=48000" \
  -filter_complex "
    [0:v]scale=2150:1200,
      zoompan=z='1.04+0.0018*on':
      x='iw/2-(iw/zoom/2)+130*sin(on/20)':
      y='ih/2-(ih/zoom/2)+35*cos(on/16)':
      d=180:s=1920x1080:fps=60,
      trim=duration=2.2,fps=60,settb=expr=1/60,setpts=N/(60*TB),
      eq=contrast=1.12:saturation=1.08:brightness=-0.08,
      vignette=PI/4[opening];

    [1:v]scale=2150:1200,
      zoompan=z='1.09+0.0011*min(on,90)':
      x='iw/2-(iw/zoom/2)-110+1.35*min(on,90)':
      y='ih/2-(ih/zoom/2)+45-0.45*min(on,90)':
      d=240:s=1920x1080:fps=60,
      trim=duration=2.8,fps=60,settb=expr=1/60,setpts=N/(60*TB),
      eq=contrast=1.16:saturation=1.18:brightness=-0.015,
      vignette=PI/4[hero];

    [opening][hero]concat=n=2:v=1:a=0[sequence];

    color=c=white:s=1920x1080:r=60:d=5,format=rgba,
      fade=t=in:st=2.10:d=0.06:alpha=1,
      fade=t=out:st=2.18:d=0.34:alpha=1[flash];
    [sequence][flash]overlay=shortest=1[flashed];

    [flashed]drawbox=x=0:y=0:w=iw:h=ih:color=white@0.18:t=fill:
      enable='between(t,2.18,2.23)',
      scale=3840:2160:flags=lanczos,
      format=yuv420p[video];

    [2:a]highpass=f=25,lowpass=f=260,volume=0.45[rumble];
    [3:a]volume=0.16,lowpass=f=110[bass];
    [4:a]highpass=f=500,lowpass=f=9000,
      afade=t=in:st=0:d=0.03,
      afade=t=out:st=0.12:d=0.43,
      adelay=2180|2180[impact];
    [rumble][bass][impact]amix=inputs=3:duration=longest:normalize=0,
      alimiter=limit=0.92,
      afade=t=out:st=4.72:d=0.28[audio]
  " \
  -map "[video]" -map "[audio]" \
  -t 5 -r 60 \
  -c:v libx264 -preset fast -crf 18 -profile:v high -level 5.2 \
  -pix_fmt yuv420p -movflags +faststart \
  -c:a aac -b:a 256k -ar 48000 \
  "$output"

printf 'Created %s\n' "$output"

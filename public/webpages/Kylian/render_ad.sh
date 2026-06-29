#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT"

shopt -s nullglob
sprint=(images/Kylian_Mbapp*.jpeg)
portrait=(images/Mbapp*.jpeg)

if (( ${#sprint[@]} < 3 || ${#portrait[@]} < 2 )); then
  echo "Expected at least three sprint images and two portrait images in images/." >&2
  exit 1
fi

mkdir -p output

ffmpeg -y \
  -loop 1 -framerate 30 -t 1.20 -i "${portrait[1]}" \
  -loop 1 -framerate 30 -t 0.78 -i "${sprint[0]}" \
  -loop 1 -framerate 30 -t 0.78 -i "${sprint[2]}" \
  -loop 1 -framerate 30 -t 0.84 -i "${sprint[3]}" \
  -loop 1 -framerate 30 -t 1.40 -i "${portrait[0]}" \
  -f lavfi -t 5 -i "color=c=black@0.0:s=1920x1080:r=30,format=rgba" \
  -f lavfi -t 5 -i "anoisesrc=color=pink:amplitude=0.08:r=48000" \
  -f lavfi -t 5 -i "sine=frequency=54:sample_rate=48000" \
  -filter_complex "
    [0:v]scale=2304:1296,crop=1920:1080,
      zoompan=z='min(zoom+0.0015,1.09)':x='iw/2-(iw/zoom/2)+35*sin(on/15)':y='ih/2-(ih/zoom/2)':d=1:s=1920x1080:fps=30,
      eq=brightness=-0.42:contrast=1.18:saturation=0.72,
      fade=t=in:st=0:d=0.22[v0];
    [1:v]scale=2304:1296,crop=1920:1080,
      zoompan=z='1.08+0.0018*on':x='iw/2-(iw/zoom/2)-130+on*6':y='ih/2-(ih/zoom/2)+20*sin(on/5)':d=1:s=1920x1080:fps=30,
      eq=contrast=1.14:saturation=1.18[v1];
    [2:v]scale=2304:1296,crop=1920:1080,
      zoompan=z='1.10+0.0022*on':x='iw/2-(iw/zoom/2)+150-on*8':y='ih/2-(ih/zoom/2)-25*sin(on/4)':d=1:s=1920x1080:fps=30,
      eq=contrast=1.18:saturation=1.24[v2];
    [3:v]scale=2304:1296,crop=1920:1080,
      zoompan=z='1.08+0.0028*on':x='iw/2-(iw/zoom/2)-80+on*8':y='ih/2-(ih/zoom/2)':d=1:s=1920x1080:fps=30,
      eq=contrast=1.22:saturation=1.30[v3];
    [4:v]scale=2304:1296,crop=1920:1080,
      zoompan=z='1.12':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)-20':d=1:s=1920x1080:fps=30,
      eq=contrast=1.22:saturation=1.08,
      fade=t=in:st=0:d=0.08[v4];
    [v0][v1][v2][v3][v4]concat=n=5:v=1:a=0[base];

    [5:v]
      drawbox=x='-500+900*(t-2.0)':y=185:w=760:h=5:color=0x49cfff@0.52:t=fill:enable='between(t,2.0,3.65)',
      drawbox=x='-850+1150*(t-2.0)':y=325:w=980:h=3:color=0x96ebff@0.58:t=fill:enable='between(t,2.0,3.65)',
      drawbox=x='-650+1020*(t-2.0)':y=470:w=840:h=8:color=0x0e7cff@0.47:t=fill:enable='between(t,2.0,3.65)',
      drawbox=x='-1000+1320*(t-2.0)':y=655:w=1100:h=4:color=0x50d7ff@0.52:t=fill:enable='between(t,2.0,3.65)',
      drawbox=x='-760+1080*(t-2.0)':y=810:w=900:h=6:color=0x008cff@0.46:t=fill:enable='between(t,2.0,3.65)',
      drawbox=x=0:y=0:w=iw:h=ih:color=0x087cff@0.28:t=fill:enable='between(t,3.44,3.58)',
      fade=t=in:st=2.0:d=0.18:alpha=1,
      fade=t=out:st=3.55:d=0.35:alpha=1[energy];
    [base][energy]overlay=shortest=1,
      vignette=PI/5,
      colorbalance=bs=.10:gs=.025,
      curves=all='0/0 0.18/0.10 0.62/0.72 1/1',
      fade=t=out:st=4.82:d=0.18,
      setsar=1,format=yuv420p[vout];

    [6:a]highpass=f=180,lowpass=f=5200,
      volume='0.05+0.35*between(t,1.15,3.60)+0.16*between(t,3.60,5.0)'[whoosh];
    [7:a]lowpass=f=110,
      volume='0.02+0.32*between(t,3.38,3.68)'[impact];
    [whoosh][impact]amix=inputs=2:duration=first,
      afade=t=in:st=0:d=0.35,
      afade=t=out:st=4.65:d=0.35,
      alimiter=limit=0.88[aout]
  " \
  -map "[vout]" -map "[aout]" \
  -t 5 -r 30 \
  -c:v libx264 -preset slow -crf 16 -profile:v high \
  -c:a aac -b:a 192k -movflags +faststart \
  output/mbappe-electric-5s.mp4

echo "Created output/mbappe-electric-5s.mp4"

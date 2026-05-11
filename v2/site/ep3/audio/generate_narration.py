#!/usr/bin/env python3
"""Generate Episode 3 narration via ElevenLabs + ffmpeg concat.

Setup:
  export ELEVENLABS_API_KEY='your-key-here'
  python3 generate_narration.py

Or inline:
  ELEVENLABS_API_KEY='...' python3 generate_narration.py

Voice script source of truth: ~/.claude/bus/20260508-003345-ep3-voice-script-final.md
Scene durations sourced from v2/site/ep3/index.html JS scene config.
"""

import json
import os
import subprocess
import sys
import time
import urllib.error
import urllib.request

API_KEY = os.environ.get('ELEVENLABS_API_KEY')
if not API_KEY:
    print("ERROR: ELEVENLABS_API_KEY environment variable not set.")
    print("Setup:")
    print("  export ELEVENLABS_API_KEY='your-key-here'")
    print("  python3 generate_narration.py")
    sys.exit(1)

VOICE_ID = "8riBCvtxjQFA3tP1sfno"  # Jordan - Warm Narrator (same as ep1)
MODEL = "eleven_v3"

# Voice settings per voice-script bus (differs from ep1):
#   stability 0.5 (was 0.25 on ep1) - more consistent for documentary cadence
#   similarity_boost 0.6 (same as ep1)
#   speed 1.2 (bumped from 1.1 per "way too slow" listener feedback 2026-05-11)
VOICE_STABILITY = 0.5
VOICE_SIMILARITY = 0.6
VOICE_SPEED = 1.1

BASE = "/Users/secure/projects/studies/v2/site/ep3/audio"
CLIPS = os.path.join(BASE, "clips")
os.makedirs(CLIPS, exist_ok=True)

# (scene_index, scene_label, duration_seconds, narration_text)
# Empty text = silent scene
# Scene labels match runtime IDs in index.html (s1, s2, ..., s5b, ..., s12)
SCENES = [
    (0,  "S01",  8,    "Twenty twenty-one. A legendary crypto trader, G-C-R, posted this. Here's where method fits."),
    (1,  "S02",  21,   "The systematic trader compounds small wins. The discretionary trader gets the glory and never tells you why. One is a great movie. The other is a path. Learning to fish versus finding one in the tank."),
    (2,  "S03",  13.4, "Bitcoin. February to May. Down to sixty-six. Back to eighty-one. The market the system was running in."),
    (3,  "S04",  12,   "Plus one eighty-five percent across twenty-eight trades. Nineteen winners. Sixty-eight percent. Longs only."),
    (4,  "S05",  12.7, "It's gone up enough is not a sell signal. Same trap on shorts in a rally. Drift covers longs. Shorts pay funding to fight it."),
    (5,  "S05b", 17.4, "Audit caught a Zcash short signal at two-forty-eight. Now five-sixty-four — down one twenty-seven percent. Our longs-only filter blocked it. Forty other shorts in the same state."),
    (6,  "S05c", 17.9, "Twenty parameter combinations. Nine profitable. Without the stop, drift to minus five hundred, minus eight hundred max drawdown. Narrow island."),
    (7,  "S06",  18,   "Thirty-percent stop. Sixty-day max hold. Thirty-day cooldown. Both sides. Longs-only on top of that because stops alone weren't enough. Codified, not discretionary."),
    (8,  "S07",  11,   "Five positions held since February. Average plus forty-two percent. Render up sixty-two percent. We stayed long through the drawdown."),
    (9,  "S08",  14,   "Then two more in April. aahveigh plus eighteen percent. Worldcoin plus six percent. The scanner kept opening positions through the rally."),
    (10, "S08b", 27.6, "This is what users do with that. Seven leveraged trades, twenty-X on most. Eleven hundred percent on Orca. A thousand percent on Op. Six hundred percent on Morpho. Multiplied gains, multiplied risks."),
    (11, "S09",  14,   "Nine checks against the strategy. Six clean. Three findings. Findings are open work."),
    (12, "S10",  14.4, "Same trade, same window. Intuition shorts Zcash. Minus one twenty-seven percent. Method skips it."),
    (13, "S11",  8,    "Method published. Misses included. The signals run on the platform."),
    (14, "S12",  8,    ""),  # End-card breathing room
]

total_chars = sum(len(t) for _, _, _, t in SCENES if t)
print(f"Total characters to generate: {total_chars}")
print(f"Scenes with speech: {sum(1 for _, _, _, t in SCENES if t)}")
print(f"Silent scenes: {sum(1 for _, _, _, t in SCENES if not t)}")
print()


def generate_silence(path, duration):
    """Generate a silent MP3 of given duration."""
    subprocess.run([
        "ffmpeg", "-y", "-f", "lavfi", "-i", "anullsrc=r=44100:cl=mono",
        "-t", str(duration), "-c:a", "libmp3lame", "-b:a", "128k", path
    ], capture_output=True)


def generate_speech(idx, text):
    """Call ElevenLabs API to generate speech, return raw clip path."""
    raw_path = os.path.join(CLIPS, f"raw_{idx:02d}.mp3")

    payload = json.dumps({
        "text": text,
        "model_id": MODEL,
        "voice_settings": {
            "stability": VOICE_STABILITY,
            "similarity_boost": VOICE_SIMILARITY,
            "speed": VOICE_SPEED
        }
    }).encode("utf-8")

    req = urllib.request.Request(
        f"https://api.elevenlabs.io/v1/text-to-speech/{VOICE_ID}?output_format=mp3_44100_128",
        data=payload,
        headers={
            "xi-api-key": API_KEY,
            "Content-Type": "application/json"
        },
        method="POST"
    )

    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            with open(raw_path, "wb") as f:
                f.write(resp.read())
        return raw_path
    except urllib.error.HTTPError as e:
        print(f"  ERROR: {e.code} - {e.read().decode()[:200]}")
        return None


def pad_clip(raw_path, scene_path, duration, lead_delay=0):
    """Pad to exact scene duration. Default lead_delay=0 — voice hits at scene start."""
    if lead_delay > 0:
        delay_ms = int(lead_delay * 1000)
        af = f"adelay={delay_ms}:all=1,apad=whole_dur={duration}"
    else:
        af = f"apad=whole_dur={duration}"
    subprocess.run([
        "ffmpeg", "-y", "-i", raw_path,
        "-af", af,
        "-c:a", "libmp3lame", "-b:a", "128k", "-ar", "44100", "-ac", "1",
        scene_path
    ], capture_output=True)


def get_duration(path):
    """Get audio file duration in seconds."""
    result = subprocess.run([
        "ffprobe", "-v", "error", "-show_entries", "format=duration",
        "-of", "csv=p=0", path
    ], capture_output=True, text=True)
    return float(result.stdout.strip()) if result.stdout.strip() else 0


# ── GENERATE ALL CLIPS ──
print("Generating clips...")
scene_files = []

for idx, label, dur, text in SCENES:
    scene_path = os.path.join(CLIPS, f"scene_{idx:02d}_{label.lower()}.mp3")

    if not text:
        generate_silence(scene_path, dur)
        actual = get_duration(scene_path)
        print(f"  {label:5s} (idx {idx:02d}): {actual:.1f}s silence (target {dur}s)")
    else:
        raw = generate_speech(idx, text)
        if not raw:
            print(f"  {label:5s} (idx {idx:02d}): FAILED - generating silence fallback")
            generate_silence(scene_path, dur)
        else:
            raw_dur = get_duration(raw)
            pad_clip(raw, scene_path, dur)
            actual = get_duration(scene_path)
            overrun = " ⚠️ OVERRUN" if raw_dur > dur else ""
            print(f"  {label:5s} (idx {idx:02d}): {raw_dur:.1f}s speech -> {actual:.1f}s padded (target {dur}s) [{len(text)} chars]{overrun}")
        time.sleep(0.3)  # rate limiting

    scene_files.append(scene_path)

# ── CONCAT ALL CLIPS ──
print("\nConcatenating...")
list_path = os.path.join(CLIPS, "concat_list.txt")
with open(list_path, "w") as f:
    for sf in scene_files:
        f.write(f"file '{sf}'\n")

final_path = os.path.join(BASE, "narration.mp3")
subprocess.run([
    "ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", list_path,
    "-c:a", "libmp3lame", "-b:a", "128k", "-ar", "44100",
    final_path
], capture_output=True)

final_dur = get_duration(final_path)
target_total = sum(d for _, _, d, _ in SCENES)
print(f"\nDone!")
print(f"  Final: {final_path}")
print(f"  Duration: {final_dur:.1f}s (target {target_total}s)")
print(f"  Characters used: {total_chars}")

import math
import os
import random
import wave

SAMPLE_RATE = 22050
DURATION = 8.0
MAX_I16 = 32767


def clamp(value, low=-1.0, high=1.0):
    return max(low, min(high, value))


def sine(freq, t):
    return math.sin(math.tau * freq * t)


def triangle(freq, t):
    phase = (freq * t) % 1.0
    return 4.0 * abs(phase - 0.5) - 1.0


def env_pulse(t, start, length, attack=0.025, release=0.18):
    local = t - start
    if local < 0 or local > length:
        return 0.0
    if local < attack:
        return local / attack
    if local > length - release:
        return max(0.0, (length - local) / release)
    return 1.0


def loop_edge_envelope(t):
    fade = 0.12
    return min(1.0, max(0.0, t / fade), max(0.0, (DURATION - t) / fade))


def render_loop(path, seed, root, motif, profile):
    rng = random.Random(seed)
    total = int(SAMPLE_RATE * DURATION)
    samples = []
    beat_len = DURATION / 16.0
    for n in range(total):
      t = n / SAMPLE_RATE
      edge = loop_edge_envelope(t)
      value = 0.0

      drone_freq = root / 4
      value += sine(drone_freq, t) * profile["drone"] * 0.18
      value += sine(drone_freq * 1.5, t + 0.13) * profile["drone"] * 0.08

      beat = int(t / beat_len) % 16
      for i, degree in enumerate(motif):
          start = i * beat_len
          e = env_pulse(t, start, beat_len * 1.6, 0.018, 0.22)
          if e <= 0:
              continue
          freq = root * math.pow(2, degree / 12.0)
          value += triangle(freq, t) * e * profile["pluck"] * 0.13
          value += sine(freq * 2, t) * e * profile["bell"] * 0.06

      if profile["drums"] > 0:
          for i in range(0, 16, 4):
              e = env_pulse(t, i * beat_len, 0.18, 0.006, 0.16)
              if e > 0:
                  value += sine(58 + profile["bass_pitch"], t) * e * profile["drums"] * 0.22
          for i in profile["clicks"]:
              e = env_pulse(t, i * beat_len, 0.08, 0.004, 0.07)
              if e > 0:
                  value += rng.uniform(-1, 1) * e * profile["noise"] * 0.12

      sweep = math.sin(math.tau * t / DURATION)
      value += sine(root * (1.0 + sweep * 0.012), t) * profile["sweep"] * 0.06
      samples.append(int(clamp(value * edge * 0.72) * MAX_I16))

    os.makedirs(os.path.dirname(path), exist_ok=True)
    with wave.open(path, "wb") as wav:
        wav.setnchannels(1)
        wav.setsampwidth(2)
        wav.setframerate(SAMPLE_RATE)
        wav.writeframes(b"".join(int(s).to_bytes(2, "little", signed=True) for s in samples))


def main():
    out_dir = os.path.join("assets", "audio")
    loops = [
        ("music_menu_loop.wav", 11, 196.0, [0, 7, 10, 14, 12, 7, 3, 7, 0, 5, 10, 12, 14, 12, 7, 3], {
            "drone": 0.42, "pluck": 0.22, "bell": 0.34, "drums": 0.0, "noise": 0.04, "sweep": 0.28, "bass_pitch": 0, "clicks": [],
        }),
        ("music_forest_loop.wav", 17, 220.0, [0, 4, 7, 11, 12, 11, 7, 4, 2, 5, 9, 12, 14, 12, 9, 5], {
            "drone": 0.34, "pluck": 0.33, "bell": 0.28, "drums": 0.14, "noise": 0.06, "sweep": 0.18, "bass_pitch": 4, "clicks": [6, 14],
        }),
        ("music_ruins_loop.wav", 23, 185.0, [0, 3, 7, 10, 15, 10, 7, 3, -2, 3, 8, 12, 15, 12, 8, 3], {
            "drone": 0.52, "pluck": 0.28, "bell": 0.22, "drums": 0.28, "noise": 0.1, "sweep": 0.24, "bass_pitch": -3, "clicks": [3, 7, 11, 15],
        }),
        ("music_rift_loop.wav", 31, 164.0, [0, 3, 6, 10, 13, 10, 6, 3, -5, 1, 6, 10, 13, 15, 10, 6], {
            "drone": 0.68, "pluck": 0.22, "bell": 0.18, "drums": 0.38, "noise": 0.16, "sweep": 0.36, "bass_pitch": -8, "clicks": [2, 5, 8, 11, 14],
        }),
    ]
    for filename, seed, root, motif, profile in loops:
        render_loop(os.path.join(out_dir, filename), seed, root, motif, profile)


if __name__ == "__main__":
    main()

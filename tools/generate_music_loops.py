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
        ("music_menu_loop_b.wav", 12, 174.0, [0, 5, 9, 12, 16, 12, 9, 5, -2, 3, 7, 10, 14, 10, 7, 3], {
            "drone": 0.48, "pluck": 0.18, "bell": 0.38, "drums": 0.0, "noise": 0.035, "sweep": 0.32, "bass_pitch": -2, "clicks": [],
        }),
        ("music_menu_loop_c.wav", 13, 207.65, [0, 7, 12, 19, 17, 12, 7, 2, -3, 4, 9, 14, 16, 14, 9, 4], {
            "drone": 0.46, "pluck": 0.16, "bell": 0.42, "drums": 0.0, "noise": 0.032, "sweep": 0.34, "bass_pitch": -1, "clicks": [],
        }),
        ("music_menu_loop_d.wav", 14, 164.81, [0, 4, 10, 15, 19, 15, 10, 4, -5, 0, 7, 12, 15, 12, 7, 0], {
            "drone": 0.54, "pluck": 0.14, "bell": 0.36, "drums": 0.0, "noise": 0.04, "sweep": 0.38, "bass_pitch": -4, "clicks": [],
        }),
        ("music_forest_loop.wav", 17, 220.0, [0, 4, 7, 11, 12, 11, 7, 4, 2, 5, 9, 12, 14, 12, 9, 5], {
            "drone": 0.34, "pluck": 0.33, "bell": 0.28, "drums": 0.14, "noise": 0.06, "sweep": 0.18, "bass_pitch": 4, "clicks": [6, 14],
        }),
        ("music_forest_loop_b.wav", 18, 207.65, [0, 3, 7, 12, 14, 12, 7, 3, 5, 9, 12, 16, 17, 16, 12, 9], {
            "drone": 0.38, "pluck": 0.3, "bell": 0.32, "drums": 0.16, "noise": 0.065, "sweep": 0.2, "bass_pitch": 2, "clicks": [5, 10, 14],
        }),
        ("music_forest_loop_c.wav", 19, 233.08, [0, 5, 7, 12, 16, 12, 7, 5, 2, 7, 9, 14, 17, 14, 9, 7], {
            "drone": 0.32, "pluck": 0.34, "bell": 0.3, "drums": 0.15, "noise": 0.055, "sweep": 0.16, "bass_pitch": 5, "clicks": [4, 12],
        }),
        ("music_forest_loop_d.wav", 20, 196.0, [0, 4, 9, 12, 14, 12, 9, 4, -2, 2, 7, 11, 14, 11, 7, 2], {
            "drone": 0.4, "pluck": 0.28, "bell": 0.34, "drums": 0.12, "noise": 0.07, "sweep": 0.22, "bass_pitch": 0, "clicks": [3, 8, 13],
        }),
        ("music_ruins_loop.wav", 23, 185.0, [0, 3, 7, 10, 15, 10, 7, 3, -2, 3, 8, 12, 15, 12, 8, 3], {
            "drone": 0.52, "pluck": 0.28, "bell": 0.22, "drums": 0.28, "noise": 0.1, "sweep": 0.24, "bass_pitch": -3, "clicks": [3, 7, 11, 15],
        }),
        ("music_ruins_loop_b.wav", 24, 196.0, [0, 2, 7, 11, 14, 11, 7, 2, -4, 0, 5, 9, 12, 9, 5, 0], {
            "drone": 0.56, "pluck": 0.24, "bell": 0.24, "drums": 0.3, "noise": 0.11, "sweep": 0.28, "bass_pitch": -5, "clicks": [2, 6, 10, 13, 15],
        }),
        ("music_ruins_loop_c.wav", 25, 174.61, [0, 3, 8, 12, 15, 12, 8, 3, -5, -1, 4, 9, 13, 9, 4, -1], {
            "drone": 0.58, "pluck": 0.23, "bell": 0.26, "drums": 0.32, "noise": 0.105, "sweep": 0.26, "bass_pitch": -6, "clicks": [1, 5, 9, 12, 15],
        }),
        ("music_ruins_loop_d.wav", 26, 207.65, [0, 4, 6, 11, 15, 11, 6, 4, -3, 2, 6, 10, 13, 10, 6, 2], {
            "drone": 0.5, "pluck": 0.26, "bell": 0.2, "drums": 0.34, "noise": 0.12, "sweep": 0.3, "bass_pitch": -4, "clicks": [3, 6, 8, 11, 14],
        }),
        ("music_rift_loop.wav", 31, 164.0, [0, 3, 6, 10, 13, 10, 6, 3, -5, 1, 6, 10, 13, 15, 10, 6], {
            "drone": 0.68, "pluck": 0.22, "bell": 0.18, "drums": 0.38, "noise": 0.16, "sweep": 0.36, "bass_pitch": -8, "clicks": [2, 5, 8, 11, 14],
        }),
        ("music_rift_loop_b.wav", 32, 155.56, [0, 1, 6, 9, 12, 9, 6, 1, -7, -2, 3, 8, 12, 15, 12, 8], {
            "drone": 0.72, "pluck": 0.2, "bell": 0.16, "drums": 0.42, "noise": 0.18, "sweep": 0.4, "bass_pitch": -10, "clicks": [1, 4, 7, 10, 13, 15],
        }),
        ("music_rift_loop_c.wav", 33, 146.83, [0, 2, 5, 9, 13, 9, 5, 2, -8, -3, 2, 6, 11, 14, 11, 6], {
            "drone": 0.74, "pluck": 0.18, "bell": 0.18, "drums": 0.44, "noise": 0.19, "sweep": 0.42, "bass_pitch": -11, "clicks": [2, 4, 6, 9, 12, 15],
        }),
        ("music_rift_loop_d.wav", 34, 174.61, [0, 3, 7, 10, 14, 10, 7, 3, -6, -1, 4, 8, 12, 15, 12, 8], {
            "drone": 0.66, "pluck": 0.2, "bell": 0.14, "drums": 0.46, "noise": 0.2, "sweep": 0.44, "bass_pitch": -9, "clicks": [1, 3, 5, 8, 10, 13, 15],
        }),
        ("music_boss_loop.wav", 41, 146.83, [0, 0, 6, 10, 12, 10, 6, 0, -5, -5, 1, 6, 10, 13, 10, 6], {
            "drone": 0.76, "pluck": 0.18, "bell": 0.14, "drums": 0.52, "noise": 0.19, "sweep": 0.44, "bass_pitch": -12, "clicks": [2, 4, 6, 10, 12, 14],
        }),
        ("music_boss_loop_b.wav", 42, 138.59, [0, 4, 7, 10, 13, 10, 7, 4, -8, -3, 2, 7, 11, 14, 11, 7], {
            "drone": 0.8, "pluck": 0.16, "bell": 0.18, "drums": 0.56, "noise": 0.21, "sweep": 0.48, "bass_pitch": -14, "clicks": [1, 3, 5, 8, 11, 13, 15],
        }),
        ("music_boss_loop_c.wav", 43, 130.81, [0, 3, 6, 9, 12, 9, 6, 3, -7, -4, 0, 5, 10, 13, 10, 5], {
            "drone": 0.82, "pluck": 0.14, "bell": 0.16, "drums": 0.58, "noise": 0.22, "sweep": 0.5, "bass_pitch": -15, "clicks": [2, 3, 6, 7, 10, 11, 14, 15],
        }),
        ("music_boss_loop_d.wav", 44, 155.56, [0, 5, 8, 11, 15, 11, 8, 5, -9, -5, 0, 4, 9, 12, 9, 4], {
            "drone": 0.78, "pluck": 0.15, "bell": 0.12, "drums": 0.6, "noise": 0.23, "sweep": 0.52, "bass_pitch": -13, "clicks": [1, 2, 5, 8, 9, 12, 13, 15],
        }),
    ]
    for filename, seed, root, motif, profile in loops:
        render_loop(os.path.join(out_dir, filename), seed, root, motif, profile)


if __name__ == "__main__":
    main()

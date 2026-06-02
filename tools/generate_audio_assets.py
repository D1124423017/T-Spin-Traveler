import math
import os
import random
import wave


SAMPLE_RATE = 22050
MAX_I16 = 32767
ROOT_D = 146.83


BGM_SPECS = [
    {
        "filename": "bgm_menu_ancient_rift_loop.wav",
        "folder": ("assets", "audio", "bgm"),
        "duration": 48.0,
        "beats": 64,
        "root": ROOT_D,
        "seed": 101,
        "energy": 0.24,
        "drums": 0.055,
        "bells": 0.18,
        "pluck": 0.22,
        "noise": 0.04,
        "drone": 0.68,
        "choir": 0.52,
        "chords": [0, -5, 3, -2, 0, -7, -5, 0],
        "motif": [0, None, 7, None, 10, None, 7, 3, 0, None, 5, None, 10, 12, None, 7],
    },
    {
        "filename": "bgm_battle_forest_ruins_loop.wav",
        "folder": ("assets", "audio", "bgm"),
        "duration": 72.0,
        "beats": 128,
        "root": ROOT_D * 2 ** (2 / 12),
        "seed": 117,
        "energy": 0.48,
        "drums": 0.42,
        "bells": 0.16,
        "pluck": 0.52,
        "noise": 0.06,
        "drone": 0.52,
        "choir": 0.26,
        "chords": [0, -5, -2, -7, 3, -5, 5, 0],
        "motif": [0, 3, None, 7, 10, None, 12, 10, 7, None, 5, 7, 10, None, 7, 3],
    },
    {
        "filename": "bgm_battle_deep_ruins_loop.wav",
        "folder": ("assets", "audio", "bgm"),
        "duration": 72.0,
        "beats": 128,
        "root": ROOT_D,
        "seed": 123,
        "energy": 0.58,
        "drums": 0.58,
        "bells": 0.13,
        "pluck": 0.42,
        "noise": 0.08,
        "drone": 0.72,
        "choir": 0.36,
        "chords": [0, -7, -5, -2, -9, -5, 3, -7],
        "motif": [0, None, 5, 7, None, 10, 12, None, 15, 12, None, 10, 7, None, 5, None],
    },
    {
        "filename": "bgm_battle_rift_pressure_loop.wav",
        "folder": ("assets", "audio", "bgm"),
        "duration": 72.0,
        "beats": 128,
        "root": ROOT_D * 2 ** (-3 / 12),
        "seed": 131,
        "energy": 0.68,
        "drums": 0.66,
        "bells": 0.12,
        "pluck": 0.36,
        "noise": 0.11,
        "drone": 0.84,
        "choir": 0.4,
        "chords": [0, -1, -7, -6, -10, -5, -8, -1],
        "motif": [0, None, 1, 7, None, 6, None, 10, 13, None, 12, 8, None, 7, 1, None],
    },
    {
        "filename": "bgm_boss_ancient_rift_colossus_loop.wav",
        "folder": ("assets", "audio", "bgm"),
        "duration": 72.0,
        "beats": 144,
        "root": ROOT_D * 2 ** (-5 / 12),
        "seed": 141,
        "energy": 0.82,
        "drums": 0.86,
        "bells": 0.1,
        "pluck": 0.24,
        "noise": 0.1,
        "drone": 0.96,
        "choir": 0.54,
        "chords": [0, -12, -7, -10, -1, -12, -5, -7],
        "motif": [0, None, -12, None, -7, None, -10, None, 0, -1, None, -7, -12, None, -5, None],
    },
    {
        "filename": "bgm_upgrade_relic_cards_loop.wav",
        "folder": ("assets", "audio", "bgm"),
        "duration": 24.0,
        "beats": 32,
        "root": ROOT_D,
        "seed": 151,
        "energy": 0.2,
        "drums": 0.025,
        "bells": 0.2,
        "pluck": 0.18,
        "noise": 0.035,
        "drone": 0.5,
        "choir": 0.48,
        "chords": [0, 3, -5, -2],
        "motif": [0, None, 7, None, 12, None, 10, None, 7, None, 3, None, 5, None, None, None],
    },
]


JINGLE_SPECS = [
    ("jingle_rift_energy_settlement.wav", 10.0, 201, "energy"),
    ("jingle_victory_relic_cleansed.wav", 5.6, 202, "victory"),
    ("jingle_defeat_rift_collapse.wav", 5.8, 203, "defeat"),
]


SFX_SPECS = [
    ("sfx_block_move_01.wav", "move", 0.07, 301),
    ("sfx_block_move_02.wav", "move", 0.075, 302),
    ("sfx_block_move_03.wav", "move", 0.08, 303),
    ("sfx_block_rotate_01.wav", "rotate", 0.12, 304),
    ("sfx_block_rotate_02.wav", "rotate", 0.13, 305),
    ("sfx_t_piece_rotate_special_01.wav", "t_rotate", 0.18, 306),
    ("sfx_soft_drop_01.wav", "soft_drop", 0.055, 307),
    ("sfx_hard_drop_01.wav", "hard_drop", 0.18, 308),
    ("sfx_block_lock_01.wav", "lock", 0.105, 309),
    ("sfx_hold_01.wav", "hold", 0.18, 310),
    ("sfx_hold_unavailable_01.wav", "unavailable", 0.16, 311),
    ("sfx_invalid_move_01.wav", "invalid", 0.11, 312),
    ("sfx_invalid_rotate_01.wav", "invalid_rotate", 0.13, 313),
    ("sfx_line_clear_1.wav", "clear1", 0.22, 314),
    ("sfx_line_clear_2.wav", "clear2", 0.28, 315),
    ("sfx_line_clear_3.wav", "clear3", 0.34, 316),
    ("sfx_line_clear_4_tetris.wav", "clear4", 0.46, 317),
    ("sfx_combo_1.wav", "combo1", 0.24, 318),
    ("sfx_combo_2.wav", "combo2", 0.3, 319),
    ("sfx_combo_3_plus.wav", "combo3", 0.38, 320),
    ("sfx_back_to_back.wav", "b2b", 0.42, 321),
    ("sfx_tspin_success.wav", "tspin", 0.56, 322),
    ("sfx_spin_success.wav", "spin", 0.42, 323),
    ("sfx_perfect_clear.wav", "perfect", 0.95, 324),
    ("sfx_spin_ready_01.wav", "spin_ready", 0.26, 325),
    ("sfx_spin_ready_02.wav", "spin_ready", 0.3, 326),
    ("sfx_player_attack_light_01.wav", "attack_light", 0.22, 327),
    ("sfx_player_attack_heavy_01.wav", "attack_heavy", 0.34, 328),
    ("sfx_player_attack_arcane_01.wav", "attack_arcane", 0.52, 329),
    ("sfx_enemy_hurt_light_01.wav", "hurt_light", 0.2, 330),
    ("sfx_enemy_hurt_heavy_01.wav", "hurt_heavy", 0.34, 331),
    ("sfx_enemy_attack_warn_01.wav", "warn", 0.42, 332),
    ("sfx_enemy_attack_hit_01.wav", "enemy_hit", 0.38, 333),
    ("sfx_player_hurt_01.wav", "player_hurt", 0.3, 334),
    ("sfx_shield_block_01.wav", "shield", 0.32, 335),
    ("sfx_shield_break_01.wav", "shield_break", 0.42, 336),
    ("sfx_upgrade_reveal_01.wav", "upgrade_reveal", 0.82, 337),
    ("sfx_upgrade_hover_01.wav", "upgrade_hover", 0.14, 338),
    ("sfx_upgrade_confirm_01.wav", "upgrade_confirm", 0.64, 339),
    ("sfx_meta_upgrade_purchase_success_01.wav", "meta_success", 0.86, 340),
    ("sfx_meta_upgrade_purchase_fail_01.wav", "meta_fail", 0.28, 341),
    ("sfx_rift_energy_tick_01.wav", "energy_tick", 0.08, 342),
    ("sfx_rift_energy_complete_01.wav", "energy_complete", 0.72, 343),
    ("sfx_wave_start_01.wav", "wave_start", 0.52, 344),
    ("sfx_wave_victory_01.wav", "wave_victory", 0.68, 345),
    ("sfx_boss_enter_01.wav", "boss_enter", 0.9, 346),
    ("sfx_boss_defeated_01.wav", "boss_defeated", 1.05, 347),
    ("sfx_game_start_01.wav", "game_start", 0.62, 348),
    ("sfx_game_over_01.wav", "game_over", 0.74, 349),
    ("sfx_ui_hover_01.wav", "ui_hover", 0.07, 350),
    ("sfx_ui_confirm_01.wav", "ui_confirm", 0.16, 351),
    ("sfx_ui_cancel_01.wav", "ui_cancel", 0.18, 352),
    ("sfx_loading_complete_01.wav", "loading_complete", 0.5, 353),
]


def clamp(value, low=-1.0, high=1.0):
    return max(low, min(high, value))


def note(root, semitones):
    return root * math.pow(2, semitones / 12.0)


def quantized_frequency(freq, duration):
    cycles = max(1, round(freq * duration))
    return cycles / duration


def wave_value(kind, freq, t):
    phase = (freq * t) % 1.0
    if kind == "sine":
        return math.sin(math.tau * freq * t)
    if kind == "triangle":
        return 4.0 * abs(phase - 0.5) - 1.0
    if kind == "square":
        return 1.0 if phase < 0.5 else -1.0
    if kind == "saw":
        return 2.0 * phase - 1.0
    return math.sin(math.tau * freq * t)


def envelope(local, duration, attack=0.012, release=0.06):
    if local < 0 or local >= duration:
        return 0.0
    if attack > 0 and local < attack:
        return local / attack
    if release > 0 and local > duration - release:
        return max(0.0, (duration - local) / release)
    return 1.0


def add_tone(samples, start, duration, freq, volume, kind="sine", attack=0.01, release=0.06, detune=0.0):
    first = max(0, int(start * SAMPLE_RATE))
    last = min(len(samples), int((start + duration) * SAMPLE_RATE))
    if last <= first:
        return
    freq *= math.pow(2, detune / 12.0)
    for i in range(first, last):
        t = i / SAMPLE_RATE
        local = t - start
        amp = envelope(local, duration, attack, release)
        samples[i] += wave_value(kind, freq, t) * amp * volume


def add_noise(samples, start, duration, volume, seed, mode="soft", attack=0.006, release=0.06):
    rng = random.Random(seed)
    first = max(0, int(start * SAMPLE_RATE))
    last = min(len(samples), int((start + duration) * SAMPLE_RATE))
    prev = 0.0
    for i in range(first, last):
        t = i / SAMPLE_RATE
        local = t - start
        amp = envelope(local, duration, attack, release)
        raw = rng.uniform(-1.0, 1.0)
        if mode == "low":
            prev = prev * 0.86 + raw * 0.14
            value = prev
        elif mode == "high":
            prev = prev * 0.58 + raw * 0.42
            value = raw - prev
        else:
            prev = prev * 0.72 + raw * 0.28
            value = prev * 0.45 + raw * 0.18
        samples[i] += value * amp * volume


def add_sweep(samples, start, duration, start_freq, end_freq, volume, kind="sine", attack=0.006, release=0.08):
    first = max(0, int(start * SAMPLE_RATE))
    last = min(len(samples), int((start + duration) * SAMPLE_RATE))
    for i in range(first, last):
        t = i / SAMPLE_RATE
        local = t - start
        p = local / max(duration, 0.0001)
        freq = start_freq * math.pow(max(0.001, end_freq / start_freq), p)
        amp = envelope(local, duration, attack, release)
        samples[i] += wave_value(kind, freq, t) * amp * volume


def add_bell(samples, start, freq, volume, duration=0.72):
    add_tone(samples, start, duration, freq, volume, "triangle", 0.008, duration * 0.78)
    add_tone(samples, start + 0.006, duration * 0.72, freq * 1.5, volume * 0.38, "sine", 0.006, duration * 0.58)
    add_tone(samples, start + 0.014, duration * 0.42, freq * 2.01, volume * 0.18, "sine", 0.004, duration * 0.34)


def add_pluck(samples, start, freq, volume):
    add_tone(samples, start, 0.42, freq, volume, "triangle", 0.006, 0.36)
    add_tone(samples, start + 0.004, 0.22, freq * 2.0, volume * 0.22, "sine", 0.004, 0.18)
    add_noise(samples, start + 0.002, 0.04, volume * 0.16, int(start * 10000) + 7, "high", 0.002, 0.035)


def add_deep_drum(samples, start, volume, pitch=78.0):
    add_sweep(samples, start, 0.28, pitch, max(38.0, pitch * 0.42), volume, "sine", 0.004, 0.22)
    add_noise(samples, start + 0.004, 0.09, volume * 0.34, int(start * 10000) + 11, "low", 0.002, 0.07)


def add_wood_hit(samples, start, volume, seed):
    add_tone(samples, start, 0.055, 780, volume * 0.5, "triangle", 0.002, 0.05)
    add_noise(samples, start, 0.05, volume, seed, "high", 0.002, 0.045)


def add_continuous_layer(samples, duration, root, spec):
    drone_freqs = [
        quantized_frequency(root / 4, duration),
        quantized_frequency(root / 2, duration),
        quantized_frequency(root * 3 / 4, duration),
    ]
    for i, freq in enumerate(drone_freqs):
        amp = [0.07, 0.035, 0.018][i] * spec["drone"]
        lfo_cycles = i + 1
        for n in range(len(samples)):
            t = n / SAMPLE_RATE
            lfo = 0.82 + 0.18 * math.sin(math.tau * lfo_cycles * t / duration + i * 0.8)
            samples[n] += math.sin(math.tau * freq * t) * amp * lfo
    choir_notes = [0, 5, 7]
    for idx, degree in enumerate(choir_notes):
        freq = quantized_frequency(note(root / 2, degree), duration)
        amp = 0.018 * spec["choir"] * (1.0 - idx * 0.16)
        for n in range(len(samples)):
            t = n / SAMPLE_RATE
            lfo = 0.68 + 0.32 * math.sin(math.tau * (idx + 2) * t / duration + idx)
            samples[n] += math.sin(math.tau * freq * t) * amp * lfo


def add_soft_chime(samples, start, freq, volume, duration=0.64):
    add_tone(samples, start, duration, freq, volume, "sine", 0.018, duration * 0.78)
    add_tone(samples, start + 0.012, duration * 0.58, freq * 1.49, volume * 0.18, "sine", 0.012, duration * 0.48)


def add_stone_pulse(samples, start, volume, pitch=92.0):
    add_sweep(samples, start, 0.18, pitch, max(42.0, pitch * 0.58), volume, "sine", 0.006, 0.14)
    add_noise(samples, start + 0.006, 0.055, volume * 0.18, int(start * 10000) + 31, "low", 0.003, 0.04)


def add_soft_pluck(samples, start, freq, volume, duration=0.36):
    add_tone(samples, start, duration, freq, volume, "triangle", 0.014, duration * 0.72)
    add_tone(samples, start + 0.008, duration * 0.58, freq * 2.0, volume * 0.08, "sine", 0.012, duration * 0.48)


def render_bgm(spec):
    duration = spec["duration"]
    total = int(duration * SAMPLE_RATE)
    samples = [0.0] * total
    beat = duration / spec["beats"]
    root = spec["root"]
    add_continuous_layer(samples, duration, root, spec)

    chord_span = max(1, spec["beats"] // len(spec["chords"]))
    for beat_index in range(spec["beats"]):
        start = beat_index * beat
        chord = spec["chords"][(beat_index // chord_span) % len(spec["chords"])]
        motif = spec["motif"][beat_index % len(spec["motif"])]
        bar_pos = beat_index % 16
        phrase = 0.9 + 0.1 * math.sin(math.tau * beat_index / spec["beats"])
        energy = spec["energy"] * phrase

        if beat_index % 4 == 0 and spec["drums"] > 0.04:
            add_stone_pulse(samples, start, 0.095 * spec["drums"] * (0.8 + energy * 0.35), 66 + spec["energy"] * 24)
        if spec["drums"] > 0.35 and bar_pos in (8,):
            add_stone_pulse(samples, start + beat * 0.04, 0.062 * spec["drums"], 82)
        if spec["drums"] > 0.5 and bar_pos in (6, 14):
            add_noise(samples, start + beat * 0.1, beat * 0.38, 0.012 * spec["drums"], spec["seed"] + beat_index, "low", 0.01, beat * 0.3)

        if motif is not None:
            pitch = note(root, motif + chord * 0.08)
            if bar_pos in (0, 4, 8, 12) or spec["pluck"] > 0.45:
                add_soft_pluck(samples, start + beat * 0.04, pitch, 0.038 * spec["pluck"] * (0.85 + energy * 0.25))
        if bar_pos in (4, 12) and spec["bells"] > 0.08:
            chime_degree = (motif if motif is not None else 7) + 12
            add_soft_chime(samples, start + beat * 0.22, note(root, chime_degree), 0.022 * spec["bells"], 0.5)
        if spec["noise"] > 0.09 and bar_pos in (0, 8):
            add_sweep(samples, start + beat * 0.2, beat * 1.45, root * 0.45, root * 0.72, 0.012 * spec["noise"], "triangle", 0.04, beat * 0.9)

    make_loop_edges_safe(samples, int(0.18 * SAMPLE_RATE))
    return finalize(samples, 0.72)


def make_loop_edges_safe(samples, fade_samples):
    if fade_samples <= 0 or fade_samples * 2 >= len(samples):
        return
    count = fade_samples
    for i in range(count):
        p = i / (count - 1)
        edge = samples[i] * p + samples[-count + i] * (1 - p)
        samples[i] = edge
        samples[-count + i] = edge


def finalize(samples, target_peak=0.88):
    peak = max(0.0001, max(abs(v) for v in samples))
    scale = min(1.0, target_peak / peak)
    result = []
    for value in samples:
        limited = math.tanh(value * scale * 1.08) / math.tanh(1.08)
        result.append(int(clamp(limited, -1.0, 1.0) * MAX_I16))
    return result


def add_arpeggio(samples, start, root, degrees, volume, gap=0.045, kind="triangle"):
    for index, degree in enumerate(degrees):
        add_tone(samples, start + gap * index, gap * 2.2, note(root, degree), volume, kind, 0.004, gap * 1.8)


def render_jingle(filename, duration, seed, kind):
    samples = [0.0] * int(duration * SAMPLE_RATE)
    root = ROOT_D
    if kind == "energy":
        add_tone(samples, 0, duration, quantized_frequency(root / 2, duration), 0.065, "sine", 0.35, 1.4)
        for i, degree in enumerate([7, 12, 15, 19, 24, 19, 15, 24]):
            t = 0.55 + i * 0.62
            add_soft_chime(samples, t, note(root, degree), 0.038 + i * 0.002, 0.72)
        add_sweep(samples, 5.8, 1.8, 150, 440, 0.055, "triangle", 0.12, 0.9)
        add_arpeggio(samples, 7.7, root, [0, 7, 12, 19], 0.085, 0.14, "sine")
        add_soft_chime(samples, 8.5, note(root, 24), 0.06, 1.0)
    elif kind == "victory":
        add_stone_pulse(samples, 0.02, 0.13, 84)
        add_arpeggio(samples, 0.16, root, [0, 7, 12, 19], 0.105, 0.12, "sine")
        add_soft_chime(samples, 1.05, note(root, 24), 0.08, 1.15)
        add_tone(samples, 0.12, 4.8, quantized_frequency(root / 2, duration), 0.06, "sine", 0.14, 1.4)
        add_sweep(samples, 2.65, 1.4, 190, 620, 0.04, "triangle", 0.1, 0.9)
    else:
        add_sweep(samples, 0.02, 1.15, 190, 64, 0.08, "triangle", 0.04, 0.8)
        add_stone_pulse(samples, 0.12, 0.1, 62)
        add_arpeggio(samples, 0.52, root, [7, 3, 0, -5], 0.075, 0.16, "sine")
        add_tone(samples, 0.0, duration, quantized_frequency(root / 4, duration), 0.08, "sine", 0.08, 1.8)
        add_noise(samples, 1.2, 2.0, 0.032, seed, "low", 0.06, 1.3)
    return finalize(samples, 0.74)


def render_sfx(kind, duration, seed):
    samples = [0.0] * int(duration * SAMPLE_RATE)
    root = ROOT_D
    if kind == "move":
        add_tone(samples, 0.005, duration * 0.55, 360 + seed % 37, 0.09, "triangle", 0.002, duration * 0.4)
        add_noise(samples, 0.002, duration * 0.5, 0.025, seed, "high", 0.001, duration * 0.36)
    elif kind == "rotate":
        add_arpeggio(samples, 0.006, root, [12, 17], 0.11, 0.035)
        add_noise(samples, 0.01, 0.05, 0.025, seed, "high")
    elif kind == "t_rotate":
        add_arpeggio(samples, 0.004, root, [7, 12, 19], 0.13, 0.04)
        add_sweep(samples, 0.03, 0.12, 420, 880, 0.045, "triangle")
    elif kind == "soft_drop":
        add_tone(samples, 0.002, 0.035, 250, 0.052, "triangle", 0.001, 0.028)
        add_noise(samples, 0.002, 0.035, 0.018, seed, "high", 0.001, 0.026)
    elif kind == "hard_drop":
        add_sweep(samples, 0.0, 0.09, 145, 72, 0.17, "sine", 0.002, 0.06)
        add_tone(samples, 0.004, 0.045, 340, 0.055, "triangle", 0.001, 0.034)
        add_noise(samples, 0.006, 0.055, 0.035, seed, "low", 0.001, 0.038)
        add_tone(samples, 0.048, 0.105, note(root, 19), 0.035, "sine", 0.006, 0.075)
    elif kind == "lock":
        add_sweep(samples, 0.0, 0.052, 118, 78, 0.095, "sine", 0.002, 0.035)
        add_noise(samples, 0.006, 0.042, 0.02, seed, "low", 0.002, 0.028)
        add_tone(samples, 0.028, 0.062, note(root, 7), 0.022, "sine", 0.006, 0.048)
    elif kind == "hold":
        add_arpeggio(samples, 0.0, root, [14, 7, 19], 0.1, 0.038, "sine")
    elif kind in ("unavailable", "invalid", "invalid_rotate"):
        add_sweep(samples, 0.0, duration * 0.72, 220, 128, 0.08, "triangle")
        add_noise(samples, 0.01, duration * 0.5, 0.035, seed, "low")
    elif kind.startswith("clear"):
        level = {"clear1": 1, "clear2": 2, "clear3": 3, "clear4": 4}[kind]
        degrees = [12, 16, 19, 24, 28][: level + 1]
        add_arpeggio(samples, 0.0, root, degrees, 0.09 + level * 0.018, 0.038)
        add_noise(samples, 0.03, 0.08 + level * 0.03, 0.035 + level * 0.012, seed, "high")
        if level >= 4:
            add_sweep(samples, 0.06, 0.28, 520, 1480, 0.09, "triangle")
            add_deep_drum(samples, 0.0, 0.11, 92)
    elif kind.startswith("combo"):
        level = {"combo1": 1, "combo2": 2, "combo3": 3}[kind]
        add_arpeggio(samples, 0.0, root, [16, 19, 24, 28 + level], 0.09 + level * 0.02, 0.034, "square")
        add_sweep(samples, 0.04, duration * 0.52, 560, 920 + level * 220, 0.045 + level * 0.012, "triangle")
    elif kind == "b2b":
        add_deep_drum(samples, 0.0, 0.1, 98)
        add_arpeggio(samples, 0.02, root, [19, 24, 28, 36], 0.12, 0.042, "square")
    elif kind == "tspin":
        add_sweep(samples, 0.0, 0.22, 220, 1280, 0.12, "saw")
        add_sweep(samples, 0.18, 0.18, 1280, 360, 0.065, "triangle")
        add_arpeggio(samples, 0.02, root, [15, 19, 27, 36], 0.15, 0.045, "square")
        add_deep_drum(samples, 0.02, 0.09, 82)
    elif kind == "spin":
        add_sweep(samples, 0.0, 0.2, 260, 880, 0.08, "triangle")
        add_arpeggio(samples, 0.03, root, [12, 17, 24], 0.1, 0.05)
    elif kind == "perfect":
        add_deep_drum(samples, 0.0, 0.16, 72)
        add_arpeggio(samples, 0.02, root, [0, 7, 12, 16, 19, 24, 31], 0.15, 0.055)
        add_sweep(samples, 0.16, 0.58, 360, 1680, 0.09, "saw")
        add_noise(samples, 0.22, 0.22, 0.075, seed, "high")
        add_bell(samples, 0.48, note(root, 31), 0.11, 0.42)
    elif kind == "spin_ready":
        add_sweep(samples, 0.0, duration * 0.82, 260, 620, 0.055, "triangle")
        add_arpeggio(samples, 0.03, root, [7, 12], 0.064, 0.07)
        add_noise(samples, 0.025, duration * 0.5, 0.018, seed, "high")
    elif kind == "attack_light":
        add_sweep(samples, 0.0, 0.12, 420, 760, 0.07, "triangle", 0.003, 0.075)
        add_tone(samples, 0.018, 0.06, note(root, 19), 0.035, "sine", 0.004, 0.045)
        add_noise(samples, 0.025, 0.045, 0.018, seed, "high", 0.002, 0.032)
    elif kind == "attack_heavy":
        add_stone_pulse(samples, 0.0, 0.13, 105)
        add_sweep(samples, 0.032, 0.2, 180, 620, 0.09, "triangle", 0.008, 0.13)
        add_noise(samples, 0.055, 0.11, 0.055, seed, "low", 0.004, 0.08)
        add_soft_chime(samples, 0.11, note(root, 12), 0.025, 0.18)
    elif kind == "attack_arcane":
        add_tone(samples, 0.0, 0.5, root / 2, 0.045, "sine", 0.025, 0.24)
        add_arpeggio(samples, 0.018, root, [7, 12, 19, 24], 0.085, 0.06, "sine")
        add_sweep(samples, 0.08, 0.3, 260, 960, 0.06, "triangle", 0.025, 0.18)
        add_soft_chime(samples, 0.24, note(root, 31), 0.045, 0.24)
    elif kind in ("hurt_light", "hurt_heavy"):
        if kind == "hurt_light":
            add_sweep(samples, 0.0, 0.08, 520, 210, 0.055, "triangle", 0.002, 0.052)
            add_noise(samples, 0.012, 0.055, 0.025, seed, "low", 0.002, 0.04)
            add_tone(samples, 0.035, 0.09, note(root, 7), 0.018, "sine", 0.006, 0.06)
        else:
            add_stone_pulse(samples, 0.0, 0.11, 78)
            add_sweep(samples, 0.03, 0.2, 260, 86, 0.075, "triangle", 0.004, 0.14)
            add_noise(samples, 0.04, 0.13, 0.06, seed, "low", 0.004, 0.09)
    elif kind == "warn":
        add_tone(samples, 0.0, 0.1, 220, 0.055, "triangle", 0.008, 0.075)
        add_soft_chime(samples, 0.11, 440, 0.035, 0.14)
        add_tone(samples, 0.22, 0.1, 277, 0.05, "triangle", 0.008, 0.075)
        add_sweep(samples, 0.05, 0.32, 110, 180, 0.035, "sine", 0.02, 0.12)
    elif kind == "enemy_hit":
        add_stone_pulse(samples, 0.0, 0.15, 88)
        add_sweep(samples, 0.02, 0.2, 170, 58, 0.12, "sine", 0.004, 0.14)
        add_noise(samples, 0.035, 0.12, 0.075, seed, "low", 0.004, 0.08)
        add_tone(samples, 0.08, 0.12, 196, 0.04, "triangle", 0.006, 0.08)
    elif kind == "player_hurt":
        add_sweep(samples, 0.0, 0.14, 240, 92, 0.09, "triangle", 0.004, 0.095)
        add_noise(samples, 0.02, 0.095, 0.055, seed, "low", 0.003, 0.066)
        add_tone(samples, 0.055, 0.12, root, 0.025, "sine", 0.006, 0.085)
    elif kind == "shield":
        add_arpeggio(samples, 0.0, root, [24, 31], 0.1, 0.052, "sine")
        add_sweep(samples, 0.04, 0.18, 980, 520, 0.075, "triangle")
        add_noise(samples, 0.02, 0.08, 0.035, seed, "high")
    elif kind == "shield_break":
        add_sweep(samples, 0.0, 0.28, 880, 160, 0.12, "saw")
        add_noise(samples, 0.02, 0.22, 0.11, seed, "high")
    elif kind == "upgrade_reveal":
        add_deep_drum(samples, 0.0, 0.08, 92)
        add_arpeggio(samples, 0.08, root, [0, 7, 12, 19, 24], 0.11, 0.065)
        add_sweep(samples, 0.22, 0.45, 260, 1080, 0.07, "triangle")
    elif kind == "upgrade_hover":
        add_bell(samples, 0.0, note(root, 24), 0.06, 0.12)
    elif kind == "upgrade_confirm":
        add_arpeggio(samples, 0.0, root, [0, 7, 12, 19, 24], 0.12, 0.055)
        add_sweep(samples, 0.14, 0.36, 220, 960, 0.07, "triangle")
    elif kind == "meta_success":
        add_deep_drum(samples, 0.0, 0.11, 82)
        add_arpeggio(samples, 0.06, root, [0, 7, 12, 19, 24, 31], 0.13, 0.065)
        add_sweep(samples, 0.28, 0.4, 180, 880, 0.075, "saw")
    elif kind == "meta_fail":
        add_sweep(samples, 0.0, 0.2, 280, 110, 0.09, "triangle")
        add_noise(samples, 0.04, 0.1, 0.035, seed, "low")
    elif kind == "energy_tick":
        add_bell(samples, 0.0, note(root, 24), 0.06, 0.075)
    elif kind == "energy_complete":
        add_arpeggio(samples, 0.0, root, [12, 19, 24, 31], 0.12, 0.075)
        add_sweep(samples, 0.2, 0.42, 180, 720, 0.07, "triangle")
    elif kind == "wave_start":
        add_deep_drum(samples, 0.0, 0.11, 86)
        add_arpeggio(samples, 0.08, root, [0, 7, 12, 19], 0.1, 0.06)
    elif kind == "wave_victory":
        add_arpeggio(samples, 0.0, root, [7, 12, 16, 19, 24], 0.12, 0.06)
        add_bell(samples, 0.34, note(root, 24), 0.08, 0.26)
    elif kind == "boss_enter":
        add_deep_drum(samples, 0.0, 0.18, 58)
        add_deep_drum(samples, 0.28, 0.12, 74)
        add_sweep(samples, 0.06, 0.7, 70, 520, 0.09, "saw")
        add_arpeggio(samples, 0.36, root, [-12, -5, 0, 7], 0.11, 0.09)
    elif kind == "boss_defeated":
        add_deep_drum(samples, 0.0, 0.14, 72)
        add_sweep(samples, 0.1, 0.55, 520, 130, 0.1, "saw")
        add_arpeggio(samples, 0.42, root, [0, 7, 12, 19, 24], 0.11, 0.07)
    elif kind == "game_start":
        add_arpeggio(samples, 0.0, root, [0, 7, 12, 19, 24], 0.12, 0.055)
        add_sweep(samples, 0.16, 0.34, 180, 720, 0.07, "triangle")
    elif kind == "game_over":
        add_sweep(samples, 0.0, 0.36, 220, 72, 0.13, "saw")
        add_arpeggio(samples, 0.18, root, [3, 0, -5, -12], 0.1, 0.09, "sine")
        add_noise(samples, 0.22, 0.22, 0.055, seed, "low")
    elif kind == "ui_hover":
        add_tone(samples, 0.0, 0.045, 740, 0.055, "triangle", 0.002, 0.04)
    elif kind == "ui_confirm":
        add_arpeggio(samples, 0.0, root, [12, 19, 24], 0.08, 0.036)
    elif kind == "ui_cancel":
        add_arpeggio(samples, 0.0, root, [12, 7, 3], 0.07, 0.04, "sine")
    elif kind == "loading_complete":
        add_arpeggio(samples, 0.0, root, [7, 12, 19, 24], 0.09, 0.055)
        add_bell(samples, 0.22, note(root, 24), 0.07, 0.2)
    else:
        add_tone(samples, 0.0, min(duration, 0.1), 440, 0.05)
    return finalize(samples, 0.84)


def write_wav(path, samples):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    temp_path = f"{path}.tmp"
    try:
        with wave.open(temp_path, "wb") as wav:
            wav.setnchannels(1)
            wav.setsampwidth(2)
            wav.setframerate(SAMPLE_RATE)
            wav.writeframes(b"".join(int(sample).to_bytes(2, "little", signed=True) for sample in samples))
        if os.path.exists(path):
            with open(temp_path, "rb") as new_file, open(path, "rb") as current_file:
                if new_file.read() == current_file.read():
                    return
        os.replace(temp_path, path)
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)


def main():
    for spec in BGM_SPECS:
        path = os.path.join(*spec["folder"], spec["filename"])
        write_wav(path, render_bgm(spec))

    for filename, duration, seed, kind in JINGLE_SPECS:
        path = os.path.join("assets", "audio", "jingles", filename)
        write_wav(path, render_jingle(filename, duration, seed, kind))

    for filename, kind, duration, seed in SFX_SPECS:
        path = os.path.join("assets", "audio", "sfx", filename)
        write_wav(path, render_sfx(kind, duration, seed))


if __name__ == "__main__":
    main()

import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const projectRoot = process.cwd();

const TEMPORARY_GLOBAL_BGM = [
  "assets/audio/bgm/bgm_menu_01.wav",
  "assets/audio/bgm/bgm_menu_02.wav",
  "assets/audio/bgm/bgm_menu_03.wav",
  "assets/audio/bgm/bgm_menu_04.wav",
  "assets/audio/bgm/bgm_menu_05.wav",
  "assets/audio/bgm/bgm_menu_06.wav",
];

const LEGACY_BGM = [
  "assets/audio/bgm/bgm_menu_ancient_rift_loop.wav",
  "assets/audio/bgm/bgm_battle_forest_ruins_loop.wav",
  "assets/audio/bgm/bgm_battle_deep_ruins_loop.wav",
  "assets/audio/bgm/bgm_battle_rift_pressure_loop.wav",
  "assets/audio/bgm/bgm_boss_ancient_rift_colossus_loop.wav",
  "assets/audio/bgm/bgm_upgrade_relic_cards_loop.wav",
];

const EXPECTED_BGM = [...TEMPORARY_GLOBAL_BGM, ...LEGACY_BGM];

const EXPECTED_JINGLES = [
  "assets/audio/jingles/jingle_rift_energy_settlement.wav",
  "assets/audio/jingles/jingle_victory_relic_cleansed.wav",
  "assets/audio/jingles/jingle_defeat_rift_collapse.wav",
];

const EXPECTED_SFX = [
  "sfx_block_move_01.wav",
  "sfx_block_move_02.wav",
  "sfx_block_move_03.wav",
  "sfx_block_rotate_01.wav",
  "sfx_block_rotate_02.wav",
  "sfx_t_piece_rotate_special_01.wav",
  "sfx_soft_drop_01.wav",
  "sfx_hard_drop_01.wav",
  "sfx_block_lock_01.wav",
  "sfx_hold_01.wav",
  "sfx_hold_unavailable_01.wav",
  "sfx_invalid_move_01.wav",
  "sfx_invalid_rotate_01.wav",
  "sfx_line_clear_1.wav",
  "sfx_line_clear_2.wav",
  "sfx_line_clear_3.wav",
  "sfx_line_clear_4_tetris.wav",
  "sfx_combo_1.wav",
  "sfx_combo_2.wav",
  "sfx_combo_3_plus.wav",
  "sfx_back_to_back.wav",
  "sfx_tspin_success.wav",
  "sfx_spin_success.wav",
  "sfx_perfect_clear.wav",
  "sfx_spin_ready_01.wav",
  "sfx_spin_ready_02.wav",
  "sfx_player_attack_light_01.wav",
  "sfx_player_attack_heavy_01.wav",
  "sfx_player_attack_arcane_01.wav",
  "sfx_enemy_hurt_light_01.wav",
  "sfx_enemy_hurt_heavy_01.wav",
  "sfx_enemy_attack_warn_01.wav",
  "sfx_enemy_attack_hit_01.wav",
  "sfx_player_hurt_01.wav",
  "sfx_shield_block_01.wav",
  "sfx_shield_break_01.wav",
  "sfx_upgrade_reveal_01.wav",
  "sfx_upgrade_hover_01.wav",
  "sfx_upgrade_confirm_01.wav",
  "sfx_meta_upgrade_purchase_success_01.wav",
  "sfx_meta_upgrade_purchase_fail_01.wav",
  "sfx_rift_energy_tick_01.wav",
  "sfx_rift_energy_complete_01.wav",
  "sfx_wave_start_01.wav",
  "sfx_wave_victory_01.wav",
  "sfx_boss_enter_01.wav",
  "sfx_boss_defeated_01.wav",
  "sfx_game_start_01.wav",
  "sfx_game_over_01.wav",
  "sfx_ui_hover_01.wav",
  "sfx_ui_confirm_01.wav",
  "sfx_ui_cancel_01.wav",
  "sfx_loading_complete_01.wav",
].map((filename) => `assets/audio/sfx/${filename}`);

function getRegisteredAudioPaths() {
  const assetsSource = fs.readFileSync(path.join(projectRoot, "src/data/assets.js"), "utf8");
  return [...assetsSource.matchAll(/registerAudioAsset\([^,]+,\s*"([^"]+\.wav)"/g)].map((match) => match[1]);
}

function readWavInfo(assetPath) {
  const file = fs.readFileSync(path.join(projectRoot, assetPath));
  expect(file.subarray(0, 4).toString("ascii")).toBe("RIFF");
  expect(file.subarray(8, 12).toString("ascii")).toBe("WAVE");
  const channels = file.readUInt16LE(22);
  const sampleRate = file.readUInt32LE(24);
  const bitsPerSample = file.readUInt16LE(34);
  let offset = 12;
  let dataSize = 0;
  while (offset + 8 <= file.length) {
    const chunkId = file.subarray(offset, offset + 4).toString("ascii");
    const chunkSize = file.readUInt32LE(offset + 4);
    if (chunkId === "data") {
      dataSize = chunkSize;
      break;
    }
    offset += 8 + chunkSize;
  }
  return {
    channels,
    sampleRate,
    bitsPerSample,
    seconds: dataSize / (sampleRate * channels * (bitsPerSample / 8)),
    bytes: file.length,
  };
}

describe("formal audio assets", () => {
  it("registers every generated formal audio asset", () => {
    const registered = new Set(getRegisteredAudioPaths());
    expect([...EXPECTED_BGM, ...EXPECTED_JINGLES, ...EXPECTED_SFX].filter((assetPath) => !registered.has(assetPath))).toEqual([]);
  });

  it("writes non-empty readable wav files with expected durations", () => {
    for (const assetPath of [...EXPECTED_BGM, ...EXPECTED_JINGLES, ...EXPECTED_SFX]) {
      const info = readWavInfo(assetPath);
      expect(info.bytes).toBeGreaterThan(1000);
      expect([1, 2]).toContain(info.channels);
      expect(info.sampleRate).toBeGreaterThanOrEqual(22050);
      expect(info.bitsPerSample).toBe(16);
      if (assetPath.includes("/bgm/")) expect(info.seconds).toBeGreaterThanOrEqual(assetPath.includes("upgrade") ? 20 : 45);
      if (assetPath.includes("/sfx/")) expect(info.seconds).toBeLessThanOrEqual(1.1);
    }
  });

  it("keeps the requested formal audio counts", () => {
    expect(TEMPORARY_GLOBAL_BGM).toHaveLength(6);
    expect(LEGACY_BGM).toHaveLength(6);
    expect(EXPECTED_BGM).toHaveLength(12);
    expect(EXPECTED_JINGLES).toHaveLength(3);
    expect(EXPECTED_SFX).toHaveLength(53);
  });
});

const TAU = Math.PI * 2;

export const EQUIPMENT_WHEEL_SOURCE_GEOMETRY = Object.freeze({
  width: 1254,
  height: 1254,
  centerX: 627,
  centerY: 627,
  rotorInnerRadius: 190,
  rotorOuterRadius: 450,
  slotRadius: 346,
  slotGlyphSize: 72,
  pointerTipX: 627,
  pointerTipY: 206,
});

export const EQUIPMENT_WHEEL_LAYER_METADATA = Object.freeze({
  body: Object.freeze({
    sourceCenterX: 627,
    sourceCenterY: 627,
  }),
  pointer: Object.freeze({
    sourceCenterX: 627,
    sourceCenterY: 627,
  }),
});

const REWARD_LEVEL_COMPOSITIONS = Object.freeze({
  1: Object.freeze({
    iconCenterX: 0.22,
    iconCenterY: 0.51,
    textTop: 0.34,
    effectTop: 0.64,
  }),
  2: Object.freeze({
    iconCenterX: 0.285,
    iconCenterY: 0.52,
    textTop: 0.34,
    effectTop: 0.64,
  }),
  3: Object.freeze({
    iconCenterX: 0.22,
    iconCenterY: 0.535,
    textTop: 0.38,
    effectTop: 0.66,
  }),
  4: Object.freeze({
    iconCenterX: 0.2,
    iconCenterY: 0.49,
    textTop: 0.31,
    effectTop: 0.68,
  }),
  5: Object.freeze({
    iconCenterX: 0.205,
    iconCenterY: 0.535,
    textTop: 0.34,
    effectTop: 0.64,
  }),
});

export function createEquipmentWheelGeometry(layout) {
  const source = EQUIPMENT_WHEEL_SOURCE_GEOMETRY;
  const center = Object.freeze({
    x: layout.wheel.cx,
    y: layout.wheel.cy,
  });
  const drawWidth = layout.wheelImage?.w || layout.wheel.radius * 2;
  const drawHeight = layout.wheelImage?.h || layout.wheel.radius * 2;
  const scaleX = drawWidth / source.width;
  const scaleY = drawHeight / source.height;
  const scale = (scaleX + scaleY) / 2;

  const layers = Object.freeze(Object.fromEntries(
    Object.entries(EQUIPMENT_WHEEL_LAYER_METADATA).map(([key, metadata]) => [
      key,
      Object.freeze({
        x: -metadata.sourceCenterX * scaleX,
        y: -metadata.sourceCenterY * scaleY,
        w: drawWidth,
        h: drawHeight,
      }),
    ]),
  ));

  const slotRadius = source.slotRadius * scale;
  const slotGlyphSize = source.slotGlyphSize * scale;
  const pointerTip = Object.freeze({
    x: center.x + (source.pointerTipX - source.centerX) * scaleX,
    y: center.y + (source.pointerTipY - source.centerY) * scaleY,
  });

  return Object.freeze({
    center,
    radius: layout.wheel.radius,
    drawRect: Object.freeze({
      x: center.x - source.centerX * scaleX,
      y: center.y - source.centerY * scaleY,
      w: drawWidth,
      h: drawHeight,
    }),
    layers,
    rotorInnerRadius: source.rotorInnerRadius * scale,
    rotorOuterRadius: source.rotorOuterRadius * scale,
    slotRadius,
    slotGlyphSize,
    pointerTip,
    pointerTarget: Object.freeze({
      x: center.x,
      y: center.y - slotRadius,
    }),
  });
}

export function getEquipmentWheelSegmentAngle(
  index,
  segmentCount,
  rotation = 0,
) {
  const count = Math.max(1, Number(segmentCount) || 1);
  return -Math.PI / 2 + (Number(index) + 0.5) * (TAU / count) + rotation;
}

export function getEquipmentWheelBadgePosition(
  geometry,
  index,
  segmentCount,
  rotation = 0,
) {
  const angle = getEquipmentWheelSegmentAngle(index, segmentCount, rotation);
  return {
    angle,
    x: geometry.center.x + Math.cos(angle) * geometry.slotRadius,
    y: geometry.center.y + Math.sin(angle) * geometry.slotRadius,
  };
}

export function getEquipmentWheelSlotLayout(
  geometry,
  segmentCount,
  rotation = 0,
) {
  const count = Math.max(1, Math.floor(Number(segmentCount) || 1));
  return Array.from({ length: count }, (_, index) => Object.freeze({
    index,
    ...getEquipmentWheelBadgePosition(geometry, index, count, rotation),
    glyphSize: geometry.slotGlyphSize,
  }));
}

export function getEquipmentWheelTargetRotation(index, segmentCount) {
  const count = Math.max(1, Number(segmentCount) || 1);
  return -(Number(index) + 0.5) * (TAU / count);
}

export function getEquipmentRewardRevealLayout(layout, wheelLevel = 1) {
  const safeLevel = Math.max(1, Math.min(5, Math.floor(Number(wheelLevel) || 1)));
  const composition = REWARD_LEVEL_COMPOSITIONS[safeLevel];
  const width = layout.status.w + 24;
  const height = width * (2 / 3);
  const rect = Object.freeze({
    x: layout.status.x - 24,
    y: layout.status.y + 48,
    w: width,
    h: height,
  });
  const iconSize = height * 0.35;
  const iconCenter = Object.freeze({
    x: rect.x + rect.w * composition.iconCenterX,
    y: rect.y + rect.h * composition.iconCenterY,
  });
  const textX = rect.x + rect.w * 0.43;
  const textWidth = rect.w * 0.49;

  return Object.freeze({
    rect,
    center: Object.freeze({
      x: rect.x + rect.w / 2,
      y: rect.y + rect.h / 2,
    }),
    icon: Object.freeze({
      x: iconCenter.x - iconSize / 2,
      y: iconCenter.y - iconSize / 2,
      w: iconSize,
      h: iconSize,
      centerX: iconCenter.x,
      centerY: iconCenter.y,
    }),
    title: Object.freeze({
      x: textX,
      y: rect.y + rect.h * composition.textTop,
      w: textWidth,
    }),
    name: Object.freeze({
      x: textX,
      y: rect.y + rect.h * (composition.textTop + 0.12),
      w: textWidth,
    }),
    meta: Object.freeze({
      x: textX,
      y: rect.y + rect.h * (composition.textTop + 0.21),
      w: textWidth,
    }),
    effect: Object.freeze({
      x: textX,
      y: rect.y + rect.h * composition.effectTop,
      w: textWidth,
    }),
    hint: Object.freeze({
      x: textX,
      y: rect.y + rect.h * 0.86,
      w: textWidth,
    }),
    emblem: Object.freeze({
      x: rect.x + rect.w - 72,
      y: rect.y + rect.h * Math.max(0.3, composition.textTop - 0.04),
      size: 48,
    }),
  });
}

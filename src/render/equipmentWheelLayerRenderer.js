export function drawEquipmentWheelPointer({
  ctx,
  pointerArt,
  isImageReady,
  geometry,
  visualPower = 0,
} = {}) {
  if (!ctx || !geometry || typeof isImageReady !== "function") return false;
  return drawFixedLayer({
    ctx,
    image: pointerArt,
    isImageReady,
    geometry,
    layerKey: "pointer",
    shadowColor: `rgba(210, 155, 255, ${0.42 + visualPower * 0.24})`,
    shadowBlur: 10 + visualPower * 12,
  });
}

export function drawEquipmentWheelBody({
  ctx,
  bodyArt,
  isImageReady,
  geometry,
  visualPower = 0,
} = {}) {
  if (
    !ctx
    || !geometry
    || typeof isImageReady !== "function"
    || !isImageReady(bodyArt)
  ) {
    return false;
  }

  const rect = geometry.layers.body;
  ctx.save();
  ctx.translate(geometry.center.x, geometry.center.y);
  ctx.shadowColor = `rgba(156, 96, 255, ${0.24 + visualPower * 0.22})`;
  ctx.shadowBlur = 10 + visualPower * 14;
  ctx.drawImage(bodyArt, rect.x, rect.y, rect.w, rect.h);
  ctx.restore();
  return true;
}

function drawFixedLayer({
  ctx,
  image,
  isImageReady,
  geometry,
  layerKey,
  shadowColor,
  shadowBlur,
}) {
  if (!isImageReady(image)) return false;
  const rect = geometry.layers[layerKey];
  ctx.save();
  ctx.translate(geometry.center.x, geometry.center.y);
  ctx.shadowColor = shadowColor;
  ctx.shadowBlur = shadowBlur;
  ctx.drawImage(
    image,
    rect.x,
    rect.y,
    rect.w,
    rect.h,
  );
  ctx.restore();
  return true;
}

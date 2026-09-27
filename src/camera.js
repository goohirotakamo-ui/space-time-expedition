// A bounded 2.5D observation area. Values are game coordinates, not real distances.
export const CAMERA_LIMITS = {x: [-1, 1], y: [-1, 1], z: [-.8, 1.25], yaw: [-40, 40], pitch: [-25, 25]};
export const defaultCamera = () => ({x: 0, y: 0, z: 0, yaw: 0, pitch: 0});
export function normalizeCamera(value) {
  const camera = defaultCamera();
  for (const [key, [min, max]] of Object.entries(CAMERA_LIMITS)) {
    const n = value?.[key];
    camera[key] = typeof n === 'number' && Number.isFinite(n) ? Math.max(min, Math.min(max, n)) : 0;
  }
  return camera;
}
export function moveCamera(camera, axes, seconds) {
  const next = {...camera};
  const dt = Math.max(0, Math.min(.05, seconds));
  for (const key of Object.keys(CAMERA_LIMITS)) next[key] += (axes[key] || 0) * dt * (key === 'yaw' ? 30 : key === 'pitch' ? 22 : .52);
  return normalizeCamera(next);
}
export function cameraProjection(value) {
  const c = normalizeCamera(value), scale = 1 / (1 - c.z * .4);
  return {scale, x: -(c.x * .22 + c.yaw / 85) * scale, y: (c.y * .22 + c.pitch / 65) * scale};
}

const textures = new WeakMap();
function texture(image) {
  if (textures.has(image)) return textures.get(image);
  const c = document.createElement('canvas');
  c.width = image.width; c.height = image.height;
  const ctx = c.getContext('2d'); ctx.drawImage(image, 0, 0);
  // Fade the edge of the original view into space as the pilot looks around.
  ctx.globalCompositeOperation = 'destination-in';
  const x = ctx.createLinearGradient(0, 0, c.width, 0);
  x.addColorStop(0, 'transparent'); x.addColorStop(.08, '#000'); x.addColorStop(.92, '#000'); x.addColorStop(1, 'transparent');
  ctx.fillStyle = x; ctx.fillRect(0, 0, c.width, c.height);
  const y = ctx.createLinearGradient(0, 0, 0, c.height);
  y.addColorStop(0, 'transparent'); y.addColorStop(.08, '#000'); y.addColorStop(.92, '#000'); y.addColorStop(1, 'transparent');
  ctx.fillStyle = y; ctx.fillRect(0, 0, c.width, c.height);
  textures.set(image, c); return c;
}
// The ship, album and PDF share this composition so a photograph stays unchanged.
export function drawCameraView(ctx, image, camera, x, y, width, height) {
  const p = cameraProjection(camera), t = camera ? texture(image) : image;
  ctx.save(); ctx.beginPath(); ctx.rect(x, y, width, height); ctx.clip();
  ctx.fillStyle = '#02060c'; ctx.fillRect(x, y, width, height);
  const scale = Math.min(width / image.width, height / image.height) * p.scale;
  const w = image.width * scale, h = image.height * scale;
  ctx.drawImage(t, x + (width - w) / 2 + p.x * width, y + (height - h) / 2 + p.y * height, w, h);
  ctx.restore();
}
export function drawPhoto(ctx, image, camera, x, y, width, height) {
  const w = Math.min(width, height * 16 / 9), h = w * 9 / 16;
  drawCameraView(ctx, image, camera, x + (width - w) / 2, y + (height - h) / 2, w, h);
}

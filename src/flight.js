import {defaultCamera, normalizeCamera, moveCamera, drawCameraView} from './camera.js';
import {loadImage} from './pdf.js';

const directions = {
  forward: {z: 1}, backward: {z: -1}, left: {x: -1}, right: {x: 1}, up: {y: 1}, down: {y: -1},
  'look-left': {yaw: -1}, 'look-right': {yaw: 1}, 'look-up': {pitch: 1}, 'look-down': {pitch: -1}
};
const keyMap = {KeyW:'forward',KeyS:'backward',KeyA:'left',KeyD:'right',KeyE:'up',KeyQ:'down',ArrowLeft:'look-left',ArrowRight:'look-right',ArrowUp:'look-up',ArrowDown:'look-down'};

export function mountFlight(root, {scene, camera, onChange, onSave, blocked, photograph, onError}) {
  const canvas = root.querySelector('.flight-canvas'), surface = root.querySelector('.flight-window'), ctx = canvas.getContext('2d');
  const status = root.querySelector('.flight-status');
  const controller = new AbortController(), options = {signal: controller.signal};
  const keys = new Map(), pointers = new Map();
  let current = normalizeCamera(camera), image, frame = 0, previous = 0, drag = null, dirty = false;
  const bind = (el, type, fn, extra = {}) => el.addEventListener(type, fn, {...options, ...extra});
  function allowed() { return !blocked() && document.visibilityState === 'visible'; }
  function draw() {
    if (image) drawCameraView(ctx, image, current, 0, 0, canvas.width, canvas.height);
    status.textContent = `視線 左右 ${Math.round(current.yaw)}° / 上下 ${Math.round(current.pitch)}° · 接近 ${Math.round(current.z * 100)} · 横 ${Math.round(current.x * 100)} / 高さ ${Math.round(current.y * 100)}`;
  }
  function change(next) { current = normalizeCamera(next); dirty = true; onChange({...current}); draw(); }
  function flush() { if (dirty) { dirty = false; onSave(); } }
  function stop() {
    keys.clear(); pointers.clear(); drag = null; surface.classList.remove('dragging');
    root.querySelectorAll('.held').forEach(b => b.classList.remove('held'));
    cancelAnimationFrame(frame); frame = 0; previous = 0; flush();
  }
  function tick(time) {
    frame = 0;
    if (!allowed()) {stop(); return;}
    const actions = new Set([...keys.values(), ...pointers.values()]);
    if (!actions.size) {previous = 0; flush(); return;}
    const axes = {};
    for (const action of actions) for (const [key, value] of Object.entries(directions[action])) axes[key] = (axes[key] || 0) + value;
    change(moveCamera(current, axes, previous ? (time - previous) / 1000 : 1 / 60));
    previous = time; frame = requestAnimationFrame(tick);
  }
  function start() { if (!frame && allowed()) frame = requestAnimationFrame(tick); }
  function resize() {
    // Fixed aspect ratio keeps the recorded photograph identical across devices.
    canvas.width = Math.min(1440, Math.max(640, Math.round(canvas.clientWidth * Math.min(devicePixelRatio || 1, 1.5))));
    canvas.height = Math.round(canvas.width * 9 / 16); draw();
  }
  const observer = new ResizeObserver(resize); observer.observe(canvas);
  loadImage(scene.image).then(img => {if (!controller.signal.aborted) {image = img; resize();}}).catch(e => {if (!controller.signal.aborted) onError(e.message);});

  bind(surface, 'pointerdown', e => {
    if (!allowed() || e.button !== 0 || drag) return;
    canvas.focus({preventScroll:true}); surface.setPointerCapture(e.pointerId);
    drag = {id:e.pointerId, x:e.clientX, y:e.clientY}; surface.classList.add('dragging');
  });
  bind(surface, 'pointermove', e => {
    if (!drag || drag.id !== e.pointerId || !allowed()) return;
    const rect = canvas.getBoundingClientRect();
    change({...current, yaw:current.yaw - (e.clientX - drag.x) / rect.width * 90, pitch:current.pitch + (e.clientY - drag.y) / rect.height * 55});
    drag.x = e.clientX; drag.y = e.clientY;
  });
  const endDrag = e => {if (drag?.id === e.pointerId) {drag = null; surface.classList.remove('dragging'); flush();}};
  bind(surface,'pointerup',endDrag); bind(surface,'pointercancel',endDrag); bind(surface,'lostpointercapture',endDrag);
  bind(surface, 'wheel', e => {
    if (!allowed() || document.activeElement !== canvas) return;
    e.preventDefault(); change({...current,z:current.z - Math.sign(e.deltaY) * .08}); flush();
  }, {passive:false});
  bind(root, 'keydown', e => {
    if (e.target.matches('input,textarea,select') || !allowed() || e.altKey || e.ctrlKey || e.metaKey) return;
    if (keyMap[e.code]) {e.preventDefault();if(!keys.has(e.code))change(moveCamera(current,directions[keyMap[e.code]],.05));keys.set(e.code,keyMap[e.code]);start();}
    if (e.code === 'Space' && e.target === canvas && !e.repeat) {e.preventDefault();stop();photograph();}
  });
  bind(window,'keyup', e => {if (keys.delete(e.code)) {e.preventDefault();if (!keys.size && !pointers.size) stop();}});
  bind(root,'focusout', e => {if (!root.contains(e.relatedTarget)) stop();});
  bind(window,'blur', stop); bind(document,'visibilitychange', stop);
  for (const button of root.querySelectorAll('[data-flight]')) {
    const action = button.dataset.flight;
    let pointerStepped = false;
    bind(button,'pointerdown', e => {
      if (!allowed() || e.button !== 0) return;
      button.focus({preventScroll:true}); button.setPointerCapture(e.pointerId);
      pointerStepped = true; pointers.set(e.pointerId, action); button.classList.add('held'); change(moveCamera(current,directions[action],.05)); start();
    });
    const release = e => {if (pointers.delete(e.pointerId)) {button.classList.remove('held');if (!keys.size && !pointers.size) stop();}};
    bind(button,'pointerup',release); bind(button,'pointercancel',release); bind(button,'lostpointercapture',release);
    // A keyboard/assistive click takes one small step; pointer holds are continuous.
    bind(button,'click', e => {if ((!pointerStepped || e.detail === 0) && allowed()) {change(moveCamera(current,directions[action],.05));flush();}pointerStepped=false;});
    bind(button,'pointercancel', () => {pointerStepped=false;});
  }
  bind(root.querySelector('[data-flight-reset]'),'click', () => {if (allowed()) {stop();change(defaultCamera());flush();}});
  bind(root.querySelector('[data-flight-toggle]'),'click', e => {
    const panel = root.querySelector('.flight-panel'), open = panel.hidden;
    panel.hidden = !open; e.currentTarget.setAttribute('aria-expanded',String(open));
    if (!open) stop();
  });
  draw();
  return {stop, dispose() {stop(); observer.disconnect(); controller.abort();}};
}

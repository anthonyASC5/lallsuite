import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.module.js";

function ensureComputerStyles() {
  if (document.querySelector("#computer-ui-styles")) {
    return;
  }

  const style = document.createElement("style");
  style.id = "computer-ui-styles";
  style.textContent = `
    .retro-desktop {
      position: absolute;
      inset: 0;
      z-index: 8;
      display: grid;
      place-items: center;
      padding: 32px;
      background:
        radial-gradient(circle at top, rgba(255, 255, 255, 0.18), transparent 26%),
        linear-gradient(180deg, rgba(0, 72, 126, 0.94) 0%, rgba(0, 110, 150, 0.95) 100%);
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.18s ease;
      overflow: hidden;
    }

    .retro-desktop.visible {
      opacity: 1;
      pointer-events: auto;
    }

    .retro-desktop::before {
      content: "";
      position: absolute;
      inset: 0;
      background:
        linear-gradient(transparent 0%, rgba(255, 255, 255, 0.08) 50%, transparent 100%),
        repeating-linear-gradient(
          0deg,
          rgba(255, 255, 255, 0.05) 0,
          rgba(255, 255, 255, 0.05) 1px,
          transparent 1px,
          transparent 3px
        );
      opacity: 0.22;
      pointer-events: none;
    }

    .retro-desktop__icons {
      position: absolute;
      top: 26px;
      left: 20px;
      display: grid;
      gap: 16px;
      z-index: 1;
    }

    .retro-desktop__icon {
      width: 84px;
      color: #ffffff;
      font-family: "Tahoma", "Verdana", sans-serif;
      font-size: 0.75rem;
      text-align: center;
      text-shadow: 1px 1px 0 rgba(0, 0, 0, 0.6);
    }

    .retro-desktop__icon::before {
      content: "";
      display: block;
      width: 42px;
      height: 38px;
      margin: 0 auto 8px;
      border: 2px solid rgba(255, 255, 255, 0.75);
      background:
        linear-gradient(180deg, #d9d9d9 0 24%, #1756d9 24% 100%);
      box-shadow: 2px 2px 0 rgba(0, 0, 0, 0.28);
    }

    .retro-window {
      position: relative;
      width: min(760px, 100%);
      border: 3px solid #d5d5d5;
      border-right-color: #3d3d3d;
      border-bottom-color: #3d3d3d;
      background: #c3c3c3;
      box-shadow: 18px 18px 0 rgba(0, 0, 0, 0.26);
      font-family: "Tahoma", "Verdana", sans-serif;
      color: #111111;
      z-index: 2;
    }

    .retro-window__titlebar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      padding: 5px 6px 5px 8px;
      background: linear-gradient(90deg, #001f90 0%, #0b64f0 100%);
      color: #ffffff;
      font-size: 0.9rem;
      font-weight: 700;
    }

    .retro-window__title {
      display: flex;
      align-items: center;
      gap: 8px;
      min-width: 0;
      letter-spacing: 0.03em;
    }

    .retro-window__title::before {
      content: "";
      width: 16px;
      height: 16px;
      border: 1px solid rgba(255, 255, 255, 0.7);
      background: linear-gradient(180deg, #ffe46f 0%, #ff8f1f 100%);
      box-shadow: inset -1px -1px 0 rgba(0, 0, 0, 0.2);
      flex: 0 0 auto;
    }

    .retro-window__controls {
      display: inline-flex;
      gap: 4px;
      flex: 0 0 auto;
    }

    .retro-window__controls button,
    .retro-window__toolbar button,
    .retro-taskbar__start {
      border: 2px solid #ffffff;
      border-right-color: #4b4b4b;
      border-bottom-color: #4b4b4b;
      background: #c3c3c3;
      color: #111111;
      font: inherit;
      cursor: pointer;
      padding: 0;
    }

    .retro-window__controls button {
      width: 24px;
      height: 22px;
      line-height: 1;
      font-weight: 700;
    }

    .retro-window__menubar {
      display: flex;
      gap: 18px;
      padding: 7px 10px 4px;
      font-size: 0.78rem;
      background: #c3c3c3;
    }

    .retro-window__toolbar {
      display: flex;
      gap: 6px;
      padding: 6px 8px 8px;
      border-top: 1px solid #f0f0f0;
      border-bottom: 1px solid #8a8a8a;
      background: #d7d7d7;
    }

    .retro-window__toolbar button {
      min-width: 58px;
      padding: 3px 8px;
      font-size: 0.74rem;
    }

    .retro-window__address {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px;
      border-top: 1px solid #ffffff;
      border-bottom: 1px solid #7c7c7c;
      background: #cfcfcf;
      font-size: 0.78rem;
    }

    .retro-window__address-bar {
      flex: 1;
      min-width: 0;
      padding: 6px 8px;
      border: 2px solid #7c7c7c;
      border-right-color: #ffffff;
      border-bottom-color: #ffffff;
      background: #ffffff;
      color: #1b1b1b;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .retro-window__viewport {
      padding: 14px;
      min-height: 360px;
      background:
        linear-gradient(180deg, #f7f7f7 0%, #d8ebff 100%);
      border-top: 1px solid #ffffff;
      border-bottom: 1px solid #7f7f7f;
    }

    .retro-webpage {
      min-height: 100%;
      border: 2px solid #7f7f7f;
      border-right-color: #ffffff;
      border-bottom-color: #ffffff;
      background:
        linear-gradient(180deg, #ffffff 0%, #ecf6ff 100%);
      box-shadow: inset 0 0 0 2px #d6d6d6;
      overflow: hidden;
    }

    .retro-webpage__masthead {
      padding: 14px 18px;
      background: linear-gradient(90deg, #001d77 0%, #0d73cf 100%);
      color: #ffffff;
      font-size: 0.82rem;
      font-weight: 700;
      letter-spacing: 0.16em;
      text-transform: uppercase;
    }

    .retro-webpage__body {
      display: grid;
      place-items: center;
      min-height: 250px;
      padding: 24px;
      text-align: center;
      color: #111111;
    }

    .retro-webpage__body h1 {
      margin: 0 0 14px;
      font-family: "Press Start 2P", monospace;
      font-size: clamp(2rem, 8vw, 4rem);
      color: #083a8f;
      text-shadow: 4px 4px 0 rgba(255, 214, 10, 0.55);
    }

    .retro-webpage__body p {
      margin: 0;
      max-width: 34ch;
      line-height: 1.7;
      font-size: 0.92rem;
    }

    .retro-window__status {
      display: flex;
      justify-content: space-between;
      gap: 12px;
      padding: 6px 8px;
      font-size: 0.76rem;
      background: #c3c3c3;
    }

    .retro-window__status span {
      flex: 1;
      padding: 4px 6px;
      border: 2px solid #8a8a8a;
      border-right-color: #ffffff;
      border-bottom-color: #ffffff;
      background: #d7d7d7;
    }

    .retro-taskbar {
      position: absolute;
      right: 0;
      bottom: 0;
      left: 0;
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 6px;
      background: #c3c3c3;
      border-top: 2px solid #ffffff;
      z-index: 3;
    }

    .retro-taskbar__start {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 5px 12px;
      font-weight: 700;
    }

    .retro-taskbar__start::before {
      content: "";
      width: 14px;
      height: 14px;
      background: linear-gradient(180deg, #48c552 0%, #12812e 100%);
      border: 1px solid rgba(0, 0, 0, 0.3);
      box-shadow: inset -1px -1px 0 rgba(255, 255, 255, 0.4);
    }

    .retro-taskbar__label {
      flex: 1;
      padding: 7px 10px;
      border: 2px solid #8a8a8a;
      border-right-color: #ffffff;
      border-bottom-color: #ffffff;
      background: #d7d7d7;
      font-size: 0.78rem;
    }

    @media (max-width: 720px) {
      .retro-desktop {
        padding: 18px 12px 64px;
      }

      .retro-desktop__icons {
        display: none;
      }

      .retro-window__toolbar {
        flex-wrap: wrap;
      }

      .retro-window__viewport {
        min-height: 280px;
        padding: 10px;
      }
    }
  `;

  document.head.appendChild(style);
}

function createScreenPainter() {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 384;
  const context = canvas.getContext("2d");
  const texture = new THREE.CanvasTexture(canvas);
  texture.encoding = THREE.sRGBEncoding;

  let lastSignature = "";

  function draw(mode, blinkOn) {
    const signature = `${mode}:${blinkOn ? 1 : 0}`;
    if (signature === lastSignature) {
      return;
    }

    lastSignature = signature;
    const accent = mode === "online" ? "#74ff98" : mode === "hover" ? "#7de2ff" : "#5fe9d0";
    const glow = mode === "online" ? "rgba(116, 255, 152, 0.42)" : "rgba(125, 226, 255, 0.3)";

    context.clearRect(0, 0, canvas.width, canvas.height);

    const gradient = context.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, "#16353d");
    gradient.addColorStop(1, "#081318");
    context.fillStyle = gradient;
    context.fillRect(0, 0, canvas.width, canvas.height);

    for (let index = 0; index < 64; index += 1) {
      context.fillStyle = index % 2 === 0 ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.008)";
      context.fillRect(0, index * 6, canvas.width, 2);
    }

    context.fillStyle = glow;
    context.fillRect(0, 0, canvas.width, 48);

    context.fillStyle = accent;
    context.shadowColor = accent;
    context.shadowBlur = 24;
    context.font = '16px "Press Start 2P", monospace';
    context.textAlign = "left";
    context.fillText("LALL OS 95", 28, 40);

    context.font = '14px "Press Start 2P", monospace';
    context.fillText(mode === "online" ? "SITE ONLINE" : "DOUBLE CLICK", 28, 92);

    context.font = '48px "Press Start 2P", monospace';
    context.textAlign = "center";
    context.fillText(mode === "online" ? "HI" : "HI.exe", canvas.width / 2, canvas.height / 2 + 18);

    context.shadowBlur = 0;
    context.font = '14px "Press Start 2P", monospace';
    context.textAlign = "left";
    context.fillStyle = "#dffdf6";
    context.fillText("C:\\\\LALL> open hi-site", 28, canvas.height - 42);
    if (blinkOn) {
      context.fillRect(274, canvas.height - 54, 14, 18);
    }

    texture.needsUpdate = true;
  }

  return { texture, draw };
}

function createOverlay(mount) {
  const overlay = document.createElement("div");
  overlay.className = "retro-desktop";
  overlay.setAttribute("aria-hidden", "true");
  overlay.innerHTML = `
    <div class="retro-desktop__icons" aria-hidden="true">
      <div class="retro-desktop__icon">My Computer</div>
      <div class="retro-desktop__icon">Lall Studio</div>
      <div class="retro-desktop__icon">Hi Site</div>
    </div>

    <div class="retro-window" role="dialog" aria-modal="true" aria-labelledby="retro-window-title">
      <div class="retro-window__titlebar">
        <div class="retro-window__title" id="retro-window-title">Retro Browser - Lall Studio</div>
        <div class="retro-window__controls">
          <button type="button" aria-label="Minimize">_</button>
          <button type="button" aria-label="Maximize">□</button>
          <button type="button" aria-label="Close" data-close>x</button>
        </div>
      </div>

      <div class="retro-window__menubar">
        <span>File</span>
        <span>Edit</span>
        <span>View</span>
        <span>Favorites</span>
        <span>Help</span>
      </div>

      <div class="retro-window__toolbar">
        <button type="button">Back</button>
        <button type="button">Forward</button>
        <button type="button">Refresh</button>
        <button type="button">Home</button>
      </div>

      <div class="retro-window__address">
        <strong>Address</strong>
        <div class="retro-window__address-bar">https://lall.studio/hi</div>
      </div>

      <div class="retro-window__viewport">
        <div class="retro-webpage">
          <div class="retro-webpage__masthead">Anthony Lall on the World Wide Web</div>
          <div class="retro-webpage__body">
            <div>
              <h1>Hi</h1>
              <p>A retro site booted from the computer sitting in the grass next to the red guitar.</p>
            </div>
          </div>
        </div>
      </div>

      <div class="retro-window__status">
        <span>Done</span>
        <span>Connected to Lall Studio</span>
      </div>
    </div>

    <div class="retro-taskbar" aria-hidden="true">
      <button class="retro-taskbar__start" type="button">Start</button>
      <div class="retro-taskbar__label">Retro Browser - Hi</div>
    </div>
  `;

  mount.appendChild(overlay);
  return overlay;
}

export function createComputerExperience({ scene, mount, clickableMeshes, hoverOnlyMeshes }) {
  ensureComputerStyles();

  const overlay = createOverlay(mount);
  const group = new THREE.Group();
  const painter = createScreenPainter();

  const plasticMaterial = new THREE.MeshStandardMaterial({
    color: 0xd9cfbb,
    roughness: 0.74,
    metalness: 0.08,
  });
  const accentMaterial = new THREE.MeshStandardMaterial({
    color: 0xbcae95,
    roughness: 0.82,
    metalness: 0.03,
  });
  const darkPlastic = new THREE.MeshStandardMaterial({
    color: 0x2f373d,
    roughness: 0.54,
    metalness: 0.18,
  });
  const steel = new THREE.MeshStandardMaterial({
    color: 0x8d9499,
    roughness: 0.3,
    metalness: 0.92,
  });
  const keyMaterial = new THREE.MeshStandardMaterial({
    color: 0xe6e1d2,
    roughness: 0.85,
    metalness: 0.02,
  });
  const mouseMaterial = new THREE.MeshStandardMaterial({
    color: 0xc7c2b2,
    roughness: 0.82,
    metalness: 0.03,
  });

  group.position.set(3.18, -0.48, -4.22);
  group.rotation.y = -0.5;
  group.scale.setScalar(0.92);

  const tower = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.96, 0.62), plasticMaterial);
  tower.position.set(0.8, 0.48, -0.02);
  group.add(tower);

  const towerFace = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.88, 0.03), accentMaterial);
  towerFace.position.set(0.8, 0.48, 0.3);
  group.add(towerFace);

  const floppySlot = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.03, 0.02), darkPlastic);
  floppySlot.position.set(0.8, 0.72, 0.315);
  group.add(floppySlot);

  const driveBay = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.08, 0.02), darkPlastic);
  driveBay.position.set(0.8, 0.56, 0.315);
  group.add(driveBay);

  const powerButton = new THREE.Mesh(new THREE.CylinderGeometry(0.034, 0.034, 0.02, 16), steel);
  powerButton.rotation.x = Math.PI / 2;
  powerButton.position.set(0.66, 0.19, 0.316);
  group.add(powerButton);

  const powerLed = new THREE.Mesh(
    new THREE.SphereGeometry(0.024, 14, 14),
    new THREE.MeshStandardMaterial({
      color: 0x48f39d,
      emissive: 0x48f39d,
      emissiveIntensity: 0.4,
      roughness: 0.24,
      metalness: 0.18,
    })
  );
  powerLed.position.set(0.91, 0.2, 0.316);
  group.add(powerLed);

  const monitorShell = new THREE.Mesh(new THREE.BoxGeometry(1.02, 0.78, 0.72), plasticMaterial);
  monitorShell.position.set(-0.08, 1, -0.02);
  group.add(monitorShell);

  const monitorScreenFrame = new THREE.Mesh(new THREE.BoxGeometry(0.76, 0.56, 0.05), darkPlastic);
  monitorScreenFrame.position.set(-0.08, 1.02, 0.345);
  group.add(monitorScreenFrame);

  const monitorScreen = new THREE.Mesh(
    new THREE.PlaneGeometry(0.64, 0.46),
    new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: painter.texture,
      emissive: 0x66fff1,
      emissiveMap: painter.texture,
      emissiveIntensity: 0.48,
      roughness: 0.42,
      metalness: 0.08,
    })
  );
  monitorScreen.position.set(-0.08, 1.02, 0.373);
  group.add(monitorScreen);

  const monitorBase = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.2, 0.11, 18), accentMaterial);
  monitorBase.position.set(-0.08, 0.54, 0);
  group.add(monitorBase);

  const monitorNeck = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.22, 0.2), accentMaterial);
  monitorNeck.position.set(-0.08, 0.69, 0);
  group.add(monitorNeck);

  const keyboard = new THREE.Mesh(new THREE.BoxGeometry(0.88, 0.09, 0.34), plasticMaterial);
  keyboard.position.set(0.02, 0.12, 0.56);
  keyboard.rotation.x = -0.12;
  group.add(keyboard);

  const keyField = new THREE.Mesh(new THREE.BoxGeometry(0.66, 0.028, 0.18), keyMaterial);
  keyField.position.set(-0.02, 0.165, 0.56);
  keyField.rotation.x = -0.12;
  group.add(keyField);

  const keyAccent = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.028, 0.06), new THREE.MeshStandardMaterial({
    color: 0x2f7fe2,
    roughness: 0.5,
    metalness: 0.08,
  }));
  keyAccent.position.set(0.3, 0.166, 0.59);
  keyAccent.rotation.x = -0.12;
  group.add(keyAccent);

  const mouse = new THREE.Mesh(new THREE.SphereGeometry(0.09, 18, 14), mouseMaterial);
  mouse.scale.set(1, 0.52, 1.24);
  mouse.position.set(0.52, 0.09, 0.64);
  group.add(mouse);

  const mouseCord = new THREE.Mesh(
    new THREE.TorusGeometry(0.13, 0.008, 8, 24, Math.PI * 1.2),
    darkPlastic
  );
  mouseCord.rotation.set(Math.PI / 2, 0.4, 0.12);
  mouseCord.position.set(0.34, 0.11, 0.45);
  group.add(mouseCord);

  const screenGlow = new THREE.PointLight(0x78fff2, 0.45, 3.6, 2);
  screenGlow.position.set(-0.08, 1.04, 0.56);
  group.add(screenGlow);

  painter.draw("standby", true);

  group.traverse((child) => {
    if (!child.isMesh) {
      return;
    }

    child.castShadow = true;
    child.receiveShadow = true;
    child.userData.hoverTarget = group;
    hoverOnlyMeshes.push(child);
  });

  clickableMeshes.push(monitorScreen, monitorScreenFrame, powerButton, towerFace);

  function openOverlay() {
    overlay.classList.add("visible");
    overlay.setAttribute("aria-hidden", "false");
    group.userData.press = 1;
    group.userData.clickCooldown = performance.now() + 180;
  }

  function closeOverlay() {
    overlay.classList.remove("visible");
    overlay.setAttribute("aria-hidden", "true");
  }

  overlay.querySelector("[data-close]").addEventListener("click", closeOverlay);
  overlay.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeOverlay();
    }
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && overlay.classList.contains("visible")) {
      closeOverlay();
    }
  });

  group.userData = {
    computer: true,
    title: "Studio Computer",
    description: "Click to boot a retro Windows-style browser window.",
    hover: 0,
    press: 0,
    clickCooldown: 0,
    baseY: group.position.y,
    activate: openOverlay,
  };

  scene.add(group);

  function update(now, isHovered) {
    const data = group.userData;
    data.hover += ((isHovered ? 1 : 0) - data.hover) * 0.14;
    data.press += (0 - data.press) * 0.18;

    if (now < data.clickCooldown) {
      data.press = 0.62;
    }

    group.position.y = data.baseY + data.hover * 0.06 - data.press * 0.035;
    monitorShell.rotation.x = data.hover * 0.03;
    monitorScreenFrame.rotation.x = data.hover * 0.03;
    monitorScreen.rotation.x = data.hover * 0.03;

    const overlayOpen = overlay.classList.contains("visible");
    const blinkOn = Math.sin(now * 0.008) > 0;
    const mode = overlayOpen ? "online" : isHovered ? "hover" : "standby";
    painter.draw(mode, blinkOn);

    monitorScreen.material.emissiveIntensity = overlayOpen ? 0.88 : 0.44 + data.hover * 0.38;
    powerLed.material.emissiveIntensity = overlayOpen ? 1.2 : 0.38 + data.hover * 0.52;
    screenGlow.intensity = overlayOpen ? 0.82 : 0.35 + data.hover * 0.5;
  }

  return {
    group,
    update,
    open: openOverlay,
    close: closeOverlay,
    isOpen: () => overlay.classList.contains("visible"),
    getState: () => ({
      open: overlay.classList.contains("visible"),
      x: Number(group.position.x.toFixed(2)),
      y: Number(group.position.y.toFixed(2)),
      z: Number(group.position.z.toFixed(2)),
    }),
  };
}

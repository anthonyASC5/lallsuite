const pedals = [
  {
    name: "Blob Tracker",
    description:
      "Live motion-based video editor that detects shapes and movement in footage. Turn visuals into reactive blobs, VHS artifacts, and experimental motion graphics.",
    color: "#ff3dc8",
    url: "https://anthonyasc5.github.io/blobbertrack/",
    status: "live",
  },
  {
    name: "Depth Engine",
    description:
      "Experimental LiDAR depth visualizer. Convert images into layered 3D particle fields and scan-line depth maps.",
    color: "#ffd400",
    url: "https://anthonyasc5.github.io/depthenginebyall/",
    status: "live",
  },
  {
    name: "Portfolio",
    description:
      "Projects, experiments, and design work by Anthony Lall. Interactive prototypes, creative coding, and visual tools.",
    color: "#f1f1f3",
    url: "https://anthonyasc5.github.io/anthonys-project/",
    status: "live",
  },
  {
    name: "Slowed + Reverb",
    description:
      "Instant audio transformer. Drag in music and generate slowed, atmospheric edits with reverb and pitch control.",
    color: "#6b2cff",
    url: "",
    status: "coming-soon",
  },
  {
    name: "Kinect Engine",
    description:
      "Real-time body tracking experiments using depth sensors. Motion-driven visuals and interactive environments.",
    color: "#39ff68",
    url: "",
    status: "coming-soon",
  },
  {
    name: "Vibe Sync",
    description:
      "Audio reactive visualizer engine. Sync music to generative visuals and animated depth effects.",
    color: "#25dfff",
    url: "https://anthonyasc5.github.io/vibesync/",
    status: "live",
  },
];

const pedalboard = document.querySelector("#pedalboard");

function displayStatusText() {
  return "READY";
}

function createPedalElement(pedal) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "pedal";
  button.setAttribute("aria-label", `${pedal.name} pedal`);
  button.style.setProperty("--pedal-color", pedal.color);

  button.innerHTML = `
    <div class="pedal-top">
      <div class="brand">Anthony Lall Tools</div>
      <div class="led" aria-hidden="true"></div>
    </div>
    <div class="display-wrap">
      <div class="tooltip">${pedal.description}</div>
      <div class="display" aria-live="polite">
        <div class="display-text">${displayStatusText()}</div>
      </div>
    </div>
    <div class="pedal-name">${pedal.name}</div>
    <div class="footswitch" aria-hidden="true"></div>
    <div class="status">${pedal.status === "live" ? "Live" : "Coming Soon"}</div>
  `;

  const led = button.querySelector(".led");
  const display = button.querySelector(".display-text");

  const activate = () => {
    button.classList.add("active");
    led.classList.add("on");
    display.textContent = "DESCRIPTION";
  };

  const deactivate = () => {
    button.classList.remove("active");
    if (button.dataset.booted === "true") {
      led.classList.add("on");
    } else {
      led.classList.remove("on");
    }
    display.textContent = "READY";
  };

  button.addEventListener("mouseenter", activate);
  button.addEventListener("focus", activate);
  button.addEventListener("mouseleave", deactivate);
  button.addEventListener("blur", deactivate);

  button.addEventListener("click", () => {
    if (pedal.status === "live" && pedal.url) {
      window.open(pedal.url, "_blank", "noopener,noreferrer");
      return;
    }

    button.classList.add("active");
    led.classList.add("on");
    display.textContent = "COMING SOON";

    window.setTimeout(() => {
      if (!button.matches(":hover") && document.activeElement !== button) {
        deactivate();
      }
    }, 1200);
  });

  return button;
}

function renderPedals() {
  pedals.forEach((pedal) => {
    const pedalElement = createPedalElement(pedal);
    pedalboard.appendChild(pedalElement);
  });
}

function runBootSequence() {
  const pedalElements = [...document.querySelectorAll(".pedal")];

  pedalElements.forEach((pedal, index) => {
    const led = pedal.querySelector(".led");
    const display = pedal.querySelector(".display-text");

    window.setTimeout(() => {
      led.classList.add("on");
      pedal.dataset.booted = "true";
      display.textContent = "READY";
      display.style.animation = "bootFlash 0.35s ease";

      window.setTimeout(() => {
        display.style.animation = "";
      }, 400);
    }, 260 * (index + 1));
  });
}

renderPedals();
runBootSequence();
const fallbackPoem = [
  "Olivia, I'm counting days like rows in a field,",
  "Each sunrise a tally my restless heart has sealed.",
  "From dust on my boots to stars overhead,",
  "Every moment whispers the vows still unsaid.",
  "Time feels stubborn, it won't bend to my plea,",
  "I wish it would slow, drift softer for me.",
  "Because every second that carries your name,",
  "Olivia, I hold like a flickering flame.",
  "I'm just a farm boy from far southern lands,",
  "With soil in my veins and calluses on my hands.",
  "Nothing much, no riches to lay at your feet,",
  "But a world made of love, steady and complete.",
  "Olivia, you're beauty the daylight can't claim,",
  "The sun only borrows a piece of your flame.",
  "You're precious in ways no words can contain,",
  "Like the first drop of life in a long-awaited rain.",
  "I can't go a day without feeling you near,",
  "In the wind through the fields, in the hush I can hear.",
  "And though miles or moments may test what is true,",
  "There's nothing on earth I wouldn't do for you.",
  "So I count every day, but I cherish them too,",
  "For each one is closer to standing with you.",
  "Olivia, my love, when that moment is here,",
  "I'll give you my world, every breath, every year.",
];

const sceneTitles = [
  "I Count For You",
  "Time Slows On Your Name",
  "What I Have Is Devotion",
  "You Carry The Light",
  "Distance Tests, Love Doesn't",
  "Every Day, Closer",
];

const sceneSubtitles = [
  "one tap reveals one line",
  "a slow and steady heartbeat",
  "nothing fancy, all true",
  "the world softens around you",
  "miles cannot undo this",
  "closer with every sunrise",
];

const app = {
  sceneShell: document.getElementById("scene-shell"),
  sceneEyebrow: document.getElementById("scene-eyebrow"),
  sceneTitle: document.getElementById("scene-title"),
  sceneSubtitle: document.getElementById("scene-subtitle"),
  sceneLines: document.getElementById("scene-lines"),
  photoStage: document.getElementById("photo-stage"),
  photoNote: document.getElementById("photo-note"),
  closingLines: document.getElementById("closing-lines"),
  tapHint: document.getElementById("tap-hint"),
};

const state = {
  slides: [],
  slideIndex: 0,
  lineIndex: -1,
  transitionLocked: false,
  prefersReducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
};

bootstrap().catch((err) => {
  console.error("Failed to initialize poem experience", err);
});

async function bootstrap() {
  const poemLines = await getPoemLines();
  const chunks = chunkLines(poemLines, 4);
  state.slides = buildSlides(chunks);

  renderSlide(0, true);
  bindInteractions();
  initBackgroundMotion();
  initAmbientStars();
}

async function getPoemLines() {
  try {
    const response = await fetch("poem.txt", { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`Could not load poem.txt: ${response.status}`);
    }

    const poemText = await response.text();
    const lines = poemText
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);

    return lines.length ? lines : fallbackPoem;
  } catch (_error) {
    return fallbackPoem;
  }
}

function chunkLines(lines, size) {
  const chunks = [];
  for (let index = 0; index < lines.length; index += size) {
    chunks.push(lines.slice(index, index + size));
  }
  return chunks;
}

function buildSlides(chunks) {
  const slides = [
    {
      type: "intro",
      eyebrow: "something special for you",
      title: "For Olivia",
      subtitle: "Tap anywhere to begin",
    },
  ];

  chunks.forEach((lines, index) => {
    if (index === 3) {
      slides.push({
        type: "photo",
        eyebrow: "our moment",
        title: "A Pause In Time",
        subtitle: "Tap to reveal this memory",
        note: "This is where my time slows down: right here, with you.",
      });
    }

    slides.push({
      type: "poem",
      eyebrow: "for olivia",
      title: sceneTitles[index] || "For Olivia",
      subtitle: sceneSubtitles[index] || "tap to continue",
      lines,
    });
  });

  slides.push({
    type: "closing",
    eyebrow: "always",
    title: "Until then, every day is yours.",
    subtitle: "Tap to replay",
    closing: chunks[chunks.length - 1].slice(-2).join(" "),
  });

  return slides;
}

function bindInteractions() {
  document.body.addEventListener("pointerup", onAdvance, { passive: true });
  document.body.addEventListener("keydown", (event) => {
    if (event.code !== "Space" && event.code !== "Enter") {
      return;
    }

    event.preventDefault();
    onAdvance();
  });
}

function onAdvance() {
  if (state.transitionLocked) {
    return;
  }

  const current = state.slides[state.slideIndex];
  if (!current) {
    return;
  }

  if (current.type === "intro") {
    goToSlide(state.slideIndex + 1);
    return;
  }

  if (current.type === "poem") {
    revealNextPoemLine(current);
    return;
  }

  if (current.type === "photo") {
    advancePhotoSlide(current);
    return;
  }

  if (current.type === "closing") {
    goToSlide(0);
  }
}

function revealNextPoemLine(slide) {
  if (state.lineIndex + 1 >= slide.lines.length) {
    goToSlide(state.slideIndex + 1);
    return;
  }

  state.lineIndex += 1;
  const lineNodes = app.sceneLines.querySelectorAll(".scene-line");
  const lineNode = lineNodes[state.lineIndex];
  if (!lineNode) {
    return;
  }

  lineNode.classList.add("revealed");
  gsap.fromTo(
    lineNode,
    { opacity: 0, y: 16, rotateX: 9, filter: "blur(7px)" },
    { opacity: 1, y: 0, rotateX: 0, filter: "blur(0px)", duration: 0.72, ease: "power3.out" },
  );
}

function advancePhotoSlide(slide) {
  if (app.photoStage.hidden) {
    app.photoStage.hidden = false;
    app.sceneSubtitle.textContent = "Tap again";
    gsap.fromTo(
      app.photoStage,
      { opacity: 0, y: 18, scale: 0.98, filter: "blur(10px)" },
      { opacity: 1, y: 0, scale: 1, filter: "blur(0px)", duration: 0.85, ease: "power3.out" },
    );
    return;
  }

  if (app.photoNote.hidden) {
    app.photoNote.hidden = false;
    app.photoNote.textContent = slide.note;
    app.sceneSubtitle.textContent = "Tap to continue";
    gsap.fromTo(
      app.photoNote,
      { opacity: 0, y: 8, filter: "blur(8px)" },
      { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.65, ease: "power2.out" },
    );
    return;
  }

  goToSlide(state.slideIndex + 1);
}

function goToSlide(index) {
  if (index >= state.slides.length) {
    index = 0;
  }

  state.slideIndex = index;
  state.lineIndex = -1;
  renderSlide(index, false);
}

function renderSlide(index, immediate) {
  const slide = state.slides[index];
  if (!slide) {
    return;
  }

  app.sceneEyebrow.textContent = slide.eyebrow || "";
  app.sceneTitle.textContent = slide.title || "";
  app.sceneSubtitle.textContent = slide.subtitle || "";
  app.sceneLines.innerHTML = "";
  app.photoStage.hidden = true;
  app.photoNote.hidden = true;
  app.closingLines.hidden = true;

  app.tapHint.textContent = slide.type === "closing" ? "Tap to replay" : "Tap anywhere";

  if (slide.type === "poem") {
    const lineFragment = document.createDocumentFragment();
    slide.lines.forEach((line) => {
      const item = document.createElement("li");
      item.className = "scene-line";
      item.innerHTML = highlightName(line);
      lineFragment.appendChild(item);
    });
    app.sceneLines.appendChild(lineFragment);
  }

  if (slide.type === "photo") {
    gsap.to(app.photoStage, {
      yPercent: -2.2,
      duration: 3,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    });
  } else {
    gsap.killTweensOf(app.photoStage);
    app.photoStage.style.transform = "translateY(0px)";
  }

  if (slide.type === "closing") {
    app.closingLines.textContent = slide.closing;
    app.closingLines.hidden = false;
    gsap.fromTo(
      app.closingLines,
      { opacity: 0, y: 12, filter: "blur(8px)" },
      { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.8, ease: "power2.out" },
    );
  }

  if (immediate || state.prefersReducedMotion) {
    app.sceneShell.style.opacity = "1";
    app.sceneShell.style.transform = "translateY(0px) scale(1)";
    return;
  }

  state.transitionLocked = true;
  gsap.fromTo(
    app.sceneShell,
    { opacity: 0.38, y: 18, scale: 0.985, filter: "blur(8px)" },
    {
      opacity: 1,
      y: 0,
      scale: 1,
      filter: "blur(0px)",
      duration: 0.72,
      ease: "power3.out",
      onComplete: () => {
        state.transitionLocked = false;
      },
    },
  );
}

function highlightName(line) {
  return line.replace(/Olivia/gi, '<span class="name-highlight">$&</span>');
}

function initBackgroundMotion() {
  if (state.prefersReducedMotion) {
    return;
  }

  gsap.to(".bg-glow-a", {
    xPercent: -8,
    yPercent: 11,
    duration: 17,
    repeat: -1,
    yoyo: true,
    ease: "sine.inOut",
  });

  gsap.to(".bg-glow-b", {
    xPercent: 10,
    yPercent: -13,
    duration: 20,
    repeat: -1,
    yoyo: true,
    ease: "sine.inOut",
  });
}

function initAmbientStars() {
  if (state.prefersReducedMotion) {
    return;
  }

  const canvas = document.getElementById("star-canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return;
  }

  const stars = [];
  const starCount = Math.min(120, Math.floor(window.innerWidth * 0.22));
  let width = window.innerWidth;
  let height = window.innerHeight;

  const resize = () => {
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.floor(width * ratio);
    canvas.height = Math.floor(height * ratio);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  };

  const spawnStar = (yOffset = Math.random() * height) => ({
    x: Math.random() * width,
    y: yOffset,
    size: Math.random() * 1.5 + 0.4,
    drift: (Math.random() - 0.5) * 0.08,
    speed: Math.random() * 0.09 + 0.03,
    alpha: Math.random() * 0.5 + 0.25,
    twinkleSpeed: Math.random() * 0.03 + 0.01,
    phase: Math.random() * Math.PI * 2,
  });

  const populate = () => {
    stars.length = 0;
    for (let index = 0; index < starCount; index += 1) {
      stars.push(spawnStar());
    }
  };

  const draw = (timestamp) => {
    ctx.clearRect(0, 0, width, height);
    const t = timestamp * 0.001;

    for (const star of stars) {
      star.y += star.speed;
      star.x += star.drift;

      if (star.y > height + 4) {
        Object.assign(star, spawnStar(-6));
      }

      if (star.x < -4) {
        star.x = width + 4;
      }

      if (star.x > width + 4) {
        star.x = -4;
      }

      const twinkle = 0.55 + Math.sin(t * star.twinkleSpeed * 60 + star.phase) * 0.45;
      ctx.beginPath();
      ctx.fillStyle = `rgba(243, 232, 214, ${star.alpha * twinkle})`;
      ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      ctx.fill();
    }

    requestAnimationFrame(draw);
  };

  window.addEventListener("resize", () => {
    resize();
    populate();
  });

  resize();
  populate();
  requestAnimationFrame(draw);
}

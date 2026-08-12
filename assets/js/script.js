gsap.registerPlugin(ScrollTrigger);


// ──======================================= Smooth scroll (Lenis)======================================== ──
if (typeof Lenis !== 'undefined') {
  const lenis = new Lenis({
    duration: 1.4,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    direction: 'vertical',
    gestureDirection: 'vertical',
    smoothWheel: true,
    wheelMultiplier: 1.3,
    infinite: false,
  });

  if (typeof ScrollTrigger !== 'undefined') {
    lenis.on('scroll', ScrollTrigger.update);
  }

  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });

  gsap.ticker.lagSmoothing(0);
}


// Mobile and Desktop Header, Menu, Progress js all together

document.addEventListener("DOMContentLoaded", () => {
  const header = document.getElementById("main-header");
  const navWrap = document.getElementById("navPillWrap");
  const nav = document.getElementById("desktop-nav");
  const toggle = document.getElementById("mobile-menu-toggle");
  const menu = document.getElementById("mobile-menu");

  const desktopLogo = document.getElementById("desktop-logo");
  const desktopCta = document.getElementById("desktop-cta");
  const logoText = document.querySelector("#desktop-logo .logo-text");

  let ring = null;
  let lastScrollY = window.scrollY;
  let ticking = false;
  let resizeTimer;


  /* =========================================================
     GSAP / SCROLLTRIGGER
  ========================================================= */

  const hasGSAP =
    typeof gsap !== "undefined" &&
    typeof ScrollTrigger !== "undefined";

  if (hasGSAP) {
    gsap.registerPlugin(ScrollTrigger);
  }


  /* =========================================================
     DESKTOP LOGO + CTA VISIBILITY
  ========================================================= */

  function updateDesktopVisibility() {
    if (window.innerWidth < 1024) {
      showDesktopElements();
      return;
    }

    const currentScrollY = window.scrollY;

    // Show at top, hide on any downward scroll
    if (currentScrollY <= 20) {
      showDesktopElements();
    } else {
      hideDesktopElements();
    }

    lastScrollY = currentScrollY;
  }


  function showDesktopElements() {
    if (desktopLogo) {
      desktopLogo.style.opacity = "1";
      desktopLogo.style.visibility = "visible";
      desktopLogo.style.transform = "translateY(0)";
      desktopLogo.style.pointerEvents = "";
    }

    if (desktopCta) {
      desktopCta.style.opacity = "1";
      desktopCta.style.visibility = "visible";
      desktopCta.style.transform = "translateY(0)";
      desktopCta.style.pointerEvents = "";
    }
  }


  function hideDesktopElements() {
    if (desktopLogo) {
      desktopLogo.style.opacity = "0";
      desktopLogo.style.visibility = "hidden";
      desktopLogo.style.transform = "translateY(-10px)";
      desktopLogo.style.pointerEvents = "none";
    }

    if (desktopCta) {
      desktopCta.style.opacity = "0";
      desktopCta.style.visibility = "hidden";
      desktopCta.style.transform = "translateY(-10px)";
      desktopCta.style.pointerEvents = "none";
    }
  }


  /* =========================================================
     PROGRESS RING
  ========================================================= */

  function createRing() {
    if (!navWrap || !nav || window.innerWidth < 1024) {
      return;
    }

    const old = navWrap.querySelector(".progress-ring");
    if (old) {
      old.remove();
    }

    const { width, height } = nav.getBoundingClientRect();

    const stroke = 2;
    const radius = height / 2 - stroke / 2;

    const ns = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(ns, "svg");

    svg.classList.add("progress-ring");
    svg.setAttribute("viewBox", `0 0 ${width} ${height}`);

    svg.style.cssText = `
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      overflow: visible;
    `;


    /* =====================================================
       GRADIENT
    ===================================================== */

    const defs = document.createElementNS(ns, "defs");
    const gradient = document.createElementNS(ns, "linearGradient");

    gradient.setAttribute("id", "navGradient");
    gradient.setAttribute("x1", "100%");
    gradient.setAttribute("y1", "0%");
    gradient.setAttribute("x2", "0%");
    gradient.setAttribute("y2", "0%");

    const green = document.createElementNS(ns, "stop");
    green.setAttribute("offset", "14.71%");
    green.setAttribute("stop-color", "#108A00");

    const purple = document.createElementNS(ns, "stop");
    purple.setAttribute("offset", "85.29%");
    purple.setAttribute("stop-color", "#523EC5");

    gradient.appendChild(green);
    gradient.appendChild(purple);

    defs.appendChild(gradient);
    svg.appendChild(defs);


    /* =====================================================
       RING
    ===================================================== */

    ring = document.createElementNS(ns, "rect");

    const x = stroke / 2;
    const y = stroke / 2;

    const ringWidth = width - stroke;
    const ringHeight = height - stroke;

    ring.setAttribute("x", x);
    ring.setAttribute("y", y);
    ring.setAttribute("width", ringWidth);
    ring.setAttribute("height", ringHeight);

    ring.setAttribute("rx", radius);
    ring.setAttribute("ry", radius);

    ring.setAttribute("fill", "none");
    ring.setAttribute("stroke", "url(#navGradient)");
    ring.setAttribute("stroke-width", stroke);
    ring.setAttribute("stroke-linecap", "round");
    ring.setAttribute("stroke-linejoin", "round");

    const straightWidth = ringWidth - 2 * radius;
    const straightHeight = ringHeight - 2 * radius;

    const length =
      2 * straightWidth +
      2 * straightHeight +
      2 * Math.PI * radius;

    ring.style.strokeDasharray = length;
    ring.style.strokeDashoffset = length;

    svg.appendChild(ring);
    navWrap.appendChild(svg);

    updateProgress();
  }


  function updateProgress() {
    if (!ring) return;

    const scroll = window.scrollY;
    const maxScroll =
      document.documentElement.scrollHeight - window.innerHeight;

    if (maxScroll <= 0) return;

    const progress = Math.min(scroll / maxScroll, 1);
    const length = parseFloat(ring.style.strokeDasharray);

    ring.style.strokeDashoffset = length * (1 - progress);
  }


  /* =========================================================
     GSAP NAV + LOGO THEME
  ========================================================= */

  function initNavTheme() {
    if (!hasGSAP || !nav || window.innerWidth < 1024) return;

    const sections = document.querySelectorAll("[data-nav-theme]");
    if (!sections.length) return;

    ScrollTrigger.getAll().forEach((trigger) => {
      if (trigger.vars && trigger.vars.navThemeTrigger) {
        trigger.kill();
      }
    });

    gsap.set(nav.querySelectorAll(".nav-item"), { color: "#ffffff" });

    const arrow = nav.querySelector(".services-arrow");
    if (arrow) {
      gsap.set(arrow, { color: "#ffffff" });
    }

    if (logoText) {
      gsap.set(logoText, { color: "#ffffff" });
    }

    sections.forEach((section) => {
      const theme = section.dataset.navTheme;

      ScrollTrigger.create({
        trigger: section,
        start: "top 35%",
        end: "bottom 35%",
        navThemeTrigger: true,
        onEnter: () => changeNavTheme(theme),
        onEnterBack: () => changeNavTheme(theme)
      });
    });

    updateCurrentNavTheme();
  }


  /* =========================================================
     CHANGE NAV + LOGO THEME
  ========================================================= */

  function changeNavTheme(theme) {
    if (!hasGSAP || !nav || window.innerWidth < 1024) return;

    const navItems = nav.querySelectorAll(".nav-item");
    const arrow = nav.querySelector(".services-arrow");

    if (theme === "light") {
      gsap.to(navItems, {
        color: "#111111",
        duration: 0.35,
        ease: "power2.out",
        overwrite: true
      });

      if (arrow) {
        gsap.to(arrow, {
          color: "#111111",
          duration: 0.35,
          ease: "power2.out",
          overwrite: true
        });
      }

      if (logoText) {
        gsap.to(logoText, {
          color: "#111111",
          duration: 0.35,
          ease: "power2.out",
          overwrite: true
        });
      }

      const active = nav.querySelector(".nav-item.active");
      if (active) {
        gsap.to(active, {
          color: "#ffffff",
          duration: 0.35,
          ease: "power2.out",
          overwrite: true
        });
      }
    } else {
      gsap.to(navItems, {
        color: "#ffffff",
        duration: 0.35,
        ease: "power2.out",
        overwrite: true
      });

      if (arrow) {
        gsap.to(arrow, {
          color: "#ffffff",
          duration: 0.35,
          ease: "power2.out",
          overwrite: true
        });
      }

      if (logoText) {
        gsap.to(logoText, {
          color: "#ffffff",
          duration: 0.35,
          ease: "power2.out",
          overwrite: true
        });
      }
    }
  }


  /* =========================================================
     DETECT CURRENT SECTION
  ========================================================= */

  function updateCurrentNavTheme() {
    if (!hasGSAP || window.innerWidth < 1024) return;

    const sections = document.querySelectorAll("[data-nav-theme]");
    if (!sections.length) return;

    const navPosition = window.innerHeight * 0.35;
    let currentSection = null;

    sections.forEach((section) => {
      const rect = section.getBoundingClientRect();
      if (rect.top <= navPosition && rect.bottom >= navPosition) {
        currentSection = section;
      }
    });

    if (currentSection) {
      changeNavTheme(currentSection.dataset.navTheme);
    }
  }


  /* =========================================================
     SCROLL HANDLER
  ========================================================= */

  function handleScroll() {
    const scroll = window.scrollY;

    if (window.innerWidth < 1024) {
      if (header) {
        header.classList.toggle("mobile-scrolled", scroll > 20);
      }
      showDesktopElements();
      lastScrollY = scroll;
      return;
    }

    updateProgress();
    updateDesktopVisibility();
  }


  /* =========================================================
     MOBILE MENU
  ========================================================= */

  if (toggle && menu) {
    toggle.addEventListener("click", () => {
      const open = menu.classList.toggle("is-open");
      toggle.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", String(open));
      document.body.classList.toggle("menu-open", open);
    });

    menu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        menu.classList.remove("is-open");
        toggle.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
        document.body.classList.remove("menu-open");
      });
    });
  }


  /* =========================================================
     ESCAPE CLOSES MOBILE MENU
  ========================================================= */

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && toggle && menu) {
      menu.classList.remove("is-open");
      toggle.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
      document.body.classList.remove("menu-open");
    }
  });


  /* =========================================================
     SCROLL LISTENER
  ========================================================= */

  window.addEventListener(
    "scroll",
    () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    },
    { passive: true }
  );


  /* =========================================================
     RESIZE LISTENER
  ========================================================= */

  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);

    resizeTimer = setTimeout(() => {
      if (window.innerWidth >= 1024) {
        createRing();
        updateDesktopVisibility();
        initNavTheme();

        if (hasGSAP) {
          ScrollTrigger.refresh();
        }
      } else {
        showDesktopElements();
      }

      lastScrollY = window.scrollY;
    }, 150);
  });


  /* =========================================================
     INITIAL SETUP
  ========================================================= */

  createRing();
  handleScroll();
  initNavTheme();
});


// All H1,H2 reveal JS
document.addEventListener("DOMContentLoaded", () => {

  if (
    typeof gsap === "undefined" ||
    typeof ScrollTrigger === "undefined" ||
    typeof SplitText === "undefined"
  ) {
    console.warn(
      "GSAP, ScrollTrigger or SplitText is not loaded."
    );

    return;
  }


  gsap.registerPlugin(
    ScrollTrigger,
    SplitText
  );


  /* =========================================================
     HEADING MASK REVEAL
  ========================================================= */

  const headings =
    document.querySelectorAll("h1, h2, h3");


  headings.forEach((heading) => {

    /*
     * Prevent duplicate initialization
     */

    if (
      heading.dataset.splitReveal === "true"
    ) {
      return;
    }

    heading.dataset.splitReveal = "true";


    /*
     * Add class
     */

    heading.classList.add(
      "split-heading"
    );


    /*
     * Split heading into lines
     */

    const split = new SplitText(
      heading,
      {
        type: "lines",
        linesClass: "line"
      }
    );


    /*
     * Create inner wrapper for
     * the actual mask animation.
     */

    split.lines.forEach((line) => {

      const inner =
        document.createElement("div");

      inner.className =
        "line-inner";


      while (line.firstChild) {

        inner.appendChild(
          line.firstChild
        );

      }


      line.appendChild(inner);

    });


    /*
     * Initial position
     */

    const lines =
      heading.querySelectorAll(
        ".line-inner"
      );


    gsap.set(
      lines,
      {
        yPercent: 110
      }
    );


    /*
     * Scroll reveal
     */

    gsap.to(
      lines,
      {
        yPercent: 0,

        duration: 1,

        stagger: 0.12,

        ease: "power4.out",

        scrollTrigger: {

          trigger: heading,

          start: "top 82%",

          once: true

        }
      }
    );

  });


  /*
   * Refresh after SplitText changes
   * the heading dimensions.
   */

  ScrollTrigger.refresh();

});

// Image Parallax 
gsap.utils.toArray(".parallax img:not(.no-parallax)").forEach(img => {

  gsap.fromTo(img,
    { y: "-10%" },
    {
      y: "10%",
      ease: "none",
      scrollTrigger: {
        trigger: img.closest(".parallax"),
        start: "top bottom",
        end: "bottom top",
        scrub: 1.5
      }
    }
  );

});

// Hero section content animations
document.addEventListener("DOMContentLoaded", () => {
  const heroSection = document.getElementById("hero-section");
  const watermarkText = document.getElementById("watermark-text");
  const personCutout = document.getElementById("person-cutout");

  // Safety check: Exit early if GSAP, ScrollTrigger, or any hero element is missing
  if (
    typeof gsap === "undefined" ||
    typeof ScrollTrigger === "undefined" ||
    !heroSection ||
    !watermarkText ||
    !personCutout
  ) {
    return;
  }

  const heroTimeline = gsap.timeline({
    paused: true
  });

  heroTimeline
    .fromTo(
      watermarkText,
      {
        y: "-120%",
        opacity: 0
      },
      {
        y: "0%",
        opacity: 1,
        duration: 1.5,
        ease: "power4.out"
      }
    )
    .fromTo(
      personCutout,
      {
        y: "110%",
        opacity: 0
      },
      {
        y: "0%",
        opacity: 1,
        duration: 1.6,
        ease: "power4.out"
      },
      "-=1.15"
    );

  ScrollTrigger.create({
    trigger: heroSection,

    // Trigger when entering viewport
    start: "top 80%",

    // Trigger again when entering from below
    onEnter: () => {
      heroTimeline.restart();
    },

    onEnterBack: () => {
      heroTimeline.restart();
    }
  });
});


// Magnetic pull common cta button
// document.addEventListener("DOMContentLoaded", () => {
//   const magneticButtons = document.querySelectorAll(".common-cta-btn");

//   magneticButtons.forEach((button) => {
//     const xTo = gsap.quickTo(button, "x", {
//       duration: 0.4,
//       ease: "power3.out",
//     });

//     const yTo = gsap.quickTo(button, "y", {
//       duration: 0.4,
//       ease: "power3.out",
//     });

//     button.addEventListener("mousemove", (e) => {
//       const rect = button.getBoundingClientRect();

//       const x =
//         e.clientX - (rect.left + rect.width / 2);

//       const y =
//         e.clientY - (rect.top + rect.height / 2);

//       const strength = 0.08;

//       xTo(x * strength);
//       yTo(y * strength - 5);
//     });

//     button.addEventListener("mouseleave", () => {
//       gsap.to(button, {
//         x: 0,
//         y: 0,
//         duration: 0.6,
//         ease: "elastic.out(1, 0.5)",
//       });
//     });
//   });
// });



// Marquee section js
document.addEventListener("DOMContentLoaded", function () {
  const marqueeElement = document.querySelector("#marquee-splide");

  if (marqueeElement) {
    const splide = new Splide(marqueeElement, {
      type: "loop",
      drag: "free",
      focus: "center",
      arrows: false,
      pagination: false,

      // Show 6 items on large screens
      perPage: 6,
      perMove: 1,

      gap: "24px",

      autoScroll: {
        speed: 1,
        pauseOnHover: false,
        pauseOnFocus: false,
      },

      breakpoints: {
        // Tablet
        1023: {
          perPage: 4,
          gap: "20px",
        },

        // Mobile
        767: {
          perPage: 3,
          gap: "12px",
        },
        // Mobile
        500: {
          perPage: 2,
          gap: "5px",
        },
      },
    });

    splide.mount(window.splide.Extensions);
  }
});

// Testimonial slider js
document.addEventListener("DOMContentLoaded", function () {
  const testimonialElement = document.querySelector("#testimonial-slider");

  if (testimonialElement) {
    new Splide(testimonialElement, {
      type: "loop",

      perPage: 3,
      perMove: 1,
      gap: "24px",

      arrows: false,
      pagination: true,

      drag: true,
      pauseOnHover: true,
      pauseOnFocus: true,

      autoScroll: {
        speed: 1,
        pauseOnHover: true,
        pauseOnFocus: true,
      },

      breakpoints: {
        1023: {
          perPage: 2,
          gap: "20px",
        },

        767: {
          perPage: 1,
          gap: "16px",

          // Stop auto-scroll on mobile
          autoScroll: false,
        },
      },
    }).mount(window.splide.Extensions);
  }
});


// Statistic counter JS
document.addEventListener('DOMContentLoaded', () => {
  const counters = document.querySelectorAll('.counter');

  function formatNum(n, format) {
    return format === 'comma' ? n.toLocaleString() : n;
  }

  function animateCounter(el) {
    const target = parseInt(el.dataset.target, 10);
    if (isNaN(target)) return;

    const suffix = el.dataset.suffix || '';
    const prefix = el.dataset.prefix || '';
    const format = el.dataset.format || '';
    const duration = 1800; // Total time in ms
    let startTime = null;

    function step(currentTime) {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      
      // Easing function (easeOutExpo for smooth slowing down at the end)
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const currentVal = Math.round(easeProgress * target);

      el.textContent = prefix + formatNum(currentVal, format) + suffix;

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    }

    requestAnimationFrame(step);
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;

      const el = entry.target;
      if (el.dataset.animated === 'true') return;

      el.dataset.animated = 'true';
      animateCounter(el);
      observer.unobserve(el);
    });
  }, {
    threshold: 0.3
  });

  counters.forEach(counter => observer.observe(counter));
});





// CTA button animation

document.addEventListener("DOMContentLoaded", () => {

    const buttons = document.querySelectorAll("#cta-button");

    if (!buttons.length) return;

    buttons.forEach((btn) => {

        const leftSeg = btn.querySelector("#cta-left");
        const join = btn.querySelector("#cta-join");
        const rightSeg = btn.querySelector("#cta-right");
        const blend = btn.querySelector("#cta-blend");

        if (!leftSeg || !join || !rightSeg || !blend) return;

        const hoverTl = gsap.timeline({
            paused: true,
            defaults: {
                ease: "power3.inOut"
            }
        });

        hoverTl

            // Move right section LEFT
            .to(rightSeg, {
                x: -3,
                paddingLeft: "12px",
                paddingRight: "2px",
                duration: 0.34,
                ease: "power2.inOut"
            }, 0)

            // Hide center joint
            .to(join, {
                opacity: 0,
                scaleX: 0.15,
                duration: 0.12,
                ease: "power2.out"
            }, 0)

            // Flatten inner corners
            .to(leftSeg, {
                borderTopRightRadius: 0,
                borderBottomRightRadius: 0,
                duration: 0.12,
                ease: "power2.inOut"
            }, 0)

            .to(rightSeg, {
                borderTopLeftRadius: 0,
                borderBottomLeftRadius: 0,
                duration: 0.12,
                ease: "power2.inOut"
            }, 0)

            // Gradient fades in
            .to(blend, {
                opacity: 1,
                duration: 0.20,
                ease: "power2.out"
            }, 0)

            // Fade purple away
            .to(leftSeg, {
                backgroundColor: "rgba(82, 62, 197, 0)",
                duration: 0.20,
                ease: "power2.inOut"
            }, 0.02)

            // Fade green away
            .to(rightSeg, {
                backgroundColor: "rgba(16, 138, 0, 0)",
                duration: 0.20,
                ease: "power2.inOut"
            }, 0.02)

            // Brightness comes in last
            .to(blend, {
                filter: "brightness(1.10)",
                duration: 0.15,
                ease: "power2.out"
            }, 0.04);

        // Hover IN
        btn.addEventListener("mouseenter", () => {
            hoverTl.play();
        });

        // Hover OUT
        btn.addEventListener("mouseleave", () => {
            hoverTl.reverse();
        });

    });

});




//  Project showcase cursor pointer
document.addEventListener("DOMContentLoaded", () => {
  const cards = document.querySelectorAll(".project-card");

  cards.forEach((card) => {
    const cursor = card.querySelector(".custom-cursor");
    if (!cursor) return;

    // Smooth physics configuration (0.7s duration for smooth trailing)
    const xTo = gsap.quickTo(cursor, "x", { duration: 0.7, ease: "power2.out" });
    const yTo = gsap.quickTo(cursor, "y", { duration: 0.7, ease: "power2.out" });

    let prevX = 0;

    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();

      // Center badge on mouse position relative to card boundaries
      const mouseX = e.clientX - rect.left - cursor.offsetWidth / 2;
      const mouseY = e.clientY - rect.top - cursor.offsetHeight / 2;

      xTo(mouseX);
      yTo(mouseY);

      // Dynamic tilt during movement
      const deltaX = e.clientX - prevX;
      const tilt = Math.min(Math.max(deltaX * 0.15, -12), 12);
      gsap.to(cursor, { rotation: -6 + tilt, duration: 0.4, ease: "power1.out" });

      prevX = e.clientX;
    });

    // Reveal badge on enter
    card.addEventListener("mouseenter", () => {
      gsap.to(cursor, {
        opacity: 1,
        scale: 1,
        duration: 0.4,
        ease: "back.out(1.5)",
      });
    });

    // Hide badge on leave
    card.addEventListener("mouseleave", () => {
      gsap.to(cursor, {
        opacity: 0,
        scale: 0.4,
        duration: 0.3,
        ease: "power2.in",
      });
    });
  });
});


// Work page Filter logic
document.addEventListener('DOMContentLoaded', () => {
    const ITEMS_PER_PAGE = 5;
    let currentPage = 1;
    let filteredCards = [];

    const filterBtns = document.querySelectorAll('.filter-btn');
    const allCards = Array.from(document.querySelectorAll('.project-card'));
    const noResultsState = document.getElementById('no-results-state');
    const selectedCatText = document.getElementById('selected-category-name');
    const paginationWrapper = document.getElementById('pagination-wrapper');
    const paginationNumbers = document.getElementById('pagination-numbers');
    const prevBtn = document.getElementById('prev-page');
    const nextBtn = document.getElementById('next-page');

    // 🛑 EXIT EARLY: If this page doesn't have work filter cards or controls, do nothing
    if (allCards.length === 0 && filterBtns.length === 0) {
      return;
    }

    function updateDisplay() {
      // Hide all cards initially
      allCards.forEach(card => card.style.display = 'none');

      if (filteredCards.length === 0) {
        // Show empty "No items found" state
        if (noResultsState) noResultsState.classList.remove('hidden');
        if (paginationWrapper) paginationWrapper.classList.add('hidden');
      } else {
        // Hide empty state and show pagination
        if (noResultsState) noResultsState.classList.add('hidden');
        if (paginationWrapper) paginationWrapper.classList.remove('hidden');

        // Calculate slice for 5 items per page
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        const cardsToDisplay = filteredCards.slice(startIndex, endIndex);

        cardsToDisplay.forEach(card => {
          card.style.display = 'grid';
        });

        renderPaginationControls();
      }
    }

    function renderPaginationControls() {
      if (!paginationWrapper || !paginationNumbers) return;

      const totalPages = Math.ceil(filteredCards.length / ITEMS_PER_PAGE);

      // Hide entire pagination bar if 1 page or less
      if (totalPages <= 1) {
        paginationWrapper.classList.add('hidden');
        return;
      }

      paginationWrapper.classList.remove('hidden');
      paginationNumbers.innerHTML = '';

      for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement('button');
        btn.innerText = i;
        btn.className = `page-num flex h-10 w-10 items-center justify-center rounded-full transition-colors ${
          i === currentPage
            ? 'bg-[#523EC5] text-white'
            : 'bg-white text-[#555555] border border-[#D8D8D8] hover:border-[#523EC5] hover:text-[#523EC5]'
        }`;

        btn.addEventListener('click', () => {
          currentPage = i;
          updateDisplay();
        });

        paginationNumbers.appendChild(btn);
      }

      // Update Prev/Next disabled states safely
      if (prevBtn) prevBtn.disabled = currentPage === 1;
      if (nextBtn) nextBtn.disabled = currentPage === totalPages;
    }

    // --- FILTER TAB CLICK HANDLER ---
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => {
          b.classList.remove('bg-[#523EC5]', 'text-white', 'active');
          b.classList.add('bg-[#EAE8F7]', 'text-[#555555]');
        });

        btn.classList.add('bg-[#523EC5]', 'text-white', 'active');
        btn.classList.remove('bg-[#EAE8F7]', 'text-[#555555]');

        const filterValue = btn.getAttribute('data-filter');
        const filterLabel = btn.innerText.trim();

        // Update empty state text with category name
        if (selectedCatText) {
          selectedCatText.textContent = `"${filterLabel}"`;
        }

        // Filter projects
        if (filterValue === 'all') {
          filteredCards = [...allCards];
        } else {
          filteredCards = allCards.filter(card => card.getAttribute('data-category') === filterValue);
        }

        currentPage = 1; // Reset to first page
        updateDisplay();
      });
    });

    // --- PREV / NEXT BUTTON HANDLERS ---
    prevBtn?.addEventListener('click', () => {
      if (currentPage > 1) {
        currentPage--;
        updateDisplay();
      }
    });

    nextBtn?.addEventListener('click', () => {
      const totalPages = Math.ceil(filteredCards.length / ITEMS_PER_PAGE);
      if (currentPage < totalPages) {
        currentPage++;
        updateDisplay();
      }
    });

    // Initial setup on page load
    filteredCards = [...allCards];
    updateDisplay();
});


// About page - principle stager effect
document.addEventListener("DOMContentLoaded", () => {
  gsap.registerPlugin(ScrollTrigger);

  gsap.from(".principle-card", {
    scrollTrigger: {
      trigger: ".principle-card-container",
      start: "top 80%",
      toggleActions: "play none none none",
      once: true
    },

    opacity: 0,
    y: 60,

    duration: 1.2,
    delay: 0.2,
    ease: "power3.out",

    stagger: 0.35
  });
});

// Home page - Process number stagger
document.addEventListener("DOMContentLoaded", () => {
  // Register GSAP ScrollTrigger plugin
  gsap.registerPlugin(ScrollTrigger);

  // Stagger animation ONLY for the process number SVGs
  gsap.from(".process-number", {
    scrollTrigger: {
      trigger: ".process-card-container", // Triggers when the card container enters the viewport
      start: "top 80%",
      toggleActions: "play none none none",
      once: true
    },
    opacity: 0,
    y: 40,            // Slides up smoothly into position
    scale: 0.8,       // Starts slightly smaller for a polished feel
    duration: 1.0,
    delay: 0.2,
    ease: "power3.out",
    stagger: 0.25     // Staggers each number step-by-step
  });
});

// Upwork profile hire btn
document.addEventListener("DOMContentLoaded", () => {
  gsap.registerPlugin(Flip);

  const hireBtn = document.querySelector(".profile-hire-btn");
  const upworkIcon = hireBtn?.querySelector(".upwork-icon");

  if (!hireBtn || !upworkIcon) return;

  hireBtn.addEventListener("mouseenter", () => {
    const state = Flip.getState([hireBtn, upworkIcon]);

    hireBtn.prepend(upworkIcon);

    gsap.set(hireBtn, {
      paddingLeft: "6px",
      paddingRight: "36px"
    });

    Flip.from(state, {
      duration: 0.75,
      ease: "power2.out",
      scale: true,
      nested: true
    });
  });

  hireBtn.addEventListener("mouseleave", () => {
    const state = Flip.getState([hireBtn, upworkIcon]);

    hireBtn.appendChild(upworkIcon);

    gsap.set(hireBtn, {
      paddingLeft: "36px",
      paddingRight: "6px"
    });

    Flip.from(state, {
      duration: 0.32,
      ease: "power2.out",
      scale: true,
      nested: true
    });
  });
});
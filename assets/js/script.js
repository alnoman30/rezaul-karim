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
    const scrollDifference = currentScrollY - lastScrollY;

    // Always show at the very top
    if (currentScrollY <= 20) {
      showDesktopElements();
    }

    // Scrolling down
    else if (scrollDifference > 0) {
      hideDesktopElements();
    }

    // Scrolling up
    else if (scrollDifference < 0) {
      showDesktopElements();
    }

    lastScrollY = currentScrollY;
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


  /* =========================================================
     PROGRESS RING
  ========================================================= */

  function createRing() {

    if (
      !navWrap ||
      !nav ||
      window.innerWidth < 1024
    ) {
      return;
    }

    const old = navWrap.querySelector(".progress-ring");

    if (old) {
      old.remove();
    }

    const {
      width,
      height
    } = nav.getBoundingClientRect();

    const stroke = 2;
    const radius = height / 2 - stroke / 2;

    const ns = "http://www.w3.org/2000/svg";

    const svg = document.createElementNS(ns, "svg");

    svg.classList.add("progress-ring");

    svg.setAttribute(
      "viewBox",
      `0 0 ${width} ${height}`
    );

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

    const defs =
      document.createElementNS(ns, "defs");

    const gradient =
      document.createElementNS(
        ns,
        "linearGradient"
      );

    gradient.setAttribute(
      "id",
      "navGradient"
    );

    gradient.setAttribute(
      "x1",
      "100%"
    );

    gradient.setAttribute(
      "y1",
      "0%"
    );

    gradient.setAttribute(
      "x2",
      "0%"
    );

    gradient.setAttribute(
      "y2",
      "0%"
    );


    const green =
      document.createElementNS(
        ns,
        "stop"
      );

    green.setAttribute(
      "offset",
      "14.71%"
    );

    green.setAttribute(
      "stop-color",
      "#108A00"
    );


    const purple =
      document.createElementNS(
        ns,
        "stop"
      );

    purple.setAttribute(
      "offset",
      "85.29%"
    );

    purple.setAttribute(
      "stop-color",
      "#523EC5"
    );


    gradient.appendChild(green);
    gradient.appendChild(purple);

    defs.appendChild(gradient);
    svg.appendChild(defs);


    /* =====================================================
       RING
    ===================================================== */

    ring =
      document.createElementNS(
        ns,
        "rect"
      );

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

    ring.setAttribute(
      "stroke",
      "url(#navGradient)"
    );

    ring.setAttribute(
      "stroke-width",
      stroke
    );

    ring.setAttribute(
      "stroke-linecap",
      "round"
    );

    ring.setAttribute(
      "stroke-linejoin",
      "round"
    );


    const straightWidth =
      ringWidth - 2 * radius;

    const straightHeight =
      ringHeight - 2 * radius;

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

    if (!ring) {
      return;
    }

    const scroll = window.scrollY;

    const maxScroll =
      document.documentElement.scrollHeight -
      window.innerHeight;

    if (maxScroll <= 0) {
      return;
    }

    const progress =
      Math.min(
        scroll / maxScroll,
        1
      );

    const length =
      parseFloat(
        ring.style.strokeDasharray
      );

    ring.style.strokeDashoffset =
      length * (1 - progress);
  }


  /* =========================================================
     GSAP NAV + LOGO THEME
  ========================================================= */

  function initNavTheme() {

    if (
      !hasGSAP ||
      !nav ||
      window.innerWidth < 1024
    ) {
      return;
    }

    const sections =
      document.querySelectorAll(
        "[data-nav-theme]"
      );

    if (!sections.length) {
      return;
    }


    /*
     * Remove previous theme triggers
     */

    ScrollTrigger.getAll().forEach(
      (trigger) => {

        if (
          trigger.vars &&
          trigger.vars.navThemeTrigger
        ) {
          trigger.kill();
        }

      }
    );


    /*
     * Initial colors
     */

    gsap.set(
      nav.querySelectorAll(".nav-item"),
      {
        color: "#ffffff"
      }
    );


    const arrow =
      nav.querySelector(
        ".services-arrow"
      );

    if (arrow) {

      gsap.set(
        arrow,
        {
          color: "#ffffff"
        }
      );

    }


    if (logoText) {

      gsap.set(
        logoText,
        {
          color: "#ffffff"
        }
      );

    }


    /*
     * Create ScrollTrigger
     */

    sections.forEach(
      (section) => {

        const theme =
          section.dataset.navTheme;

        ScrollTrigger.create({

          trigger: section,

          start: "top 35%",
          end: "bottom 35%",

          navThemeTrigger: true,

          onEnter: () => {
            changeNavTheme(theme);
          },

          onEnterBack: () => {
            changeNavTheme(theme);
          }

        });

      }
    );


    updateCurrentNavTheme();
  }


  /* =========================================================
     CHANGE NAV + LOGO THEME
  ========================================================= */

  function changeNavTheme(theme) {

    if (
      !hasGSAP ||
      !nav ||
      window.innerWidth < 1024
    ) {
      return;
    }

    const navItems =
      nav.querySelectorAll(
        ".nav-item"
      );

    const arrow =
      nav.querySelector(
        ".services-arrow"
      );


    /* =====================================================
       LIGHT SECTION
    ===================================================== */

    if (theme === "light") {

      // Nav links
      gsap.to(
        navItems,
        {
          color: "#111111",
          duration: 0.35,
          ease: "power2.out",
          overwrite: true
        }
      );


      // Services arrow
      if (arrow) {

        gsap.to(
          arrow,
          {
            color: "#111111",
            duration: 0.35,
            ease: "power2.out",
            overwrite: true
          }
        );

      }


      // Logo
      if (logoText) {

        gsap.to(
          logoText,
          {
            color: "#111111",
            duration: 0.35,
            ease: "power2.out",
            overwrite: true
          }
        );

      }


      // Active item remains white
      const active =
        nav.querySelector(
          ".nav-item.active"
        );

      if (active) {

        gsap.to(
          active,
          {
            color: "#ffffff",
            duration: 0.35,
            ease: "power2.out",
            overwrite: true
          }
        );

      }

    }


    /* =====================================================
       DARK SECTION
    ===================================================== */

    else {

      // Nav links
      gsap.to(
        navItems,
        {
          color: "#ffffff",
          duration: 0.35,
          ease: "power2.out",
          overwrite: true
        }
      );


      // Services arrow
      if (arrow) {

        gsap.to(
          arrow,
          {
            color: "#ffffff",
            duration: 0.35,
            ease: "power2.out",
            overwrite: true
          }
        );

      }


      // Logo
      if (logoText) {

        gsap.to(
          logoText,
          {
            color: "#ffffff",
            duration: 0.35,
            ease: "power2.out",
            overwrite: true
          }
        );

      }

    }
  }


  /* =========================================================
     DETECT CURRENT SECTION
  ========================================================= */

  function updateCurrentNavTheme() {

    if (
      !hasGSAP ||
      window.innerWidth < 1024
    ) {
      return;
    }

    const sections =
      document.querySelectorAll(
        "[data-nav-theme]"
      );

    if (!sections.length) {
      return;
    }

    const navPosition =
      window.innerHeight * 0.35;

    let currentSection = null;


    sections.forEach(
      (section) => {

        const rect =
          section.getBoundingClientRect();

        if (
          rect.top <= navPosition &&
          rect.bottom >= navPosition
        ) {

          currentSection = section;

        }

      }
    );


    if (currentSection) {

      changeNavTheme(
        currentSection.dataset.navTheme
      );

    }
  }


  /* =========================================================
     SCROLL HANDLER
  ========================================================= */

  function handleScroll() {

    const scroll = window.scrollY;


    if (window.innerWidth < 1024) {

      if (header) {

        header.classList.toggle(
          "mobile-scrolled",
          scroll > 20
        );

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

    toggle.addEventListener(
      "click",
      () => {

        const open =
          menu.classList.toggle(
            "is-open"
          );

        toggle.classList.toggle(
          "is-open",
          open
        );

        toggle.setAttribute(
          "aria-expanded",
          String(open)
        );

        document.body.classList.toggle(
          "menu-open",
          open
        );

      }
    );


    /*
     * Close menu after clicking a link
     */

    menu
      .querySelectorAll("a")
      .forEach(
        (link) => {

          link.addEventListener(
            "click",
            () => {

              menu.classList.remove(
                "is-open"
              );

              toggle.classList.remove(
                "is-open"
              );

              toggle.setAttribute(
                "aria-expanded",
                "false"
              );

              document.body.classList.remove(
                "menu-open"
              );

            }
          );

        }
      );
  }


  /* =========================================================
     ESCAPE CLOSES MOBILE MENU
  ========================================================= */

  document.addEventListener(
    "keydown",
    (event) => {

      if (
        event.key === "Escape" &&
        toggle &&
        menu
      ) {

        menu.classList.remove(
          "is-open"
        );

        toggle.classList.remove(
          "is-open"
        );

        toggle.setAttribute(
          "aria-expanded",
          "false"
        );

        document.body.classList.remove(
          "menu-open"
        );

      }

    }
  );


  /* =========================================================
     SCROLL LISTENER
  ========================================================= */

  window.addEventListener(
    "scroll",
    () => {

      if (!ticking) {

        window.requestAnimationFrame(
          () => {

            handleScroll();

            ticking = false;

          }
        );

        ticking = true;
      }

    },
    {
      passive: true
    }
  );


  /* =========================================================
     RESIZE LISTENER
  ========================================================= */

  window.addEventListener(
    "resize",
    () => {

      clearTimeout(
        resizeTimer
      );

      resizeTimer =
        setTimeout(
          () => {

            if (
              window.innerWidth >= 1024
            ) {

              createRing();

              updateDesktopVisibility();

              initNavTheme();

              if (hasGSAP) {
                ScrollTrigger.refresh();
              }

            } else {

              showDesktopElements();

            }

            lastScrollY =
              window.scrollY;

          },
          150
        );

    }
  );


  /* =========================================================
     SMOOTH LOGO + CTA VISIBILITY
  ========================================================= */

  if (desktopLogo) {

    desktopLogo.style.transition =
      "opacity 0.25s ease, visibility 0.25s ease, transform 0.25s ease";
  }


  if (desktopCta) {

    desktopCta.style.transition =
      "opacity 0.25s ease, visibility 0.25s ease, transform 0.25s ease";
  }


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

const heroSection = document.getElementById("hero-section");
const watermarkText = document.getElementById("watermark-text");
const personCutout = document.getElementById("person-cutout");

if (heroSection && watermarkText && personCutout) {

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
}


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
  const splide = new Splide("#marquee-splide", {
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
});


//  statistic counter js
document.addEventListener('DOMContentLoaded', () => {

  const counters = document.querySelectorAll('.counter');

  function formatNum(n, format) {
    return format === 'comma'
      ? n.toLocaleString()
      : n;
  }

  const observer = new IntersectionObserver((entries) => {

    entries.forEach(entry => {

      if (!entry.isIntersecting) return;

      const el = entry.target;

      if (el.dataset.animated === 'true') return;

      el.dataset.animated = 'true';

      const target = parseInt(el.dataset.target);
      const suffix = el.dataset.suffix || '';
      const prefix = el.dataset.prefix || '';
      const format = el.dataset.format || '';

      const duration = 1800;
      const steps = 60;
      const increment = target / steps;
      const interval = duration / steps;

      let current = 0;

      const timer = setInterval(() => {

        current += increment;

        if (current >= target) {
          current = target;
          clearInterval(timer);
        }

        el.textContent =
          prefix +
          formatNum(Math.round(current), format) +
          suffix;

      }, interval);

      observer.unobserve(el);

    });

  }, {
    threshold: 0.5
  });

  counters.forEach(counter => {
    observer.observe(counter);
  });

});


// Testimonial slider js
document.addEventListener("DOMContentLoaded", function () {
  new Splide("#testimonial-slider", {
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
});

//
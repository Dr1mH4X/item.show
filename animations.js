/**
 * animations.js
 * Encapsulates all anime.js animation logic for the application.
 */

const AppAnimations = {
  /**
   * Animates the empty state message fading in.
   * @param {string|Element} target - The empty state element selector or node.
   */
  fadeInEmptyState: (target) => {
    anime.animate(target, {
      opacity: [0, 1],
      duration: 600,
      easing: "cubicBezier(0.25, 0.8, 0.25, 1)",
    });
  },

  /**
   * Animates the entry of item cards with a stagger effect.
   * @param {string|NodeList|Array} targets - The item cards to animate.
   */
  animateItemCardsEntry: (targets) => {
    anime.animate(targets, {
      translateY: [40, 0],
      opacity: [0, 1],
      delay: anime.stagger(40),
      easing: "spring(1, 80, 12, 0)",
    });
  },

  /**
   * Animates the removal of old items before re-rendering.
   * @param {string|NodeList|Array} targets - The items to remove.
   * @param {Function} onComplete - Callback function to run after animation.
   */
  animateOldItemsExit: (targets, onComplete) => {
    anime.animate(targets, {
      opacity: 0,
      scale: 0.9,
      duration: 300,
      easing: "cubicBezier(0.5, 0, 0.75, 0)",
      onComplete: onComplete,
    });
  },

  /**
   * Animates a numerical counter.
   * @param {Object} options - Configuration object.
   * @param {number} options.from - Start value (usually 0).
   * @param {number} options.to - End value.
   * @param {Function} options.onUpdate - Callback receiving the current value.
   * @param {Function} options.onComplete - Callback running when finished.
   * @param {boolean} [options.round=false] - Whether to round values during animation.
   */
  animateCounter: ({ from = 0, to, onUpdate, onComplete, round = false }) => {
    const valObj = { num: from };
    anime.animate(valObj, {
      num: to,
      easing: "spring(1, 80, 10, 0)",
      round: round ? 1 : 0,
      onUpdate: () => {
        if (onUpdate) onUpdate(valObj.num);
      },
      onComplete: () => {
        if (onComplete) onComplete();
      },
    });
  },

  /**
   * Animates the navigation pill to a specific button.
   * @param {Element} bgElement - The pill background element.
   * @param {Element} targetBtn - The button to move to.
   * @param {Element} container - The container element (for relative positioning).
   */
  animatePillMove: (bgElement, targetBtn, container) => {
    anime.set(bgElement, { opacity: 1 });
    const containerRect = container.getBoundingClientRect();
    const btnRect = targetBtn.getBoundingClientRect();

    anime.animate(bgElement, {
      left: btnRect.left - containerRect.left,
      width: btnRect.width,
      easing: "spring(1, 80, 8, 0)",
    });
  },

  /**
   * Initializes and runs the background shape animations.
   * @param {string} containerId - The ID of the background container.
   */
  initBackground: (containerId) => {
    const bgContainer = document.getElementById(containerId);
    if (!bgContainer) return;

    const numberOfShapes = 15;
    const colors = ["#3498db", "#9b59b6", "#2ecc71", "#f1c40f"];

    for (let i = 0; i < numberOfShapes; i++) {
      const shape = document.createElement("div");
      shape.classList.add("bg-shape");

      const size = Math.random() * 100 + 50;
      shape.style.width = `${size}px`;
      shape.style.height = `${size}px`;
      shape.style.left = `${Math.random() * 100}%`;
      shape.style.top = `${Math.random() * 100}%`;
      shape.style.background =
        colors[Math.floor(Math.random() * colors.length)];

      bgContainer.appendChild(shape);

      anime.animate(shape, {
        translateX: () => anime.random(-200, 200),
        translateY: () => anime.random(-200, 200),
        scale: () => anime.random(0.5, 1.5),
        opacity: [0.05, 0.2],
        duration: () => anime.random(10000, 20000),
        delay: () => anime.random(0, 5000),
        direction: "alternate",
        loop: true,
        easing: "easeInOutSine",
      });
    }
  },

  /**
   * Animates a button press effect (scale down and up).
   * @param {Element} btn - The button element.
   */
  animateButtonPress: (btn) => {
    anime.animate(btn, {
      scale: [
        { value: 0.92, duration: 150, easing: "easeOutCubic" },
        { value: 1, duration: 600, easing: "spring(1, 60, 10, 0)" },
      ],
    });
  },

  /**
   * Initializes button press effects for the entire document.
   */
  initButtonEffects: () => {
    document.addEventListener("click", (e) => {
      const btn = e.target.closest("button");
      if (btn) {
        AppAnimations.animateButtonPress(btn);
      }
    });
  },

  /**
   * Animates the dashboard statistics counters.
   * @param {number} totalValue - Total asset value.
   * @param {number} totalItems - Total number of items.
   * @param {number} avgDailyCost - Average daily cost.
   */
  animateDashboardStats: (totalValue, totalItems, avgDailyCost) => {
    const totalValueElement = document.getElementById("totalValue");
    const totalItemsElement = document.getElementById("totalItems");
    const avgDailyCostElement = document.getElementById("avgDailyCost");

    if (!totalValueElement || !totalItemsElement || !avgDailyCostElement)
      return;

    // Reset text content
    totalValueElement.textContent = "¥0";
    totalItemsElement.textContent = "0";
    avgDailyCostElement.textContent = "¥0.00";

    // Animate total value
    AppAnimations.animateCounter({
      to: totalValue,
      onUpdate: (val) => {
        totalValueElement.textContent = `¥${Math.round(val).toLocaleString()}`;
      },
      onComplete: () => {
        totalValueElement.textContent = `¥${totalValue.toLocaleString()}`;
      },
    });

    // Animate total items
    AppAnimations.animateCounter({
      to: totalItems,
      round: true,
      onUpdate: (val) => {
        totalItemsElement.textContent = Math.round(val);
      },
      onComplete: () => {
        totalItemsElement.textContent = totalItems;
      },
    });

    // Animate average daily cost
    AppAnimations.animateCounter({
      to: avgDailyCost,
      onUpdate: (val) => {
        avgDailyCostElement.textContent = `¥${val.toFixed(2)}`;
      },
      onComplete: () => {
        avgDailyCostElement.textContent = `¥${avgDailyCost.toFixed(2)}`;
      },
    });
  },
};

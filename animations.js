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
      duration: 300,
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
      delay: anime.stagger(30),
      duration: 350,
      easing: "easeOutQuint",
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
      duration: 200,
      easing: "easeOutQuint",
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
   */
  animateCounter: ({ from = 0, to, onUpdate, onComplete }) => {
    const valObj = { num: from };
    anime.animate(valObj, {
      num: to,
      easing: "spring(1, 80, 10, 0)",
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

    anime.animate(bgElement, {
      translateX: targetBtn.offsetLeft - 4,
      width: targetBtn.offsetWidth,
      duration: 250,
      easing: "easeOutQuint",
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
    const colors = [
      "var(--primary)",
      "var(--secondary)",
      "var(--success)",
      "var(--warning)",
    ];

    const animateShape = (shape) => {
      anime.animate(shape, {
        translateX: anime.random(-200, 200),
        translateY: anime.random(-200, 200),
        scale: anime.random(0.5, 1.5),
        duration: anime.random(10000, 20000),
        easing: "easeInOutSine",
        onComplete: () => animateShape(shape),
      });
    };

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
      shape.style.opacity = anime.random(10, 30) / 100;

      bgContainer.appendChild(shape);

      animateShape(shape);
    }
  },

  /**
   * Animates a button press effect (scale down).
   * @param {Element} btn - The button element.
   */
  animateButtonPressDown: (btn) => {
    anime.animate(btn, {
      scale: 0.92,
      duration: 150,
      easing: "easeOutCubic",
    });
  },

  /**
   * Animates a button press effect (scale up).
   * @param {Element} btn - The button element.
   */
  animateButtonPressUp: (btn) => {
    anime.animate(btn, {
      scale: 1,
      duration: 300,
      easing: "easeOutBack",
    });
  },

  /**
   * Initializes button press effects for the entire document.
   */
  initButtonEffects: () => {
    document.addEventListener("pointerdown", (e) => {
      const btn = e.target.closest("button");
      if (btn) AppAnimations.animateButtonPressDown(btn);
    });

    document.addEventListener("pointerup", (e) => {
      const btn = e.target.closest("button");
      if (btn) AppAnimations.animateButtonPressUp(btn);
    });

    document.addEventListener("pointercancel", (e) => {
      const btn = e.target.closest("button");
      if (btn) AppAnimations.animateButtonPressUp(btn);
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

    const parseNum = (str) => parseFloat(str.replace(/[^0-9.-]+/g, "")) || 0;

    const fromTotalValue = parseNum(totalValueElement.textContent);
    const fromTotalItems = parseNum(totalItemsElement.textContent);
    const fromAvgDailyCost = parseNum(avgDailyCostElement.textContent);

    // Animate total value
    AppAnimations.animateCounter({
      from: fromTotalValue,
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
      from: fromTotalItems,
      to: totalItems,
      onUpdate: (val) => {
        totalItemsElement.textContent = Math.round(val);
      },
      onComplete: () => {
        totalItemsElement.textContent = totalItems;
      },
    });

    // Animate average daily cost
    AppAnimations.animateCounter({
      from: fromAvgDailyCost,
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

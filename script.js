document.addEventListener("DOMContentLoaded", () => {
  const wheel = document.getElementById("wheel");
  const spinButton = document.getElementById("spin-button");

  if (!wheel || !spinButton) {
    return;
  }

  const IS_NO_CARDS =
    typeof window !== "undefined" && window.IS_NO_CARDS === true;

  let isSpinning = false;
  let currentRotation = 0;

  const SPIN_DURATION_MS = 4000;
  const WIN_LABEL = "220 FS"; // целевой выигрыш
  const SECTOR_COUNT = 8;
  const SECTOR_ANGLE = 360 / SECTOR_COUNT;

  // Индексы зелёных секторов 220 FS, считая от верхнего по часовой стрелке:
  // 0 - чёрный RESPIN (верх)
  // 1 - зелёный 220 FS (право-верх)
  // 2 - жёлтый EMPTY (право)
  // 3 - красный 150 FS (право-низ)
  // 4 - чёрный RESPIN (низ)
  // 5 - зелёный 220 FS (лево-низ)
  // 6 - жёлтый EMPTY (лево)
  // 7 - красный 150 FS (лево-верх)
  const WIN_SECTORS = [1, 5];

  const spinToWin = () => {
    if (isSpinning) return;

    isSpinning = true;
    spinButton.disabled = true;

    // Несколько полных оборотов
    const fullTurns = 3 + Math.floor(Math.random() * 2); // 3–4 оборота

    // Выбираем случайный зелёный сектор (220 FS)
    const winIndex =
      WIN_SECTORS[Math.floor(Math.random() * WIN_SECTORS.length)];

    // Центр выбранного сектора относительно маркера сверху (0° — верхний сектор)
    // Колесо вращается, поэтому чтобы нужный сектор пришёл под стрелку,
    // крутим его на -угол сектора.
    const baseTargetAngle = -winIndex * SECTOR_ANGLE;

    // Небольшой разброс внутри сектора, но остаёмся в зелёной зоне
    const maxOffset = SECTOR_ANGLE * 0.35; // ~15–16°
    const randomOffset = (Math.random() - 0.5) * maxOffset;

    const targetAngle = baseTargetAngle + randomOffset;

    const normalizedCurrent =
      ((currentRotation % 360) + 360) % 360;

    const deltaRotation =
      fullTurns * 360 + (targetAngle - normalizedCurrent);

    currentRotation += deltaRotation;

    wheel.style.transition = `transform ${SPIN_DURATION_MS}ms cubic-bezier(0.19, 1, 0.22, 1)`;
    wheel.style.transform = `rotate(${currentRotation}deg)`;

    const handleTransitionEnd = () => {
      wheel.removeEventListener("transitionend", handleTransitionEnd);

      // Нормализуем угол, чтобы число не росло бесконечно
      currentRotation = currentRotation % 360;

      console.log(`Результат спина: ${WIN_LABEL}`);

      const winModal = document.getElementById("win-modal");
      const winCta = document.getElementById("win-banner-cta");
      const winBackdrop = document.getElementById("win-modal-backdrop");
      const wheelLayer = document.querySelector(".wheel-layer");
      const scratchSection = document.getElementById("scratch-section");
      const registrationModal = document.getElementById("registration-modal");

      // Показываем модалку выигрыша с затемнённым фоном
      if (winModal) {
        winModal.classList.add("is-open");
        winModal.setAttribute("aria-hidden", "false");
      }

      const hideModal = () => {
        if (winModal) {
          winModal.classList.remove("is-open");
          winModal.setAttribute("aria-hidden", "true");
        }
      };

      const handleBackdropClick = () => {
        // hideModal();
      };

      const handleCtaClick = () => {
        hideModal();

        if (IS_NO_CARDS && registrationModal) {
          registrationModal.classList.remove("hidden");
          registrationModal.setAttribute("aria-hidden", "false");
          return;
        }

        if (wheelLayer) {
          wheelLayer.classList.add("hidden");
        }
        if (scratchSection) {
          scratchSection.classList.remove("hidden");
          scratchSection.setAttribute("aria-hidden", "false");
        }
      };

      if (winBackdrop) {
        winBackdrop.addEventListener("click", handleBackdropClick, {
          once: true,
        });
      }
      if (winCta) {
        winCta.addEventListener("click", handleCtaClick, { once: true });
      }

      isSpinning = false;
      spinButton.disabled = false;
    };

    wheel.addEventListener("transitionend", handleTransitionEnd);
  };

  spinButton.addEventListener("click", spinToWin);

  // Анимация в месте карты: по клику карта заменяется на видео, проигрывается 1 раз
  const scratchTitleWrap = document.getElementById("scratch-title-wrap");
  const scratchGrid = document.getElementById("scratch-grid");
  const scratchResult = document.getElementById("scratch-result");
  let revealedScratchCount = 0;

  document.querySelectorAll(".scratch-card-wrap").forEach((wrap) => {
    const card = wrap.querySelector(".scratch-card");
    const video = wrap.querySelector(".scratch-card-video");
    if (!card || !video) return;

    card.addEventListener("click", () => {
      if (card.disabled) return;

      card.classList.add("is-revealed");
      card.disabled = true;
      video.classList.add("is-playing");
      video.currentTime = 0;
      video.play();

      revealedScratchCount += 1;

      if (revealedScratchCount === 2 && scratchGrid && scratchResult) {
        setTimeout(() => {
          if (scratchTitleWrap) scratchTitleWrap.classList.add("hidden");
          scratchGrid.classList.add("hidden");
          scratchResult.classList.remove("hidden");
          scratchResult.setAttribute("aria-hidden", "false");
        }, 500);
      }
    });

    video.addEventListener("ended", () => {
      video.pause();
      video.classList.add("is-playing"); // остаёмся видимым (последний кадр)
    });
  });
});


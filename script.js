document.addEventListener("DOMContentLoaded", () => {
  const wheel = document.getElementById("wheel");
  const spinButton = document.getElementById("spin-button");

  if (!wheel || !spinButton) {
    return;
  }

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

      isSpinning = false;
      spinButton.disabled = false;
    };

    wheel.addEventListener("transitionend", handleTransitionEnd);
  };

  spinButton.addEventListener("click", spinToWin);
});


document.addEventListener("DOMContentLoaded", () => {
  const yearElement = document.getElementById("year");
  if (yearElement) {
    yearElement.textContent = new Date().getFullYear().toString();
  }

  const heroCta = document.getElementById("hero-cta");
  const ctaButton = document.getElementById("cta-button");

  const scrollToCta = () => {
    const ctaSection = document.getElementById("cta");
    if (!ctaSection) return;
    ctaSection.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  if (heroCta) {
    heroCta.addEventListener("click", scrollToCta);
  }

  if (ctaButton) {
    ctaButton.addEventListener("click", () => {
      // Здесь можно повесить открытие модалки или переход на форму
      alert("Здесь будет действие лендинга (форма, заявка и т.п.)");
    });
  }
});


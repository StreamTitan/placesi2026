const LIGHT_THEME_COLOR = '#FFFFFF';
const DARK_THEME_COLOR = '#00C693';

export function updateThemeColor(isDark: boolean) {
  const metaThemeColor = document.querySelector('meta[name="theme-color"]');
  if (metaThemeColor) {
    metaThemeColor.setAttribute('content', isDark ? DARK_THEME_COLOR : LIGHT_THEME_COLOR);
  }
}

export function initThemeColorObserver() {
  const htmlElement = document.documentElement;

  // Set initial theme color based on current theme
  const isDark = htmlElement.classList.contains('dark');
  updateThemeColor(isDark);

  // Create observer to watch for theme changes
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
        const isDark = htmlElement.classList.contains('dark');
        updateThemeColor(isDark);
      }
    });
  });

  // Start observing
  observer.observe(htmlElement, {
    attributes: true,
    attributeFilter: ['class']
  });

  return observer;
}

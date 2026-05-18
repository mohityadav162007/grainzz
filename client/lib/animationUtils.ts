export const animateFlyToCart = (startElement: HTMLElement, productImage?: string) => {
  if (typeof window === 'undefined') return;

  const cartElements = document.querySelectorAll('.header-cart-icon-btn');
  let cartElement: HTMLElement | null = null;
  for (let i = 0; i < cartElements.length; i++) {
    const el = cartElements[i] as HTMLElement;
    const rect = el.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0 && window.getComputedStyle(el).display !== 'none') {
      cartElement = el;
      break;
    }
  }

  if (!cartElement || !startElement) return;

  const startRect = startElement.getBoundingClientRect();
  const cartRect = cartElement.getBoundingClientRect();

  // Create a visual flying element clone
  const flyElem = document.createElement('div');
  flyElem.style.position = 'fixed';
  flyElem.style.zIndex = '99999';
  flyElem.style.left = `${startRect.left}px`;
  flyElem.style.top = `${startRect.top}px`;
  flyElem.style.width = `${startRect.width}px`;
  flyElem.style.height = `${startRect.height}px`;
  flyElem.style.pointerEvents = 'none';
  flyElem.style.borderRadius = '50%';
  
  if (productImage) {
    flyElem.style.backgroundImage = `url(${productImage})`;
    flyElem.style.backgroundSize = 'cover';
    flyElem.style.backgroundPosition = 'center';
    flyElem.style.borderRadius = '12px';
  } else {
    flyElem.style.backgroundColor = '#D72638';
  }

  // Calculate dynamic GPU 3D transform translations
  const deltaX = (cartRect.left + cartRect.width / 2) - (startRect.left + startRect.width / 2);
  const deltaY = (cartRect.top + cartRect.height / 2) - (startRect.top + startRect.height / 2);

  flyElem.style.transform = 'translate3d(0, 0, 0) scale(1)';
  flyElem.style.opacity = '1';
  
  document.body.appendChild(flyElem);

  // Force a browser layout reflow to lock the initial left/top starting coordinates
  void flyElem.offsetWidth;

  // Apply targeted CSS transition on transform and opacity only (prevents left/top coordinates from animating from page origin)
  flyElem.style.transition = 'transform 500ms cubic-bezier(0.25, 1, 0.5, 1), opacity 500ms ease-in-out';

  // Trigger animation in the next DOM painting tick
  requestAnimationFrame(() => {
    flyElem.style.transform = `translate3d(${deltaX}px, ${deltaY}px, 0) scale(0.15)`;
    flyElem.style.opacity = '0.15';
  });

  // Cleanup after animation completes (500ms)
  setTimeout(() => {
    if (flyElem.parentNode) {
      document.body.removeChild(flyElem);
    }

    // Trigger a sleek scale bounce animation on the active shopping cart badge count
    const badge = cartElement?.querySelector('span');
    if (badge) {
      badge.classList.add('scale-125', 'transition-transform', 'duration-200');
      setTimeout(() => {
        badge.classList.remove('scale-125');
      }, 200);
    }
  }, 500);
};

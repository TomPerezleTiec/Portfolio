/**
 * Divider Effect - Creates animated particles across the glowing divider area
 */
document.addEventListener("DOMContentLoaded", function () {
  const divider = document.getElementById("screen-divider");
  if (!divider) return; // Safety check

  // Create more particles but make them more subtle
  for (let i = 0; i < 25; i++) {
    createParticle();
  }

  /**
   * Creates a particle element and adds it to the divider area
   */ function createParticle() {
    const particle = document.createElement("div");
    particle.className = "divider-particle";

    // Random vertical position starting point (bottom of screen)
    particle.style.bottom = "0";
    // Random horizontal position within the glow area (reduced spread)
    // The glow extends about 40px in each direction
    const horizontalOffset = -30 + Math.random() * 60; // Random position in smaller glow area
    particle.style.left = `calc(50% + ${horizontalOffset}px)`; // Size variations for tennis ball - bigger to see details
    const size = 4 + Math.random() * 5; // Larger tennis ball size to see the texture
    particle.style.width = size + "px";
    particle.style.height = size + "px"; // Tennis ball specific styles
    // No extra glow/light effects as we want authentic tennis balls

    // Create the distinctive tennis ball pattern with the curved seam
    const tennisGreen =
      Math.random() > 0.5
        ? "rgba(204, 236, 31, 0.95)"
        : "rgba(194, 226, 21, 0.95)";
    const rotationDeg1 = Math.floor(Math.random() * 360); // Random rotation for first seam
    const rotationDeg2 = rotationDeg1 + 90; // Perpendicular second seam

    // Tennis balls have a very specific curved white seam pattern
    // Two perpendicular white curved lines
    particle.style.backgroundImage = `
      radial-gradient(circle, ${tennisGreen} 40%, rgba(184, 216, 11, 0.9) 90%),
      linear-gradient(${rotationDeg1}deg, transparent 45%, rgba(255, 255, 255, 0.9) 48%, 
      rgba(255, 255, 255, 0.9) 52%, transparent 55%),
      linear-gradient(${rotationDeg2}deg, transparent 45%, rgba(255, 255, 255, 0.9) 48%, 
      rgba(255, 255, 255, 0.9) 52%, transparent 55%)
    `;

    // Tennis balls have a slightly fuzzy, not perfectly circular appearance
    particle.style.borderRadius =
      Math.random() > 0.3 ? "50%" : "48% 52% 51% 49%";

    // Add tennis ball texture and subtle 3D effect
    particle.style.boxSizing = "border-box";
    particle.style.boxShadow = "inset 0 0 2px rgba(0,0,0,0.2)";

    // Add the fuzzy texture look that tennis balls have
    if (Math.random() > 0.4) {
      particle.style.border = "0.5px solid rgba(184, 216, 11, 0.5)";
    }

    // Random animation duration
    const duration = 6 + Math.random() * 10;
    particle.style.animationDuration = duration + "s";

    // Random delay
    const delay = Math.random() * 5;
    particle.style.animationDelay = delay + "s";

    // Add particle to the divider
    divider.appendChild(particle);

    // Recreate particles at the end of their animation cycle
    particle.addEventListener("animationend", function () {
      divider.removeChild(particle);
      createParticle();
    });
  }
});

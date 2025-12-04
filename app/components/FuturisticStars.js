'use client';

import { useState, useEffect } from 'react';

export default function FuturisticStars() {
  // Use a single state object to hold both stars and buildings for cleaner state management.
  const [scene, setScene] = useState({ stars: null, buildings: null });

  useEffect(() => {
    // --- Generate Star Field ---
    const newStars = Array.from({ length: 120 }).map(() => ({
      cx: Math.random() * 1440,
      cy: Math.random() * 800,
      r: Math.random() * 1.5 + 0.2,
      opacity: Math.random() * 0.7 + 0.2,
    }));

    // --- Generate Cityscape ---
    const newBuildings = Array.from({ length: 8 }).map(() => ({
      x: Math.random() * 1340 + 50, // Keep buildings within the viewBox with some padding
      y: 600 + Math.random() * 100, // Base height of the buildings
      width: 40 + Math.random() * 100,
      height: 30 + Math.random() * 70,
      // Use a predefined set of colors for a cohesive cyberpunk palette
      color: ['#00fff7', '#7f00ff', '#ff00ea'][Math.floor(Math.random() * 3)],
      opacity: 0.1 + Math.random() * 0.2,
    }));

    // Set the state with both generated arrays
    setScene({ stars: newStars, buildings: newBuildings });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // This effect runs only once on component mount

  // Wait until both stars and buildings are generated before rendering
  if (!scene.stars || !scene.buildings) {
    return null;
  }

  return (
    // aria-hidden="true" hides this decorative element from screen readers
    <div className="absolute inset-0 -z-20" aria-hidden="true">
      <svg className="w-full h-full" viewBox="0 0 1440 800" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          {/* This gradient is now used for the stars to give them a soft glow */}
          <radialGradient id="starGlow" cx="50%" cy="50%" r="80%" fx="50%" fy="50%" gradientTransform="rotate(0)">
            <stop offset="0%" stopColor="#00fff7" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#7f00ff" stopOpacity="0.05" />
          </radialGradient>
          <linearGradient id="cityGlow" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="#7f00ff" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#00fff7" stopOpacity="0.1" />
          </linearGradient>
        </defs>

        {/* Dynamically rendered star field using the gradient */}
        {scene.stars.map((star, i) => (
          <circle key={i} cx={star.cx} cy={star.cy} r={star.r} fill="url(#starGlow)" opacity={star.opacity} />
        ))}

        {/* Cyber cityscape silhouette with a glowing background and dynamic buildings */}
        <g>
          <rect x="0" y="700" width="1440" height="100" fill="url(#cityGlow)" />
          {scene.buildings.map((building, i) => (
            <rect
              key={`b-${i}`} // Use a unique key for buildings
              x={building.x}
              y={building.y}
              width={building.width}
              height={building.height}
              fill={building.color}
              opacity={building.opacity}
            />
          ))}
        </g>
      </svg>
    </div>
  );
}
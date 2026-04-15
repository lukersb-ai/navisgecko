'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

const slides = [
  "/hero-slider-1.jpg",
  "/hero-slider-2.jpg",
  "/hero-slider-3.jpg",
  "/hero-slider-4.jpg"
];

export default function HeroSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    // Randomize initial slide on mount
    setCurrentIndex(Math.floor(Math.random() * slides.length));

    // Change slide every 60 seconds
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 z-0">
      {slides.map((slide, index) => (
        <Image
          key={slide}
          src={slide}
          alt={`Slide ${index + 1}`}
          fill
          priority={index === currentIndex}
          className={`object-cover object-[50%_40%] transition-opacity duration-1000 ${
            index === currentIndex ? 'opacity-100' : 'opacity-0'
          }`}
        />
      ))}
      <div className="absolute inset-0 bg-earth-dark/60"></div>
    </div>
  );
}

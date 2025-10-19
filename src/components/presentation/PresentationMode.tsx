"use client";
import { useState, useRef, useCallback } from "react";
import { ArrowLeft, ArrowRight, Maximize2, Minimize2 } from "lucide-react";
import { PresentationModeProps, SlideData, CustomNode } from "@/types/mindmap";

export default function PresentationMode({ nodes, edges, onClose }: PresentationModeProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const slideRef = useRef<HTMLDivElement>(null);

  const buildSlides = (): SlideData[] => {
    const rootNode = nodes.find((n) => n.data.level === 0);
    const slides: SlideData[] = [];

    if (rootNode) {
      slides.push({
        type: "title",
        title: rootNode.data.label,
        description: rootNode.data.description || "",
      });

      const topics = nodes.filter((n) => n.data.level === 1);
      topics.forEach((topic) => {
        const children = edges
          .filter((e) => e.source === topic.id)
          .map((e) => nodes.find((n) => n.id === e.target))
          .filter((n): n is CustomNode => Boolean(n));

        slides.push({
          type: "topic",
          title: topic.data.label,
          description: topic.data.description || "",
          children: children.map((c) => c.data.label),
        });
      });
    }
    return slides;
  };

  const slides = buildSlides();

  const nextSlide = () => setCurrentSlide((prev) => Math.min(prev + 1, slides.length - 1));
  const prevSlide = () => setCurrentSlide((prev) => Math.max(prev - 1, 0));

  const toggleFullscreen = () => {
    if (!isFullscreen) document.documentElement.requestFullscreen?.();
    else document.exitFullscreen?.();
    setIsFullscreen(!isFullscreen);
  };

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (slides.length > 1) {
        if (e.key === "ArrowRight") nextSlide();
        if (e.key === "ArrowLeft") prevSlide();
      }
      if (e.key === "Escape") onClose();
    },
    [slides.length, onClose]
  );

  return (
    <div
      onKeyDown={handleKeyDown}
      tabIndex={0}
      style={{
        position: "fixed",
        inset: 0,
        background: "#f9fafb",
        zIndex: 2000,
        display: "flex",
        flexDirection: "column",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
        
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          padding: "1rem 2rem",
          background: "#f9fafb",
          borderBottom: "1px solid #e5e7eb",
        }}
      >
        <button
          onClick={onClose}
          style={{
            background: "#9ca3af",
            color: "white",
            padding: "0.5rem 1rem",
            borderRadius: "6px",
            border: "none",
            cursor: "pointer",
            display: "flex",
            gap: "0.5rem",
          }}
        >
          <ArrowLeft size={16} /> Exit
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#6b7280" }}>
          <span>
            Slide {currentSlide + 1} of {slides.length}
          </span>
          <div style={{ width: 200, height: 6, background: "#d1d5db", borderRadius: 3 }}>
            <div
              style={{
                width: `${((currentSlide + 1) / slides.length) * 100}%`,
                height: "100%",
                background: "#9ca3af",
              }}
            />
          </div>
        </div>

        <button
          onClick={toggleFullscreen}
          style={{
            background: "white",
            color: "#6b7280",
            padding: "0.5rem 1rem",
            borderRadius: "6px",
            border: "1px solid #d1d5db",
            display: "flex",
            gap: "0.5rem",
            cursor: "pointer",
          }}
        >
          {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
        </button>
      </div>

      {/* Slides */}
      <div style={{ flex: 1, position: "relative" }} ref={slideRef}>
        {slides.map((slide, idx) => (
          <div
            key={idx}
            style={{
              opacity: idx === currentSlide ? 1 : 0,
              transform: idx === currentSlide ? "translateX(0)" : "translateX(20px)",
              transition: "opacity 0.5s, transform 0.5s",
              position: idx === currentSlide ? "relative" : "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "60px 40px",
            }}
          >
            {slide.type === "title" && (
              <div style={{ textAlign: "center" }}>
                <h1 style={{ fontSize: "3rem", color: "#6b7280" }}>{slide.title}</h1>
                {slide.description && (
                  <p style={{ fontSize: "1.5rem", color: "#9ca3af" }}>{slide.description}</p>
                )}
              </div>
            )}
            {slide.type === "topic" && (
              <div style={{ maxWidth: 800 }}>
                <h2 style={{ fontSize: "2.5rem", color: "#6b7280" }}>{slide.title}</h2>
                {slide.description && (
                  <p style={{ fontSize: "1.25rem", color: "#9ca3af" }}>{slide.description}</p>
                )}
                {slide.children && (
                  <ul style={{ listStyle: "none", padding: 0 }}>
                    {slide.children.map((child, i) => (
                      <li
                        key={i}
                        style={{
                          padding: "1rem",
                          background: "#f9fafb",
                          marginTop: "1rem",
                          borderLeft: "5px solid #9ca3af",
                          borderRadius: "4px",
                          color: "#6b7280",
                        }}
                      >
                        {child}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Navigation */}
      {slides.length > 1 && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: "1.5rem",
            background: "#f9fafb",
            borderTop: "1px solid #e5e7eb",
            gap: "1rem",
            boxShadow: "0 -2px 4px rgba(0,0,0,0.1)",
          }}
        >
          <button
            onClick={prevSlide}
            disabled={currentSlide === 0}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.75rem 1.5rem",
              borderRadius: "6px",
              background: currentSlide === 0 ? "#d1d5db" : "#9ca3af",
              color: "white",
              border: "none",
              cursor: currentSlide === 0 ? "not-allowed" : "pointer",
              fontSize: "0.875rem",
              fontWeight: "500",
            }}
          >
            <ArrowLeft size={16} /> Previous
          </button>

          <div style={{ display: "flex", gap: "0.5rem" }}>
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  border: "none",
                  background: idx === currentSlide ? "#9ca3af" : "#d1d5db",
                  cursor: "pointer",
                  transition: "background 0.2s ease",
                }}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>

          <button
            onClick={nextSlide}
            disabled={currentSlide === slides.length - 1}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.75rem 1.5rem",
              borderRadius: "6px",
              background:
                currentSlide === slides.length - 1 ? "#d1d5db" : "#9ca3af",
              color: "white",
              border: "none",
              cursor:
                currentSlide === slides.length - 1 ? "not-allowed" : "pointer",
              fontSize: "0.875rem",
              fontWeight: "500",
            }}
          >
            Next <ArrowRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}

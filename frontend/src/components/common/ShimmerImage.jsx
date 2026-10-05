import React, { useState, useEffect, useRef, useCallback } from "react";
import styles from "./ShimmerImage.module.css";

export default function ShimmerImage({
  src,
  alt = "",
  className = "",
  wrapperClassName = "",
  fallbackSrc = "/images/dance-&-cultural-fest.webp",
  loading = "lazy",
  theme = "light", // 'light' | 'dark'
  style = {},
  wrapperStyle = {},
  onLoad,
  onError,
  ...props
}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef(null);

  const finalSrc = hasError || !src ? fallbackSrc : src;

  // Check if image is already cached/complete in the browser DOM
  useEffect(() => {
    if (!src) {
      setIsLoaded(true);
      return;
    }
    const img = imgRef.current;
    if (img && img.complete) {
      if (img.naturalWidth > 0) {
        setIsLoaded(true);
        setHasError(false);
        return;
      }
    }
    setIsLoaded(false);
    setHasError(false);
  }, [src]);

  // Callback ref to immediately detect if the image element is already complete upon mount or reuse
  const handleRef = useCallback((node) => {
    imgRef.current = node;
    if (node && node.complete && node.naturalWidth > 0) {
      setIsLoaded(true);
      setHasError(false);
    }
  }, []);

  const handleLoad = (e) => {
    setIsLoaded(true);
    setHasError(false);
    if (onLoad) onLoad(e);
  };

  const handleError = (e) => {
    if (!hasError) {
      setHasError(true);
      setIsLoaded(true);
    }
    if (onError) onError(e);
  };

  const isDark = theme === "dark";

  return (
    <div
      className={`${styles.shimmerBox} ${isDark ? styles.shimmerBoxDark : ""} ${wrapperClassName}`}
      style={wrapperStyle}
    >
      {/* YouTube-style Shimmer Wave - sweeps across while image is loading */}
      {!isLoaded && (
        <div
          className={`${styles.shimmerSweep} ${isDark ? styles.shimmerSweepDark : ""}`}
          aria-hidden="true"
        />
      )}

      {/* Actual image with lazy loading and fade-in */}
      <img
        key={finalSrc}
        ref={handleRef}
        src={finalSrc}
        alt={alt}
        loading={loading}
        onLoad={handleLoad}
        onError={handleError}
        className={`${styles.image} ${isLoaded ? styles.imageVisible : styles.imageHidden} ${className}`}
        style={style}
        {...props}
      />
    </div>
  );
}

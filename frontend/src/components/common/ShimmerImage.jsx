import React, { useState, useEffect } from "react";
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

  useEffect(() => {
    setIsLoaded(false);
    setHasError(false);
  }, [src]);

  const handleLoad = (e) => {
    setIsLoaded(true);
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
        src={hasError ? fallbackSrc : src}
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

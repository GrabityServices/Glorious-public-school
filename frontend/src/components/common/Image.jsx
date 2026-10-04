import React from "react";
import ShimmerImage from "./ShimmerImage";

export default function Image({
  src,
  alt = "",
  fill = false,
  width,
  height,
  priority = false,
  className = "",
  style = {},
  fallbackSrc = "/images/dance-&-cultural-fest.webp",
  theme = "light",
  sizes,
  ...props
}) {
  const fillStyle = fill
    ? {
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        objectFit: "cover",
        ...style,
      }
    : style;

  return (
    <ShimmerImage
      src={src}
      alt={alt}
      width={!fill ? width : undefined}
      height={!fill ? height : undefined}
      loading={priority ? "eager" : "lazy"}
      className={className}
      style={fillStyle}
      fallbackSrc={fallbackSrc}
      theme={theme}
      sizes={sizes}
      {...props}
    />
  );
}

import React from "react";

export default function Image({
  src,
  alt = "",
  fill = false,
  width,
  height,
  priority = false,
  className = "",
  style = {},
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
    <img
      src={src}
      alt={alt}
      width={!fill ? width : undefined}
      height={!fill ? height : undefined}
      loading={priority ? "eager" : "lazy"}
      sizes={sizes}
      className={className}
      style={fillStyle}
      {...props}
    />
  );
}

// src/components/icons/BuzzBotIcon.tsx
import type { IconBaseProps } from "react-icons";

export const BuzzBotIcon = ({
  className,
  style,
  color,
  size = "1em",
}: IconBaseProps) => {
  const finalSize = typeof size === "number" ? size : size ?? "1em";
  const stroke = color ?? "currentColor";

  return (
    <svg
      viewBox="0 0 24 24"
      width={finalSize}
      height={finalSize}
      className={className}
      style={style}
      fill="none"
      stroke={stroke}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* body */}
      <ellipse cx="12" cy="13" rx="4.5" ry="5.5" />
      {/* stripes */}
      <line x1="9" y1="11" x2="15" y2="11" />
      <line x1="9" y1="13" x2="15" y2="13" />
      <line x1="9" y1="15" x2="15" y2="15" />
      {/* wings */}
      <ellipse cx="8.5" cy="7.5" rx="3" ry="2.2" />
      <ellipse cx="15.5" cy="7.5" rx="3" ry="2.2" />
      {/* antennae */}
      <line x1="11" y1="6" x2="10" y2="4" />
      <line x1="13" y1="6" x2="14" y2="4" />
      <circle cx="10" cy="3.5" r="0.6" fill={stroke} />
      <circle cx="14" cy="3.5" r="0.6" fill={stroke} />
      {/* little smile */}
      <path d="M11 14.5c.3.4.7.7 1 .7s.7-.3 1-.7" />
    </svg>
  );
};

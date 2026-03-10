import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  faceClassName?: string;
  pressed?: boolean;
  tabIndex?: number;
  ariaLabel?: string;
};

export default function Button({
  children,
  onClick,
  className = "",
  faceClassName = "",
  pressed = false,
  tabIndex,
  ariaLabel,
}: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      tabIndex={tabIndex}
      aria-label={ariaLabel}
      className={`btn ${pressed ? "btn-locked" : ""} ${className}`}
      aria-pressed={pressed}
    >
      <span className="btn-shadow" aria-hidden="true" />
      <span className={`btn-face ui-text-lg btn-scale ${faceClassName}`}>
        {children}
      </span>
    </button>
  );
}

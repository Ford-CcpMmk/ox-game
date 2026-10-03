export function FriendlyMark({ mark }: { mark: "X" | "O" }) {
  return (
    <svg
      className={`ox-friendly-mark block size-full pointer-events-none ox-friendly-mark-${mark.toLowerCase()}`}
      viewBox="0 0 100 100"
      fill="none"
      stroke="currentColor"
      strokeWidth="19"
      strokeLinecap="round"
      aria-hidden="true"
    >
      {mark === "X" ? (
        <path d="M27 27 73 73M73 27 27 73" />
      ) : (
        <circle cx="50" cy="50" r="28" />
      )}
    </svg>
  );
}

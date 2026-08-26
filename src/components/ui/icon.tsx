const paths: Record<string, string> = {
  grid: "M4 4h7v7H4V4zm9 0h7v7h-7V4zM4 13h7v7H4v-7zm9 0h7v7h-7v-7z",
  plus: "M12 5v14M5 12h14",
  doc: "M7 3h7l5 5v13a1 1 0 01-1 1H7a1 1 0 01-1-1V4a1 1 0 011-1zM14 3v5h5",
  building: "M4 21V4a1 1 0 011-1h6a1 1 0 011 1v17M16 21V9a1 1 0 011-1h3a1 1 0 011 1v12M4 21h16M8 7h1M8 11h1M8 15h1",
  warning: "M12 3l9 16H3l9-16zM12 10v4M12 17h.01",
  camera: "M4 8h3l2-3h6l2 3h3a1 1 0 011 1v10a1 1 0 01-1 1H4a1 1 0 01-1-1V9a1 1 0 011-1zM12 17a4 4 0 100-8 4 4 0 000 8z",
  check: "M20 6L9 17l-5-5",
  chevronRight: "M9 18l6-6-6-6",
  chevronLeft: "M15 18l-6-6 6-6",
  x: "M18 6L6 18M6 6l12 12",
  download: "M12 3v12m0 0l-4-4m4 4l4-4M5 21h14",
  logout: "M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9",
  search: "M11 19a8 8 0 100-16 8 8 0 000 16zM21 21l-4.35-4.35",
  edit: "M11 4H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2v-5M18.5 2.5a2.12 2.12 0 013 3L12 15l-4 1 1-4 9.5-9.5z",
  trash: "M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14z",
  settings:
    "M10.3 2.3a1 1 0 011.4 0l.6.6a1 1 0 00.9.3l.8-.2a1 1 0 011.2.7l.2.8a1 1 0 00.6.7l.8.3a1 1 0 01.5 1.4l-.4.7a1 1 0 000 1l.4.7a1 1 0 01-.5 1.4l-.8.3a1 1 0 00-.6.7l-.2.8a1 1 0 01-1.2.7l-.8-.2a1 1 0 00-.9.3l-.6.6a1 1 0 01-1.4 0l-.6-.6a1 1 0 00-.9-.3l-.8.2a1 1 0 01-1.2-.7l-.2-.8a1 1 0 00-.6-.7l-.8-.3a1 1 0 01-.5-1.4l.4-.7a1 1 0 000-1l-.4-.7a1 1 0 01.5-1.4l.8-.3a1 1 0 00.6-.7l.2-.8a1 1 0 011.2-.7l.8.2a1 1 0 00.9-.3l.6-.6zM12 15a3 3 0 100-6 3 3 0 000 6z",
  sun: "M12 3v2m0 14v2m9-9h-2M5 12H3m15.4-6.4l-1.4 1.4M6.6 17.4l-1.4 1.4m12.8 0l-1.4-1.4M6.6 6.6L5.2 5.2M12 8a4 4 0 100 8 4 4 0 000-8z",
  moon: "M21 12.8A9 9 0 1111.2 3 7 7 0 0021 12.8z",
  globe: "M12 21a9 9 0 100-18 9 9 0 000 18zM3.6 9h16.8M3.6 15h16.8M12 3a14 14 0 010 18M12 3a14 14 0 000 18",
  users: "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75",
};

export function Icon({ name, className = "h-5 w-5" }: { name: keyof typeof paths; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d={paths[name]} />
    </svg>
  );
}

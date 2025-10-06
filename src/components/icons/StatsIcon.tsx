interface StatsIconProps {
  className?: string;
}

export const StatsIcon = ({ className = "w-6 h-6" }: StatsIconProps) => {
  return (
    <svg
      viewBox="0 0 320.72 320.41"
      fill="currentColor"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x=".03" y="151.21" width="86.47" height="156.74" rx="25.21" ry="25.21"/>
      <rect x="117.13" y="12.46" width="86.47" height="295.49" rx="25.21" ry="25.21"/>
      <rect x="234.22" y="96.5" width="86.47" height="211.45" rx="25.21" ry="25.21"/>
    </svg>
  );
};

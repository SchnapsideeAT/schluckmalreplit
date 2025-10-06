interface PlayIconProps {
  className?: string;
}

export const PlayIcon = ({ className = "w-6 h-6" }: PlayIconProps) => {
  return (
    <svg 
      className={className}
      viewBox="0 0 320.72 320.41" 
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g id="EQidDs">
        <path d="M57.64.9c12.16-2.06,26.11-.59,37.26,4.59h0c58.34,38.49,128.78,68.03,185.44,108.12,34.71,24.56,35.35,65.06,3.61,92.25h0c-60.27,37.02-122.34,72.61-183.73,106.27-31.64,15.62-60.86,8.56-76.77-16.2-6.59-10.26-9.83-22.32-9.82-34.52l.15-213.62h0C16.45,27.41,37.18,4.35,57.64.9Z"/>
      </g>
    </svg>
  );
};

interface ArrowLeftIconProps {
  className?: string;
}

export const ArrowLeftIcon = ({ className = "w-6 h-6" }: ArrowLeftIconProps) => {
  return (
    <svg 
      className={className}
      viewBox="0 0 320.72 320.41" 
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M100.17,130.55h192.88c14.77,0,27.8,15.45,27.68,29.67-.12,13.97-13.2,29.05-27.68,29.05H100.17l52.92,53.25c21.82,26.36-7.66,61.06-37.01,44.52-37.16-34.6-72.11-71.75-108.43-107.32-10.2-12.33-10.2-27.29,0-39.62L110.74,36.99c28.69-24.27,65.16,12.41,41.67,40.99l-52.24,52.56Z"/>
    </svg>
  );
};

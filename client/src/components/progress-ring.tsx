interface ProgressRingProps {
  progress: number; // 0-100
  size?: number;
  strokeWidth?: number;
  className?: string;
}

export default function ProgressRing({ 
  progress, 
  size = 128, 
  strokeWidth = 8,
  className = ""
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;
  
  const getProgressColor = (progress: number) => {
    if (progress >= 50) return "text-ios-green";
    if (progress >= 40) return "text-ios-orange";
    return "text-ios-red";
  };

  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      <svg
        className="progress-ring"
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="text-gray-200 dark:text-gray-700"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className={`progress-ring-circle ${getProgressColor(progress)}`}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-3xl font-bold ${getProgressColor(progress)}`}>
          {Math.round(progress)}%
        </span>
        <span className="text-xs text-ios-secondary-label-light dark:text-ios-secondary-label-dark">
          Target: 50%
        </span>
      </div>
    </div>
  );
}

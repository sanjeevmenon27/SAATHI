export const LoadingSkeleton = ({ rows = 3, className = "" }) => (
  <div className={`space-y-3 ${className}`}>
    {Array.from({ length: rows }, (_, index) => (
      <div key={index} className="skeleton h-20 w-full" />
    ))}
  </div>
);

export default function AuthIllustration() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-3/4 h-3/4 text-blue-500"
      viewBox="0 0 200 200"
      fill="none"
    >
      {/* Calendar */}
      <rect x="30" y="40" width="140" height="120" rx="12" fill="currentColor" opacity="0.1"/>
      <line x1="30" y1="70" x2="170" y2="70" stroke="currentColor" strokeWidth="4"/>
      <circle cx="60" cy="100" r="6" fill="currentColor"/>
      <circle cx="100" cy="100" r="6" fill="currentColor"/>
      <circle cx="140" cy="100" r="6" fill="currentColor"/>
      <circle cx="60" cy="130" r="6" fill="currentColor"/>
      <circle cx="100" cy="130" r="6" fill="currentColor"/>
      <circle cx="140" cy="130" r="6" fill="currentColor"/>
      {/* Clock */}
      <circle cx="100" cy="170" r="20" stroke="currentColor" strokeWidth="3"/>
      <line x1="100" y1="170" x2="100" y2="158" stroke="currentColor" strokeWidth="3"/>
      <line x1="100" y1="170" x2="110" y2="170" stroke="currentColor" strokeWidth="3"/>
    </svg>
  );
}
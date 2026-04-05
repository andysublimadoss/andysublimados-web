const LogoIcon = () => (
  <div className="w-16 h-16 relative flex items-center justify-center overflow-hidden">
    <img
      src="/logo.png"
      alt="Logo"
      className="w-full h-full object-contain"
      onError={(e) => {
        // If .png fails, try .jpg
        if (e.currentTarget.src.endsWith('.png')) {
          e.currentTarget.src = '/logo.jpg';
        } else {
          // Fallback to SVG if both fail
          e.currentTarget.style.display = 'none';
          e.currentTarget.nextElementSibling?.classList.remove('hidden');
        }
      }}
    />
    <svg viewBox="0 0 100 100" className="w-full h-full hidden">
      <path d="M20 80 L50 20 L80 80" fill="none" stroke="#E6007E" strokeWidth="15" />
      <path d="M10 40 L35 20 L45 50 Z" fill="#FFED00" />
      <path d="M30 75 L50 95 L20 95 Z" fill="#009EE3" />
      <path d="M45 30 L55 30 L50 50 Z" fill="#000000" />
    </svg>
  </div>
);

export default LogoIcon;

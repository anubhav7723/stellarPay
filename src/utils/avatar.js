// Generate unique avatar background and initials from address string
export function getAddressAvatar(address) {
  if (!address || address.length < 5) {
    return {
      initials: "??",
      gradient: "linear-gradient(135deg, #cbd5e1 0%, #94a3b8 100%)", // muted slate gray
    };
  }

  let hash = 0;
  for (let i = 0; i < address.length; i++) {
    hash = (hash << 5) - hash + address.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash);

  const presets = [
    "linear-gradient(135deg, #f97316 0%, #ea580c 100%)", // orange
    "linear-gradient(135deg, #a855f7 0%, #7e22ce 100%)", // purple
    "linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)", // cyan
    "linear-gradient(135deg, #10b981 0%, #047857 100%)", // emerald
    "linear-gradient(135deg, #ec4899 0%, #be185d 100%)", // pink
    "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)", // blue
    "linear-gradient(135deg, #eab308 0%, #ca8a04 100%)", // yellow
    "linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)", // red
  ];

  const gradient = presets[index % presets.length];
  const initials = address.slice(0, 1) + address.slice(4, 5).toUpperCase();
  return { initials, gradient };
}

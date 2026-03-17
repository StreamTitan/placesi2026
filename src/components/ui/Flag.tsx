import { HTMLAttributes } from 'react';

interface FlagProps extends HTMLAttributes<HTMLSpanElement> {
  countryCode: string;
  squared?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const countryToEmoji: Record<string, string> = {
  tt: '🇹🇹',
  us: '🇺🇸',
  gb: '🇬🇧',
  ca: '🇨🇦',
  jm: '🇯🇲',
  bb: '🇧🇧',
  gd: '🇬🇩',
  lc: '🇱🇨',
  vc: '🇻🇨',
  ag: '🇦🇬',
  dm: '🇩🇲',
  kn: '🇰🇳',
  bs: '🇧🇸',
  gy: '🇬🇾',
  sr: '🇸🇷',
};

const sizeClasses = {
  sm: 'text-base leading-none',
  md: 'text-xl leading-none',
  lg: 'text-2xl leading-none',
};

export function Flag({
  countryCode,
  squared = false,
  size = 'md',
  className = '',
  title,
  ...props
}: FlagProps) {
  const emoji = countryToEmoji[countryCode.toLowerCase()] || '🏳️';
  const flagClasses = `${sizeClasses[size]} inline-block ${className}`;

  return (
    <span
      className={flagClasses}
      title={title || countryCode.toUpperCase()}
      role="img"
      aria-label={`${countryCode.toUpperCase()} flag`}
      {...props}
    >
      {emoji}
    </span>
  );
}

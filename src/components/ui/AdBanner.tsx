interface AdBannerProps {
  imageUrl?: string;
  altText?: string;
  link?: string;
  className?: string;
}

export function AdBanner({
  imageUrl = '/buzzad2.png',
  altText = 'Buzz Beer - Get it Now',
  link,
  className = '',
}: AdBannerProps) {
  const banner = (
    <div
      className={`w-full overflow-hidden rounded-lg flex items-center justify-center ${className}`}
    >
      <img
        src={imageUrl}
        alt={altText}
        className="w-full h-full object-contain"
        loading="lazy"
      />
    </div>
  );

  if (link) {
    return (
      <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        className="block"
      >
        {banner}
      </a>
    );
  }

  return banner;
}

import type { FC } from 'react';
import { User } from 'lucide-react';

export interface UserAvatarProps {
  avatarUrl?: string | null;
  name?: string | null;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'w-7 h-7 text-xs',
  md: 'w-8 h-8 text-xs',
  lg: 'w-9 h-9 text-sm',
};

export const UserAvatar: FC<UserAvatarProps> = ({
  avatarUrl,
  name,
  size = 'md',
  className = '',
}) => {
  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={name || 'User'}
        referrerPolicy="no-referrer"
        className={`${sizeClasses[size]} rounded-full object-cover shrink-0 ${className}`}
      />
    );
  }

  return (
    <div
      className={`${sizeClasses[size]} rounded-full bg-neutral-100 border border-neutral-200 text-neutral-800 flex items-center justify-center font-semibold shrink-0 select-none ${className}`}
    >
      {name ? name.charAt(0).toUpperCase() : <User className="w-4 h-4 text-neutral-600" />}
    </div>
  );
};

export default UserAvatar;

import type { FC, HTMLAttributes } from 'react';

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  className?: string;
}

export const Skeleton: FC<SkeletonProps> = ({
  width,
  height,
  borderRadius,
  className = '',
  style,
  ...rest
}) => {
  return (
    <div
      className={`animate-pulse bg-neutral-200 ${className}`}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
        borderRadius: typeof borderRadius === 'number' ? `${borderRadius}px` : borderRadius,
        ...style,
      }}
      {...rest}
    />
  );
};

export default Skeleton;

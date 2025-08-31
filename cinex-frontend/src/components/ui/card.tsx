import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Card: React.FC<CardProps> = ({
  className = '',
  children,
  ...props
}) => {
  const classes = `rounded-lg border bg-card text-card-foreground shadow-sm ${className}`;

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
};

interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {}

export const CardContent: React.FC<CardContentProps> = ({
  className = '',
  children,
  ...props
}) => {
  const classes = `p-6 pt-0 ${className}`;

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
};

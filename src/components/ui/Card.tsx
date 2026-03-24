import React, { HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLElement> {
  hover?: boolean;
  children: React.ReactNode;
}

export function Card({ hover = false, className = "", children, ...props }: CardProps) {
  const classes = `card ${hover ? "card-hover" : ""} ${className}`.trim();
  return (
    <section className={classes} {...props}>
      {children}
    </section>
  );
}

interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function CardHeader({ className = "", children, ...props }: CardHeaderProps) {
  return (
    <div className={`${className}`.trim()} {...props}>
      {children}
    </div>
  );
}

interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode;
}

export function CardTitle({ className = "", children, ...props }: CardTitleProps) {
  return (
    <h2 className={`section-title ${className}`.trim()} {...props}>
      {children}
    </h2>
  );
}

interface CardDescriptionProps extends HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode;
}

export function CardDescription({ className = "", children, ...props }: CardDescriptionProps) {
  return (
    <p className={`section-description ${className}`.trim()} {...props}>
      {children}
    </p>
  );
}

interface CardContentProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function CardContent({ className = "", children, ...props }: CardContentProps) {
  return (
    <div className={className} {...props}>
      {children}
    </div>
  );
}

interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function CardFooter({ className = "", children, ...props }: CardFooterProps) {
  return (
    <div className={`flex gap-3 ${className}`.trim()} {...props}>
      {children}
    </div>
  );
}

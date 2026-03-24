import React, { ReactNode } from "react";
import Link from "next/link";

interface ActionProps {
  href: string;
  label: string;
}

interface EmptyStateProps {
  icon?: string;
  title: string;
  description: string;
  primaryAction?: ActionProps;
  secondaryAction?: ActionProps;
}

export function EmptyState({
  icon,
  title,
  description,
  primaryAction,
  secondaryAction,
}: EmptyStateProps) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">{icon}</div>
      <div>
        <div className="empty-state-title">{title}</div>
        <div className="empty-state-description">{description}</div>
      </div>
      {(primaryAction || secondaryAction) && (
        <div style={{ display: "flex", gap: "8px", justifyContent: "center", flexWrap: "wrap" }}>
          {primaryAction && (
            <Link
              href={primaryAction.href}
              className="btn btn-primary btn-sm"
            >
              {primaryAction.label}
            </Link>
          )}
          {secondaryAction && (
            <Link
              href={secondaryAction.href}
              className="btn btn-secondary btn-sm"
            >
              {secondaryAction.label}
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

interface InlineEmptyStateProps {
  title: string;
  description: string;
}

export function InlineEmptyState({ title, description }: InlineEmptyStateProps) {
  return (
    <div style={{ textAlign: "center", padding: "24px 16px" }}>
      <div style={{ fontSize: "15px", fontWeight: 600, color: "var(--text)", marginBottom: "4px" }}>
        {title}
      </div>
      <div style={{ fontSize: "13px", color: "var(--text-muted)" }}>
        {description}
      </div>
    </div>
  );
}

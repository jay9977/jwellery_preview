import React from 'react';

interface Props {
  children: React.ReactNode;
  /** Rendered instead of the children when they throw. */
  fallback?: React.ReactNode;
  /** Shown in the default fallback so a visitor knows what is missing. */
  label?: string;
}

interface State {
  error: Error | null;
}

/**
 * Keeps one broken section from taking the whole page down. Content is
 * admin-editable, so a malformed field should cost that section and nothing else.
 */
export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error(`Section "${this.props.label ?? 'unknown'}" failed to render:`, error, info.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;
    if (this.props.fallback !== undefined) return this.props.fallback;

    return (
      <section className="section-y-sm w-full bg-sand">
        <div className="shell">
          <p className="body-sm mx-auto max-w-md text-center text-ink/50">
            This part of the page could not be displayed.
          </p>
        </div>
      </section>);

  }
}

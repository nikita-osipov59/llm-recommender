"use client";

import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="text-center py-12 px-4">
          <h2 className="text-xl font-semibold text-red-600 dark:text-red-400">
            Что-то пошло не так
          </h2>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            {this.state.error.message}
          </p>
          <button
            onClick={() => this.setState({ error: null })}
            className="mt-4 text-sm px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition cursor-pointer"
          >
            Попробовать снова
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

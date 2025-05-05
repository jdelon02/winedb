import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Alert } from 'react-bootstrap';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <Alert variant="danger" role="alert">
                    <Alert.Heading>Something went wrong</Alert.Heading>
                    <p>{this.state.error?.message}</p>
                    <hr />
                    <button 
                        className="btn btn-outline-danger"
                        onClick={() => this.setState({ hasError: false })}
                    >
                        Try again
                    </button>
                </Alert>
            );
        }

        return this.props.children;
    }
}
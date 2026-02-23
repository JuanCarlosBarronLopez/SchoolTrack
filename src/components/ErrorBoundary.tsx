import React, { Component, ReactNode } from 'react';
import { AlertTriangle, Home } from 'lucide-react';
import { Button } from './ui/button';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    errorInfo: string | null;
}

class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, errorInfo: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, errorInfo: error.message };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('Uncaught component error:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="flex h-screen w-full flex-col items-center justify-center bg-gray-50 px-4 text-center">
                    <div className="bg-white p-8 rounded-2xl shadow-lg border border-red-100 max-w-md w-full">
                        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertTriangle className="w-8 h-8 text-red-500" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">Algo salió mal</h1>
                        <p className="text-gray-500 mb-6">
                            Ha ocurrido un error inesperado cargando la interfaz.
                        </p>
                        {this.state.errorInfo && (
                            <div className="bg-red-50 text-red-800 text-xs p-3 rounded text-left overflow-auto max-h-32 mb-6 font-mono">
                                {this.state.errorInfo}
                            </div>
                        )}
                        <div className="space-y-3">
                            <Button
                                onClick={() => window.location.reload()}
                                className="w-full bg-blue-600 hover:bg-blue-700"
                            >
                                Recargar página
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => window.location.href = '/'}
                                className="w-full"
                            >
                                <Home className="w-4 h-4 mr-2" />
                                Ir al inicio
                            </Button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;

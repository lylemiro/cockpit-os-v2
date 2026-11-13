import React, { Component } from 'react';
import { AlertCircle, RotateCcw, Home } from 'lucide-react';

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Cockpit OS Render Crash Caught:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    localStorage.removeItem('cockpit_active_module_id');
    window.location.reload();
  };

  handleLogout = () => {
    localStorage.removeItem('cockpit_auth_operator');
    localStorage.removeItem('cockpit_active_module_id');
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          width: '100vw',
          backgroundColor: '#031008',
          color: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          zIndex: 999999
        }}>
          <div style={{
            maxWidth: '680px',
            width: '100%',
            background: 'rgba(20, 10, 10, 0.92)',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            borderRadius: '20px',
            padding: '32px',
            boxShadow: '0 24px 64px rgba(0,0,0,0.7)',
            backdropFilter: 'blur(20px)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: 'rgba(239, 68, 68, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#f87171'
              }}>
                <AlertCircle size={24} />
              </div>
              <div>
                <h2 style={{ margin: 0, fontSize: '18px', color: '#f87171', fontWeight: 800 }}>
                  Cockpit OS Session Exception
                </h2>
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>
                  A runtime render error was safely trapped by Zero-Trust ErrorBoundary.
                </div>
              </div>
            </div>

            <div style={{
              background: 'rgba(0, 0, 0, 0.5)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '10px',
              padding: '16px',
              marginBottom: '20px'
            }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#fecaca', marginBottom: '8px' }}>
                {this.state.error?.name}: {this.state.error?.message}
              </div>
              <pre style={{
                margin: 0,
                fontSize: '11px',
                color: 'rgba(255,255,255,0.7)',
                overflow: 'auto',
                maxHeight: '180px',
                fontFamily: 'monospace'
              }}>
                {this.state.error?.stack}
              </pre>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={this.handleLogout}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '10px 16px',
                  background: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '10px',
                  color: '#ffffff',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                <Home size={14} />
                <span>Return to Lock Screen</span>
              </button>
              <button
                type="button"
                onClick={this.handleReset}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '10px 20px',
                  background: '#10b981',
                  border: 'none',
                  borderRadius: '10px',
                  color: '#ffffff',
                  fontSize: '12px',
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                <RotateCcw size={14} />
                <span>Reload Desktop</span>
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

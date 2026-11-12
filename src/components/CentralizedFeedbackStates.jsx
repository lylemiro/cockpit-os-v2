import React from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  Info,
  RefreshCw,
  X,
  Sparkles,
  Inbox
} from 'lucide-react';

/**
 * 1. Centralized Loading State
 * Friendly, reassuring loading pulse with non-technical description.
 */
export function LoadingState({
  title = 'Loading Arena Data...',
  message = 'Retrieving records from the secure local arena database.'
}) {
  return (
    <div className="feedback-state-box is-loading" role="status">
      <div className="feedback-spinner-wrap">
        <RefreshCw size={26} className="feedback-spinner-icon" />
      </div>
      <div className="feedback-state-title">{title}</div>
      <div className="feedback-state-desc">{message}</div>
    </div>
  );
}

/**
 * 2. Centralized Empty State
 * Friendly empty screen with clear explanation and helpful action button.
 */
export function EmptyState({
  title = 'No Records Found',
  message = 'There are no items recorded in this section yet.',
  actionLabel = null,
  onAction = null,
  secondaryActionLabel = null,
  onSecondaryAction = null
}) {
  return (
    <div className="feedback-state-box is-empty">
      <div className="feedback-icon-bubble is-empty">
        <Inbox size={30} />
      </div>
      <div className="feedback-state-title">{title}</div>
      <div className="feedback-state-desc">{message}</div>

      {(actionLabel || secondaryActionLabel) && (
        <div className="feedback-btn-row">
          {actionLabel && (
            <button
              type="button"
              className="btn-primary-emerald"
              onClick={onAction}
            >
              <Sparkles size={14} />
              <span>{actionLabel}</span>
            </button>
          )}
          {secondaryActionLabel && (
            <button
              type="button"
              className="btn-secondary-gold"
              onClick={onSecondaryAction}
            >
              <span>{secondaryActionLabel}</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * 3. Centralized Error Alert
 * Clear explanation of what happened in plain human language, with retry/dismiss actions.
 */
export function ErrorAlert({
  title = 'Unable to Complete Request',
  message = 'Please check the information and try again.',
  tip = null,
  onRetry = null,
  onDismiss = null
}) {
  return (
    <div className="feedback-banner is-error" role="alert">
      <div className="feedback-banner-icon-col">
        <AlertOctagon size={20} className="feedback-banner-icon is-error" />
      </div>
      <div className="feedback-banner-content">
        <div className="feedback-banner-title">{title}</div>
        <div className="feedback-banner-message">{message}</div>
        {tip && <div className="feedback-banner-tip">{tip}</div>}
      </div>
      <div className="feedback-banner-actions">
        {onRetry && (
          <button type="button" className="btn-banner-action" onClick={onRetry}>
            <RefreshCw size={12} />
            <span>Try Again</span>
          </button>
        )}
        {onDismiss && (
          <button
            type="button"
            className="btn-banner-close"
            onClick={onDismiss}
            aria-label="Dismiss notice"
          >
            <X size={14} />
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * 4. Centralized Warning Alert
 * Yellow/amber banner for cautionary conditions (e.g. weight discrepancy, unverified gate).
 */
export function WarningAlert({
  title = 'Important Notice',
  message = 'Please review this item before proceeding.',
  tip = null,
  actionLabel = null,
  onAction = null,
  onDismiss = null
}) {
  return (
    <div className="feedback-banner is-warning" role="alert">
      <div className="feedback-banner-icon-col">
        <AlertTriangle size={20} className="feedback-banner-icon is-warning" />
      </div>
      <div className="feedback-banner-content">
        <div className="feedback-banner-title">{title}</div>
        <div className="feedback-banner-message">{message}</div>
        {tip && <div className="feedback-banner-tip">{tip}</div>}
      </div>
      <div className="feedback-banner-actions">
        {actionLabel && (
          <button type="button" className="btn-banner-action" onClick={onAction}>
            <span>{actionLabel}</span>
          </button>
        )}
        {onDismiss && (
          <button
            type="button"
            className="btn-banner-close"
            onClick={onDismiss}
            aria-label="Dismiss notice"
          >
            <X size={14} />
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * 5. Centralized Success Alert
 * Emerald banner celebrating successful saves, pairings, and payouts.
 */
export function SuccessAlert({
  title = 'Changes Saved Successfully',
  message = 'The arena records have been updated and verified.',
  onDismiss = null
}) {
  return (
    <div className="feedback-banner is-success" role="status">
      <div className="feedback-banner-icon-col">
        <CheckCircle2 size={20} className="feedback-banner-icon is-success" />
      </div>
      <div className="feedback-banner-content">
        <div className="feedback-banner-title">{title}</div>
        <div className="feedback-banner-message">{message}</div>
      </div>
      {onDismiss && (
        <button
          type="button"
          className="btn-banner-close"
          onClick={onDismiss}
          aria-label="Dismiss notice"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}

/**
 * 6. Centralized Toast Notification Stack
 * Floating notifications in the top-right corner with auto-dismiss timers.
 */
export function ToastContainer({ toasts = [], onDismiss }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="toast-viewport-stack" aria-live="polite">
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isError = toast.type === 'error';
        const isWarning = toast.type === 'warning';

        return (
          <div
            key={toast.id}
            className={`toast-item-card ${
              isSuccess ? 'is-success' : isError ? 'is-error' : isWarning ? 'is-warning' : 'is-info'
            }`}
          >
            <div className="toast-icon-wrap">
              {isSuccess && <CheckCircle2 size={18} className="toast-icon-glyph is-success" />}
              {isError && <AlertOctagon size={18} className="toast-icon-glyph is-error" />}
              {isWarning && <AlertTriangle size={18} className="toast-icon-glyph is-warning" />}
              {!isSuccess && !isError && !isWarning && <Info size={18} className="toast-icon-glyph is-info" />}
            </div>

            <div className="toast-text-wrap">
              <div className="toast-headline">{toast.title}</div>
              <div className="toast-body">{toast.message}</div>
              {toast.tip && <div className="toast-tip-text">{toast.tip}</div>}
            </div>

            <button
              type="button"
              className="toast-close-btn"
              onClick={() => onDismiss(toast.id)}
              aria-label="Close notification"
            >
              <X size={13} />
            </button>
          </div>
        );
      })}
    </div>
  );
}


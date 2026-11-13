import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, Trophy } from 'lucide-react';
import { useArena } from '../context/ArenaContext.jsx';
import { EventDetailFullscreenModal } from './EventDetailFullscreenModal.jsx';

function toLocalIsoDate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function WindowsCalendarFlyout({ isOpen, onClose }) {
  const { arenaState, setActiveModuleId } = useArena();
  const [currentViewDate, setCurrentViewDate] = useState(() => new Date());
  const [now, setNow] = useState(() => new Date());
  const [eventDetailModal, setEventDetailModal] = useState(null); // { events: [], initialIndex: 0 }
  const flyoutRef = useRef(null);

  // Live ticking clock
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Close when clicking outside (unless event detail modal is open)
  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (e) => {
      if (eventDetailModal) return;
      if (e.target.closest('.event-detail-fullscreen-backdrop')) return;
      if (flyoutRef.current && !flyoutRef.current.contains(e.target)) {
        if (!e.target.closest('.tray-clock-stack')) {
          onClose();
        }
      }
    };

    const handleKeyDown = (e) => {
      if (eventDetailModal) return;
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose, eventDetailModal]);

  const year = currentViewDate.getFullYear();
  const month = currentViewDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysOfWeek = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  // Days in month calculation
  const calendarDays = useMemo(() => {
    const firstDayIndex = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const days = [];

    // Prev month padding
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      days.push({
        dayNum: daysInPrevMonth - i,
        isCurrentMonth: false,
        dateObj: new Date(year, month - 1, daysInPrevMonth - i)
      });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        dayNum: i,
        isCurrentMonth: true,
        dateObj: new Date(year, month, i)
      });
    }

    // Next month padding to fill complete grid of 35 or 42
    const totalSlots = days.length <= 35 ? 35 : 42;
    const remaining = totalSlots - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push({
        dayNum: i,
        isCurrentMonth: false,
        dateObj: new Date(year, month + 1, i)
      });
    }

    return days;
  }, [year, month]);

  const events = arenaState?.events || [];

  const eventsByDate = useMemo(() => {
    const map = {};
    for (const evt of events) {
      const key = String(evt.event_date || '').slice(0, 10);
      if (!key) continue;
      if (!map[key]) map[key] = [];
      map[key].push(evt);
    }
    return map;
  }, [events]);

  if (!isOpen) return null;

  const isToday = (d) =>
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear();

  const formattedTimeWithSeconds = now.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });

  const formattedFullDate = now.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  const handlePrevMonth = () => {
    setCurrentViewDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentViewDate(new Date(year, month + 1, 1));
  };

  const handleJumpToday = () => {
    setCurrentViewDate(new Date());
  };

  return createPortal(
    <>
      <div
        className="win-calendar-backdrop"
        onClick={onClose}
        aria-hidden="true"
      />
      <div ref={flyoutRef} className="win-calendar-flyout" role="dialog" aria-label="System Calendar">
      {/* 1. Live Digital Clock & Full Date Header */}
      <div className="cal-header-time-card">
        <div className="cal-digital-clock">
          <Clock size={18} className="card-title-icon-emerald" />
          <span>{formattedTimeWithSeconds}</span>
        </div>
        <div className="cal-digital-date">{formattedFullDate}</div>
      </div>

      {/* 2. Month Selector Navigation */}
      <div className="cal-month-nav">
        <span className="cal-current-month-label">
          {monthNames[month]} {year}
        </span>
        <div className="cal-nav-buttons">
          <button
            type="button"
            className="cal-nav-btn"
            onClick={handleJumpToday}
            title="Jump to Today"
          >
            Today
          </button>
          <button
            type="button"
            className="cal-nav-btn"
            onClick={handlePrevMonth}
            title="Previous Month"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            type="button"
            className="cal-nav-btn"
            onClick={handleNextMonth}
            title="Next Month"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* 3. Days of Week Header */}
      <div className="cal-days-header-row">
        {daysOfWeek.map((d) => (
          <span key={d} className="cal-day-header-cell">
            {d}
          </span>
        ))}
      </div>

      {/* 4. Calendar Days Grid */}
      <div className="cal-days-grid">
        {calendarDays.map((item, idx) => {
          const today = isToday(item.dateObj);
          const iso = toLocalIsoDate(item.dateObj);
          const dayEvents = eventsByDate[iso] || [];
          const hasEvent = dayEvents.length > 0;
          return (
            <button
              key={`${item.dayNum}-${idx}`}
              type="button"
              title={hasEvent ? dayEvents.map((e) => e.title).join(' | ') : undefined}
              onClick={() => {
                if (hasEvent) {
                  setEventDetailModal({ events: dayEvents, initialIndex: 0 });
                }
              }}
              className={`cal-day-cell ${
                !item.isCurrentMonth ? 'is-other-month' : ''
              } ${today ? 'is-today' : ''} ${hasEvent ? 'has-event' : ''}`}
            >
              <span>{item.dayNum}</span>
              {hasEvent && <span className="cal-event-dot" />}
              {today && !hasEvent && <span className="cal-today-dot" />}
            </button>
          );
        })}
      </div>

      {/* 5. Coliseum Derby Events Section */}
      <div className="cal-events-section">
        <div className="cal-events-header">
          <div className="cal-events-title">
            <Trophy size={14} className="card-title-icon-gold" />
            <span>Coliseum Derby Schedule</span>
          </div>
          <button
            type="button"
            className="cal-view-all-events-btn"
            onClick={() => {
              onClose();
              setActiveModuleId('events-schedule');
            }}
          >
            Manage Events
          </button>
        </div>

        <div className="cal-events-list">
          {events.length > 0 ? (
            events.map((evt) => (
              <div
                key={evt.event_id}
                className="cal-event-card"
                onClick={() => {
                  setEventDetailModal({ events: [evt], initialIndex: 0 });
                }}
              >
                <div className="cal-event-color-bar" />
                <div className="cal-event-info">
                  <div className="cal-event-title">{evt.title}</div>
                  <div className="cal-event-sub">
                    {evt.event_date || 'Today'} • {evt.format || evt.game_type || 'Standard Derby'} • Purse: ₱{Number(evt.guaranteed_prize || evt.pot_money || 0).toLocaleString()}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="cal-events-empty">
              <CalendarIcon size={20} className="card-title-icon-emerald" />
              <span>No active derbies scheduled today. Click Manage Events to configure a new derby.</span>
            </div>
          )}
        </div>
      </div>
    </div>

    <EventDetailFullscreenModal
      isOpen={Boolean(eventDetailModal)}
      events={eventDetailModal?.events || []}
      initialIndex={eventDetailModal?.initialIndex || 0}
      onClose={() => setEventDetailModal(null)}
      onNavigateToWorkspace={() => {
        setEventDetailModal(null);
        onClose();
        setActiveModuleId('events-schedule');
      }}
    />
  </>,
  document.body
);
}


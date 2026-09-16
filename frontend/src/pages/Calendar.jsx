import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import './Calendar.css';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

function formatTime(timeStr) {
  const [hours, minutes] = timeStr.split(':');
  const h = parseInt(hours);
  const ampm = h >= 12 ? 'PM' : 'AM';
  return `${h % 12 || 12}:${minutes}${ampm}`;
}

function Calendar() {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth() + 1);
  const [myShifts, setMyShifts] = useState([]);
  const [openSwaps, setOpenSwaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCalendarData();
  }, [viewMonth, viewYear]);

  const fetchCalendarData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/shifts/calendar', {
        params: { month: viewMonth, year: viewYear }
      });
      setMyShifts(res.data.myShifts);
      setOpenSwaps(res.data.openSwaps);
    } catch (err) {
      setMyShifts([]);
      setOpenSwaps([]);
    } finally {
      setLoading(false);
    }
  };

  const prevMonth = () => {
    if (viewMonth === 1) { setViewMonth(12); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };

  const nextMonth = () => {
    if (viewMonth === 12) { setViewMonth(1); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const goToToday = () => {
    setViewMonth(today.getMonth() + 1);
    setViewYear(today.getFullYear());
  };

  // Build a map of dateStr -> events
  const eventMap = {};

  myShifts.forEach(shift => {
    const key = shift.date.split('T')[0];
    if (!eventMap[key]) eventMap[key] = [];
    eventMap[key].push({ type: 'shift', ...shift });
  });

  openSwaps.forEach(swap => {
    const key = swap.date.split('T')[0];
    if (!eventMap[key]) eventMap[key] = [];
    eventMap[key].push({ type: 'swap', ...swap });
  });

  // Build calendar grid
  const firstDay = new Date(viewYear, viewMonth - 1, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth, 0).getDate();
  const daysInPrevMonth = new Date(viewYear, viewMonth - 1, 0).getDate();

  const cells = [];

  // Leading empty cells (days from previous month)
  for (let i = 0; i < firstDay; i++) {
    cells.push({ day: daysInPrevMonth - firstDay + 1 + i, current: false });
  }

  // Days of current month
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${viewYear}-${String(viewMonth).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    cells.push({ day: d, current: true, dateStr, events: eventMap[dateStr] || [] });
  }

  // Trailing cells to complete the last row
  const remaining = 7 - (cells.length % 7);
  if (remaining < 7) {
    for (let i = 1; i <= remaining; i++) {
      cells.push({ day: i, current: false });
    }
  }

  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const totalShifts = myShifts.length;
  const totalSwaps = openSwaps.length;

  return (
    <div className="page cal-page">
      <div className="page-header">
        <h1>Calendar</h1>
      </div>

      <div className="cal-legend">
        <span className="cal-legend-item"><span className="cal-dot cal-dot-shift" />My Shifts</span>
        <span className="cal-legend-item"><span className="cal-dot cal-dot-swap" />Available Swaps</span>
      </div>

      <div className="cal-summary">
        <div className="cal-summary-item">
          <span className="cal-summary-num cal-num-shift">{totalShifts}</span>
          <span className="cal-summary-label">shifts this month</span>
        </div>
        <div className="cal-summary-item">
          <span className="cal-summary-num cal-num-swap">{totalSwaps}</span>
          <span className="cal-summary-label">available swaps</span>
        </div>
      </div>

      <div className="cal-card">
        <div className="cal-nav">
          <button className="cal-nav-btn" onClick={prevMonth}>&#8249;</button>
          <div className="cal-nav-center">
            <span className="cal-month-label">{MONTHS[viewMonth - 1]} {viewYear}</span>
            {(viewMonth !== today.getMonth() + 1 || viewYear !== today.getFullYear()) && (
              <button className="cal-today-btn" onClick={goToToday}>Today</button>
            )}
          </div>
          <button className="cal-nav-btn" onClick={nextMonth}>&#8250;</button>
        </div>

        {loading ? (
          <div className="cal-loading">Loading...</div>
        ) : (
          <div className="cal-grid">
            {DAYS.map(d => (
              <div key={d} className="cal-day-header">{d}</div>
            ))}
            {cells.map((cell, i) => (
              <div
                key={i}
                className={`cal-cell${!cell.current ? ' cal-cell-outside' : ''}${cell.dateStr === todayStr ? ' cal-cell-today' : ''}`}
              >
                <span className="cal-date-num">{cell.day}</span>
                {cell.current && cell.events.map((ev, j) => (
                  ev.type === 'shift' ? (
                    <div key={j} className="cal-event cal-event-shift">
                      <span className="cal-event-time">{formatTime(ev.start_time)}</span>
                      <span className="cal-event-label">{ev.position}</span>
                    </div>
                  ) : (
                    <button
                      key={j}
                      className="cal-event cal-event-swap"
                      onClick={() => navigate('/swaps')}
                      title={`${ev.first_name} ${ev.last_name} is looking for cover`}
                    >
                      <span className="cal-event-time">{formatTime(ev.start_time)}</span>
                      <span className="cal-event-label">{ev.position}</span>
                    </button>
                  )
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Calendar;

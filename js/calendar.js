/**
 * Church of St. Peter - Professional Calendar System v3
 * Advanced recurring event engine with series/exceptions architecture
 * localStorage: st_peter_event_series, st_peter_event_exceptions
 * Version: v3_advanced
 */

class CalendarSystem {
  constructor() {
    // Singleton pattern - only one instance
    if (CalendarSystem.instance) {
      return CalendarSystem.instance;
    }

    // Data storage
    this.eventSeries = [];      // Array of event series (templates)
    this.eventExceptions = [];  // Array of exceptions (edits/deletes)

    // Navigation state (used by events page for month navigation)
    this.currentDate = new Date();
    this.selectedCategory = null;

    // Category definitions
    this.categories = {
      mass: { name: 'Mass', color: '#0d212a', bgColor: '#e8ecf1', icon: 'fa-church' },
      confession: { name: 'Confession', color: '#6b2c91', bgColor: '#f3e8fb', icon: 'fa-hands-praying' },
      prayer: { name: 'Prayer', color: '#1e90ff', bgColor: '#e8f4ff', icon: 'fa-pray' },
      formation: { name: 'Faith Formation', color: '#008b8b', bgColor: '#e8f5f5', icon: 'fa-book-open' },
      youth: { name: 'Youth', color: '#228b22', bgColor: '#e8f5e9', icon: 'fa-users' },
      community: { name: 'Community', color: '#c5a059', bgColor: '#f9f6ed', icon: 'fa-people-group' },
      social: { name: 'Social', color: '#2d8a6e', bgColor: '#e8f5f2', icon: 'fa-mug-hot' },
      service: { name: 'Service', color: '#ff8c00', bgColor: '#ffe8d6', icon: 'fa-hand-holding-heart' },
      holy: { name: 'Holy Days', color: '#dc143c', bgColor: '#ffe8e8', icon: 'fa-star' },
      meeting: { name: 'Meeting', color: '#4c4c4c', bgColor: '#f0f0f0', icon: 'fa-clipboard' },
      school: { name: 'School', color: '#483d8b', bgColor: '#f0e8ff', icon: 'fa-school' }
    };

    // Initialize
    this._initializeStorage();
    this._loadAll();

    CalendarSystem.instance = this;
  }

  /**
   * Initialize storage and version checking
   * Force-clears old data on version change
   */
  _initializeStorage() {
    try {
      const currentVersion = localStorage.getItem('st_peter_cal_version');
      const targetVersion = 'v3_advanced';

      if (currentVersion !== targetVersion) {
        // Clear all old data
        localStorage.removeItem('st_peter_events');
        localStorage.removeItem('st_peter_recurring_events');
        localStorage.removeItem('st_peter_event_series');
        localStorage.removeItem('st_peter_event_exceptions');
        // Set new version
        localStorage.setItem('st_peter_cal_version', targetVersion);
      }
    } catch (e) {
      console.warn('Storage initialization error:', e);
    }
  }

  // ============================================================================
  // EVENT GENERATION - Core recurring event logic
  // ============================================================================

  /**
   * Generate all event instances for a date range
   * Applies recurrence rules and exception overrides
   * Returns sorted array of event instances (with computed dates)
   */
  getEventsForDateRange(startDateStr, endDateStr) {
    const startDate = this._parseDate(startDateStr);
    const endDate = this._parseDate(endDateStr);
    const events = [];

    // For each series, generate instances in the range
    for (const series of this.eventSeries) {
      const instances = this._generateInstancesForRange(series, startDate, endDate);
      events.push(...instances);
    }

    // Sort by date, then by time
    return events.sort((a, b) => {
      const dateCompare = a.date.localeCompare(b.date);
      if (dateCompare !== 0) return dateCompare;
      return (a.startTime || '00:00').localeCompare(b.startTime || '00:00');
    });
  }

  /**
   * Generate events for a single date
   */
  getEventsForDate(dateStr) {
    const startDate = this._parseDate(dateStr);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 1);

    const events = this.getEventsForDateRange(dateStr, this._formatDateObj(endDate));
    return events.filter(e => e.date === dateStr);
  }

  /**
   * Get events for an entire month
   */
  getEventsForMonth(year, month) {
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0);
    return this.getEventsForDateRange(
      this._formatDateObj(startDate),
      this._formatDateObj(endDate)
    );
  }

  /**
   * Get upcoming events for the next N days
   */
  getUpcomingEvents(days = 30) {
    const today = new Date();
    const endDate = new Date(today);
    endDate.setDate(endDate.getDate() + days);

    return this.getEventsForDateRange(
      this._formatDateObj(today),
      this._formatDateObj(endDate)
    );
  }

  /**
   * Generate instances for a series within a date range
   * Respects recurrence rules, start/end dates, and exceptions
   */
  _generateInstancesForRange(series, startDate, endDate) {
    const instances = [];

    if (!series.recurrence) {
      // Non-recurring event
      if (series.date) {
        const eventDate = this._parseDate(series.date);
        if (eventDate >= startDate && eventDate <= endDate) {
          instances.push(this._buildEventInstance(series, series.date));
        }
      }
    } else {
      // Recurring event
      const recurrence = series.recurrence;

      // Determine when to start generating
      const generateStart = new Date(Math.max(
        startDate.getTime(),
        this._parseDate(recurrence.startDate).getTime()
      ));

      // Determine when to stop generating
      let generateEnd = new Date(endDate);
      if (recurrence.endDate) {
        generateEnd = new Date(Math.min(
          generateEnd.getTime(),
          this._parseDate(recurrence.endDate).getTime()
        ));
      }

      // Generate occurrences
      const occurrences = this._computeOccurrences(recurrence, generateStart, generateEnd);

      let count = 0;
      for (const occurrenceDate of occurrences) {
        // Check count limit
        if (recurrence.count && count >= recurrence.count) break;

        const dateStr = this._formatDateObj(occurrenceDate);
        const exception = this._getException(series.id, dateStr);

        // Skip deleted instances
        if (exception && exception.type === 'delete') {
          continue;
        }

        // Create instance, applying edits if present
        const instance = this._buildEventInstance(series, dateStr, exception);
        instances.push(instance);
        count++;
      }
    }

    return instances;
  }

  /**
   * Compute all occurrence dates for a recurrence rule within a range
   * Handles: daily, weekly, biweekly, monthly (by day or pattern), quarterly, yearly
   */
  _computeOccurrences(recurrence, startDate, endDate) {
    const occurrences = [];
    const recStartDate = this._parseDate(recurrence.startDate);
    let currentDate = new Date(recStartDate);

    // Limit iterations to prevent infinite loops
    const maxIterations = 10000;
    let iterations = 0;

    while (currentDate <= endDate && iterations < maxIterations) {
      iterations++;

      if (currentDate >= startDate) {
        occurrences.push(new Date(currentDate));
      }

      // Advance to next occurrence
      currentDate = this._getNextRecurrenceDate(recurrence, currentDate);
      if (!currentDate) break;
    }

    return occurrences;
  }

  /**
   * Get the next occurrence date given a recurrence rule and current date
   */
  _getNextRecurrenceDate(recurrence, currentDate) {
    const next = new Date(currentDate);

    switch (recurrence.type) {
      case 'daily':
        next.setDate(next.getDate() + (recurrence.interval || 1));
        break;

      case 'weekly':
        next.setDate(next.getDate() + 7 * (recurrence.interval || 1));
        break;

      case 'biweekly':
        next.setDate(next.getDate() + 14 * (recurrence.interval || 1));
        break;

      case 'monthly': {
        // Handle both absolute day (dayOfMonth) and pattern (weekOfMonth + dayOfWeekInMonth)
        const interval = recurrence.interval || 1;
        if (recurrence.dayOfMonth !== undefined) {
          // Absolute: e.g., 15th of each month
          next.setMonth(next.getMonth() + interval);
          next.setDate(recurrence.dayOfMonth);
        } else if (recurrence.weekOfMonth !== undefined && recurrence.dayOfWeekInMonth !== undefined) {
          // Pattern: e.g., 2nd Tuesday
          next.setMonth(next.getMonth() + interval);
          next.setDate(1);
          this._setToWeekdayInMonth(next, recurrence.dayOfWeekInMonth, recurrence.weekOfMonth);
        } else {
          // Fallback: same day of month
          next.setMonth(next.getMonth() + interval);
          next.setDate(Math.min(currentDate.getDate(), this._daysInMonth(next)));
        }
        break;
      }

      case 'quarterly':
        next.setMonth(next.getMonth() + 3 * (recurrence.interval || 1));
        break;

      case 'yearly':
        next.setFullYear(next.getFullYear() + (recurrence.interval || 1));
        break;

      case 'custom': {
        const unit = recurrence.unit || 'days';
        const interval = recurrence.interval || 1;
        switch (unit) {
          case 'days':
            next.setDate(next.getDate() + interval);
            break;
          case 'weeks':
            next.setDate(next.getDate() + 7 * interval);
            break;
          case 'months':
            next.setMonth(next.getMonth() + interval);
            break;
          case 'years':
            next.setFullYear(next.getFullYear() + interval);
            break;
        }
        break;
      }

      default:
        return null;
    }

    return next;
  }

  /**
   * Set a date to a specific weekday within a month
   * weekOfMonth: 1-5 (1st, 2nd, etc.), -1 for last
   * dayOfWeek: 0-6 (Sun-Sat)
   */
  _setToWeekdayInMonth(date, dayOfWeek, weekOfMonth) {
    date.setDate(1);
    let firstMatch = null;

    // Find first occurrence of the weekday
    while (date.getDay() !== dayOfWeek) {
      date.setDate(date.getDate() + 1);
    }
    firstMatch = date.getDate();

    if (weekOfMonth > 0) {
      // Nth weekday of month
      date.setDate(firstMatch + (weekOfMonth - 1) * 7);
    } else if (weekOfMonth === -1) {
      // Last weekday of month
      date.setDate(firstMatch + 4 * 7); // Go to 5th occurrence
      if (date.getMonth() !== new Date(date).getMonth()) {
        // We've gone into next month, back up a week
        date.setDate(date.getDate() - 7);
      }
    }
  }

  /**
   * Build a single event instance (with computed fields)
   * Merges series data with any exception overrides
   */
  _buildEventInstance(series, dateStr, exception = null) {
    const instance = {
      // Series identity
      seriesId: series.id,
      isRecurring: !!series.recurrence,

      // Core fields
      id: `${series.id}_${dateStr}`, // Unique ID for this instance
      date: dateStr,
      title: series.title,
      description: series.description,
      location: series.location,
      category: series.category,
      startTime: series.startTime,
      endTime: series.endTime,

      // Metadata
      createdAt: series.createdAt,
      updatedAt: series.updatedAt,
      icsUid: series.icsUid,
      importSource: series.importSource
    };

    // Apply exception overrides if present
    if (exception && exception.type === 'edit') {
      if (exception.title !== undefined) instance.title = exception.title;
      if (exception.description !== undefined) instance.description = exception.description;
      if (exception.location !== undefined) instance.location = exception.location;
      if (exception.category !== undefined) instance.category = exception.category;
      if (exception.startTime !== undefined) instance.startTime = exception.startTime;
      if (exception.endTime !== undefined) instance.endTime = exception.endTime;
      if (exception.date !== undefined) instance.date = exception.date; // Move to different date
    }

    return instance;
  }

  // ============================================================================
  // CRUD OPERATIONS
  // ============================================================================

  /**
   * Create a new event series
   */
  addEvent(eventData) {
    const now = new Date().toISOString();
    const event = {
      id: eventData.id || this._generateId(),
      title: eventData.title || '',
      description: eventData.description || '',
      location: eventData.location || '',
      category: eventData.category || 'meeting',
      startTime: eventData.startTime || '09:00',
      endTime: eventData.endTime || null,

      // Non-recurring
      date: eventData.date || null,

      // Recurring
      recurrence: eventData.recurrence || null,

      // ICS metadata
      icsUid: eventData.icsUid || null,
      importSource: eventData.importSource || null,

      // Timestamps
      createdAt: eventData.createdAt || now,
      updatedAt: eventData.updatedAt || now
    };

    this.eventSeries.push(event);
    this._saveAll();
    return event;
  }

  /**
   * Update an entire event series (affects all future instances)
   */
  updateEvent(seriesId, updates) {
    const index = this.eventSeries.findIndex(e => e.id === seriesId);
    if (index === -1) return false;

    this.eventSeries[index] = {
      ...this.eventSeries[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    this._saveAll();
    return true;
  }

  /**
   * Create/update an exception for a specific instance
   * Used for editing a single occurrence without affecting the series
   */
  updateEventInstance(seriesId, originalDate, updates) {
    const existingIndex = this.eventExceptions.findIndex(
      e => e.seriesId === seriesId && e.originalDate === originalDate
    );

    const exception = {
      seriesId,
      originalDate,
      type: 'edit',
      ...updates
    };

    if (existingIndex !== -1) {
      this.eventExceptions[existingIndex] = exception;
    } else {
      this.eventExceptions.push(exception);
    }

    this._saveAll();
    return exception;
  }

  /**
   * Delete an entire event series and all its exceptions
   */
  deleteEvent(seriesId) {
    this.eventSeries = this.eventSeries.filter(e => e.id !== seriesId);
    this.eventExceptions = this.eventExceptions.filter(e => e.seriesId !== seriesId);
    this._saveAll();
    return true;
  }

  /**
   * Delete a single instance by creating a delete exception
   */
  deleteEventInstance(seriesId, originalDate) {
    // Check if exception already exists
    const existingIndex = this.eventExceptions.findIndex(
      e => e.seriesId === seriesId && e.originalDate === originalDate
    );

    if (existingIndex !== -1) {
      // Update to delete type
      this.eventExceptions[existingIndex].type = 'delete';
    } else {
      // Create delete exception
      this.eventExceptions.push({
        seriesId,
        originalDate,
        type: 'delete'
      });
    }

    this._saveAll();
    return true;
  }

  /**
   * Delete all instances of a recurring event from a date forward
   * Implemented by setting series endDate and creating delete exceptions
   */
  deleteEventFromDateForward(seriesId, fromDateStr) {
    const series = this.eventSeries.find(e => e.id === seriesId);
    if (!series || !series.recurrence) return false;

    // Set series end date to day before fromDate
    const beforeDate = new Date(this._parseDate(fromDateStr));
    beforeDate.setDate(beforeDate.getDate() - 1);

    series.recurrence.endDate = this._formatDateObj(beforeDate);
    series.updatedAt = new Date().toISOString();

    // Delete any exceptions on or after fromDate
    this.eventExceptions = this.eventExceptions.filter(
      e => !(e.seriesId === seriesId && e.originalDate >= fromDateStr)
    );

    this._saveAll();
    return true;
  }

  // ============================================================================
  // RECURRING EVENT HELPERS
  // ============================================================================

  /**
   * Get human-readable recurrence summary
   * e.g., "Every Tuesday", "Every 2nd Monday of the month", "Daily"
   */
  getRecurrenceSummary(series) {
    if (!series.recurrence) return 'One-time event';

    const r = series.recurrence;
    const interval = r.interval || 1;
    const plural = interval > 1 ? 's' : '';

    switch (r.type) {
      case 'daily':
        return interval === 1 ? 'Daily' : `Every ${interval} days`;

      case 'weekly': {
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        if (r.daysOfWeek && r.daysOfWeek.length > 0) {
          const names = r.daysOfWeek.map(d => dayNames[d]);
          return `Every ${names.join(', ')}`;
        }
        return interval === 1 ? 'Weekly' : `Every ${interval} weeks`;
      }

      case 'biweekly':
        return interval === 1 ? 'Every 2 weeks' : `Every ${interval * 2} weeks`;

      case 'monthly': {
        if (r.dayOfMonth) {
          return `Monthly on the ${this._ordinalDay(r.dayOfMonth)}`;
        } else if (r.weekOfMonth && r.dayOfWeekInMonth) {
          const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
          const position = ['', '1st', '2nd', '3rd', '4th', '5th', 'last'];
          const pos = r.weekOfMonth === -1 ? 'last' : position[r.weekOfMonth];
          const day = dayNames[r.dayOfWeekInMonth];
          return `Monthly on the ${pos} ${day}`;
        }
        return 'Monthly';
      }

      case 'quarterly':
        return interval === 1 ? 'Quarterly' : `Every ${interval * 3} months`;

      case 'yearly':
        return interval === 1 ? 'Yearly' : `Every ${interval} years`;

      case 'custom':
        return `Every ${interval} ${r.unit || 'days'}`;

      default:
        return 'Recurring';
    }
  }

  /**
   * Get next occurrence date after a given date
   */
  getNextOccurrence(series, afterDateStr) {
    if (!series.recurrence) {
      const eventDate = this._parseDate(series.date);
      const afterDate = this._parseDate(afterDateStr);
      if (eventDate > afterDate) return series.date;
      return null;
    }

    const afterDate = this._parseDate(afterDateStr);
    let currentDate = new Date(afterDate);
    currentDate.setDate(currentDate.getDate() + 1);

    // Look ahead up to 5 years
    const maxDate = new Date();
    maxDate.setFullYear(maxDate.getFullYear() + 5);

    const occurrences = this._computeOccurrences(series.recurrence, currentDate, maxDate);
    if (occurrences.length > 0) {
      return this._formatDateObj(occurrences[0]);
    }

    return null;
  }

  /**
   * Get all exceptions for a series
   */
  getAllExceptionsForSeries(seriesId) {
    return this.eventExceptions.filter(e => e.seriesId === seriesId);
  }

  // ============================================================================
  // ICS IMPORT/EXPORT
  // ============================================================================

  /**
   * Import events from ICS format
   * Returns array of parsed events (does NOT auto-save)
   * Caller can review and decide whether to import
   */
  importICS(icsString) {
    const parsed = [];
    const events = icsString.split('BEGIN:VEVENT');

    for (let i = 1; i < events.length; i++) {
      const eventBlock = 'BEGIN:VEVENT' + events[i];
      const event = this._parseICSEvent(eventBlock);
      if (event) {
        parsed.push(event);
      }
    }

    return parsed;
  }

  /**
   * Parse a single VEVENT block from ICS
   */
  _parseICSEvent(eventBlock) {
    try {
      const event = {
        title: '',
        description: '',
        location: '',
        category: 'meeting',
        startTime: '09:00',
        endTime: null,
        date: null,
        recurrence: null,
        icsUid: null,
        importSource: 'ICS Import'
      };

      // Extract fields
      const titleMatch = eventBlock.match(/SUMMARY:(.+?)(?:\r?\n|$)/);
      if (titleMatch) event.title = titleMatch[1].trim();

      const descMatch = eventBlock.match(/DESCRIPTION:(.+?)(?:\r?\n|$)/);
      if (descMatch) event.description = descMatch[1].trim();

      const locMatch = eventBlock.match(/LOCATION:(.+?)(?:\r?\n|$)/);
      if (locMatch) event.location = locMatch[1].trim();

      const uidMatch = eventBlock.match(/UID:(.+?)(?:\r?\n|$)/);
      if (uidMatch) event.icsUid = uidMatch[1].trim();

      // Parse dates
      const dtStartMatch = eventBlock.match(/DTSTART(?:;[^:]*)?:(.+?)(?:\r?\n|$)/);
      const dtEndMatch = eventBlock.match(/DTEND(?:;[^:]*)?:(.+?)(?:\r?\n|$)/);

      if (dtStartMatch) {
        const dtStart = dtStartMatch[1];
        const parsed = this._parseICSDateTime(dtStart);
        event.date = parsed.date;
        event.startTime = parsed.time;
      }

      if (dtEndMatch) {
        const dtEnd = dtEndMatch[1];
        const parsed = this._parseICSDateTime(dtEnd);
        event.endTime = parsed.time;
      }

      // Parse recurrence
      const rruleMatch = eventBlock.match(/RRULE:(.+?)(?:\r?\n|$)/);
      if (rruleMatch) {
        event.recurrence = this.parseICSRecurrence(rruleMatch[1]);
        if (event.recurrence) {
          event.recurrence.startDate = event.date;
        }
      }

      return event.title ? event : null;
    } catch (e) {
      console.warn('Error parsing ICS event:', e);
      return null;
    }
  }

  /**
   * Parse DTSTART/DTEND value (handles DATE and DATE-TIME formats)
   * Returns { date: "YYYY-MM-DD", time: "HH:MM" }
   */
  _parseICSDateTime(dtValue) {
    // Format: 20260319 or 20260319T093000 or 20260319T093000Z
    const dateMatch = dtValue.match(/(\d{4})(\d{2})(\d{2})/);
    let result = { date: '2026-03-19', time: '09:00' };

    if (dateMatch) {
      const year = dateMatch[1];
      const month = dateMatch[2];
      const day = dateMatch[3];
      result.date = `${year}-${month}-${day}`;

      const timeMatch = dtValue.match(/T(\d{2})(\d{2})(\d{2})/);
      if (timeMatch) {
        result.time = `${timeMatch[1]}:${timeMatch[2]}`;
      }
    }

    return result;
  }

  /**
   * Parse RRULE string and convert to our recurrence format
   * Example: "FREQ=WEEKLY;BYDAY=MO,WE;UNTIL=20261231"
   */
  parseICSRecurrence(rruleString) {
    try {
      const params = {};
      const parts = rruleString.split(';');

      for (const part of parts) {
        const [key, value] = part.split('=');
        params[key] = value;
      }

      const recurrence = {
        type: 'weekly',
        interval: parseInt(params.INTERVAL) || 1,
        unit: 'weeks',
        startDate: '2026-03-19',
        endDate: null,
        count: null
      };

      // Parse FREQ
      const freqMap = {
        'DAILY': 'daily',
        'WEEKLY': 'weekly',
        'MONTHLY': 'monthly',
        'YEARLY': 'yearly'
      };
      if (params.FREQ) {
        recurrence.type = freqMap[params.FREQ] || 'weekly';
        recurrence.unit = params.FREQ === 'DAILY' ? 'days'
                        : params.FREQ === 'WEEKLY' ? 'weeks'
                        : params.FREQ === 'MONTHLY' ? 'months'
                        : 'years';
      }

      // Parse BYDAY
      if (params.BYDAY) {
        const dayMap = { 'SU': 0, 'MO': 1, 'TU': 2, 'WE': 3, 'TH': 4, 'FR': 5, 'SA': 6 };
        recurrence.daysOfWeek = params.BYDAY.split(',').map(d => dayMap[d] || 0);
      }

      // Parse UNTIL
      if (params.UNTIL) {
        const m = params.UNTIL.match(/(\d{4})(\d{2})(\d{2})/);
        if (m) {
          recurrence.endDate = `${m[1]}-${m[2]}-${m[3]}`;
        }
      }

      // Parse COUNT
      if (params.COUNT) {
        recurrence.count = parseInt(params.COUNT);
      }

      return recurrence;
    } catch (e) {
      console.warn('Error parsing RRULE:', e);
      return null;
    }
  }

  /**
   * Generate RRULE string from our recurrence format
   */
  generateRRULE(recurrence) {
    if (!recurrence) return '';

    let rrule = `FREQ=${this._recurrenceTypeToFreq(recurrence.type)}`;

    if (recurrence.interval && recurrence.interval > 1) {
      rrule += `;INTERVAL=${recurrence.interval}`;
    }

    if (recurrence.daysOfWeek && recurrence.daysOfWeek.length > 0) {
      const dayMap = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];
      const days = recurrence.daysOfWeek.map(d => dayMap[d]).join(',');
      rrule += `;BYDAY=${days}`;
    }

    if (recurrence.endDate) {
      const dateStr = recurrence.endDate.replace(/-/g, '');
      rrule += `;UNTIL=${dateStr}`;
    }

    if (recurrence.count) {
      rrule += `;COUNT=${recurrence.count}`;
    }

    return rrule;
  }

  /**
   * Convert recurrence type to ICS FREQ
   */
  _recurrenceTypeToFreq(type) {
    const map = {
      'daily': 'DAILY',
      'weekly': 'WEEKLY',
      'biweekly': 'WEEKLY',
      'monthly': 'MONTHLY',
      'quarterly': 'MONTHLY',
      'yearly': 'YEARLY',
      'custom': 'DAILY'
    };
    return map[type] || 'WEEKLY';
  }

  /**
   * Export events to ICS format
   * Generates a complete VCALENDAR
   */
  exportICS(startDateStr, endDateStr) {
    const events = this.getEventsForDateRange(startDateStr, endDateStr);
    const now = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

    let ics = 'BEGIN:VCALENDAR\r\n';
    ics += 'VERSION:2.0\r\n';
    ics += 'PRODID:-//Church of St. Peter//Calendar//EN\r\n';
    ics += `DTSTAMP:${now}\r\n`;
    ics += 'CALSCALE:GREGORIAN\r\n';

    for (const event of events) {
      ics += 'BEGIN:VEVENT\r\n';
      ics += `UID:${event.icsUid || event.id}@stpeter.local\r\n`;
      ics += `DTSTAMP:${now}\r\n`;
      ics += `DTSTART:${event.date.replace(/-/g, '')}T${(event.startTime || '090000').replace(':', '')}\r\n`;
      if (event.endTime) {
        ics += `DTEND:${event.date.replace(/-/g, '')}T${event.endTime.replace(':', '')}\r\n`;
      }
      ics += `SUMMARY:${this._escapeICS(event.title)}\r\n`;
      if (event.description) {
        ics += `DESCRIPTION:${this._escapeICS(event.description)}\r\n`;
      }
      if (event.location) {
        ics += `LOCATION:${this._escapeICS(event.location)}\r\n`;
      }
      ics += 'END:VEVENT\r\n';
    }

    ics += 'END:VCALENDAR\r\n';
    return ics;
  }

  /**
   * Escape ICS special characters
   */
  _escapeICS(str) {
    if (!str) return '';
    return str.replace(/\\/g, '\\\\')
              .replace(/\n/g, '\\n')
              .replace(/;/g, '\\;')
              .replace(/,/g, '\\,');
  }

  // ============================================================================
  // DATA MANAGEMENT (persistence)
  // ============================================================================

  /**
   * Save all data to localStorage
   */
  _saveAll() {
    this._saveSeries();
    this._saveExceptions();
  }

  /**
   * Load all data from localStorage
   */
  _loadAll() {
    this._loadSeries();
    this._loadExceptions();
  }

  /**
   * Save event series
   */
  _saveSeries() {
    try {
      localStorage.setItem('st_peter_event_series', JSON.stringify(this.eventSeries));
    } catch (e) {
      console.warn('Could not save event series:', e);
    }
  }

  /**
   * Load event series
   */
  _loadSeries() {
    try {
      const stored = localStorage.getItem('st_peter_event_series');
      this.eventSeries = stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.warn('Could not load event series:', e);
      this.eventSeries = [];
    }
  }

  /**
   * Save event exceptions
   */
  _saveExceptions() {
    try {
      localStorage.setItem('st_peter_event_exceptions', JSON.stringify(this.eventExceptions));
    } catch (e) {
      console.warn('Could not save event exceptions:', e);
    }
  }

  /**
   * Load event exceptions
   */
  _loadExceptions() {
    try {
      const stored = localStorage.getItem('st_peter_event_exceptions');
      this.eventExceptions = stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.warn('Could not load event exceptions:', e);
      this.eventExceptions = [];
    }
  }

  /**
   * Full data export as JSON
   */
  exportJSON() {
    return {
      version: 'v3_advanced',
      exportDate: new Date().toISOString(),
      eventSeries: this.eventSeries,
      eventExceptions: this.eventExceptions
    };
  }

  /**
   * Full data import from JSON
   */
  importJSON(data) {
    if (data.eventSeries && Array.isArray(data.eventSeries)) {
      this.eventSeries = data.eventSeries;
    }
    if (data.eventExceptions && Array.isArray(data.eventExceptions)) {
      this.eventExceptions = data.eventExceptions;
    }
    this._saveAll();
    return true;
  }

  /**
   * Clear all calendar data
   */
  clearAll() {
    this.eventSeries = [];
    this.eventExceptions = [];
    this._saveAll();
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Format time string "17:30" → "5:30 PM"
   */
  formatTime(timeStr) {
    if (!timeStr) return '';
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours, 10);
    const minute = parseInt(minutes, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${String(minute).padStart(2, '0')} ${ampm}`;
  }

  /**
   * Format Date object to "YYYY-MM-DD"
   */
  formatDate(dateObj) {
    return this._formatDateObj(dateObj);
  }

  /**
   * Format date string "2026-03-19" → "Wednesday, March 19"
   */
  formatDateDisplay(dateStr) {
    const date = this._parseDate(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  }

  /**
   * Check if a date string is today
   */
  isToday(dateStr) {
    const today = this._formatDateObj(new Date());
    return dateStr === today;
  }

  /**
   * Get month and year string "March 2026"
   */
  getMonthYearString(dateObj) {
    return dateObj.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }

  // ============================================================================
  // PRIVATE HELPERS
  // ============================================================================

  /**
   * Get exception for a series instance
   */
  _getException(seriesId, dateStr) {
    return this.eventExceptions.find(
      e => e.seriesId === seriesId && e.originalDate === dateStr
    );
  }

  /**
   * Generate unique ID
   */
  _generateId() {
    return 'evt_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  /**
   * Parse date string "2026-03-19" to Date object (midnight UTC)
   */
  _parseDate(dateStr) {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
  }

  /**
   * Format Date object to "YYYY-MM-DD"
   */
  _formatDateObj(dateObj) {
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Get days in month
   */
  _daysInMonth(dateObj) {
    return new Date(dateObj.getFullYear(), dateObj.getMonth() + 1, 0).getDate();
  }

  /**
   * Convert day number to ordinal string
   */
  _ordinalDay(day) {
    const j = day % 10;
    const k = day % 100;
    if (j === 1 && k !== 11) return day + 'st';
    if (j === 2 && k !== 12) return day + 'nd';
    if (j === 3 && k !== 13) return day + 'rd';
    return day + 'th';
  }

  // ======================================
  // NAVIGATION STATE (used by events page)
  // ======================================

  previousMonth() {
    this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() - 1, 1);
  }

  nextMonth() {
    this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 1);
  }

  goToToday() {
    this.currentDate = new Date();
  }

  // Public alias for save (admin page uses this)
  saveAll() {
    this._saveAll();
  }
}

// ============================================================================
// SINGLETON PATTERN & GLOBAL EXPORT
// ============================================================================

let calendarSystem = null;

/**
 * Get the global calendar system instance
 * Creates one if it doesn't exist
 */
function getCalendarSystem() {
  if (!calendarSystem) {
    calendarSystem = new CalendarSystem();
  }
  return calendarSystem;
}

// Initialize on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    getCalendarSystem();
  });
} else {
  // Page already loaded
  getCalendarSystem();
}

// Export to window for external access
if (typeof window !== 'undefined') {
  window.getCalendarSystem = getCalendarSystem;
  window.CalendarSystem = CalendarSystem;
}

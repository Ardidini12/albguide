import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { apiFetch, authHeader } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { AvailabilityCalendar } from '../components/AvailabilityCalendar';
import { format } from 'date-fns';

type AvailabilityRule = {
  id: string;
  package_id: string;
  availability_type: 'always' | 'date_range' | 'specific_dates' | 'always_except';
  start_date?: string | null;
  end_date?: string | null;
  excluded_weekdays?: number[];
  specific_dates?: string[];
  is_open: boolean;
  created_at: string;
  updated_at: string;
};

export function AdminPackageAvailabilityPage() {
  const { token } = useAuth();
  const { id } = useParams();

  const [availability, setAvailability] = useState<AvailabilityRule | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [availabilityType, setAvailabilityType] = useState<'always' | 'date_range' | 'specific_dates' | 'always_except'>('always');
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [excludedWeekdays, setExcludedWeekdays] = useState<number[]>([]);
  const [specificDates, setSpecificDates] = useState<Date[]>([]);
  const [isOpen, setIsOpen] = useState(true);

  const load = async () => {
    if (!id) return;
    setError(null);
    setLoading(true);
    try {
      const data = await apiFetch(`/admin/packages/${encodeURIComponent(id)}/availability`, { headers: authHeader(token) });
      const rule = data.availability;
      setAvailability(rule);
      
      if (rule) {
        setAvailabilityType(rule.availability_type);
        if (rule.start_date) {
          const [y, m, d] = rule.start_date.split('-');
          setStartDate(new Date(Number(y), Number(m) - 1, Number(d)));
        } else {
          setStartDate(undefined);
        }
        if (rule.end_date) {
          const [y, m, d] = rule.end_date.split('-');
          setEndDate(new Date(Number(y), Number(m) - 1, Number(d)));
        } else {
          setEndDate(undefined);
        }
        setExcludedWeekdays(rule.excluded_weekdays || []);
        if (rule.specific_dates) {
          setSpecificDates(rule.specific_dates.map((dateStr: string) => {
            const [y, m, d] = dateStr.split('-');
            return new Date(Number(y), Number(m) - 1, Number(d));
          }));
        } else {
          setSpecificDates([]);
        }
        setIsOpen(rule.is_open);
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  const weekdayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const toggleWeekday = (day: number) => {
    setExcludedWeekdays(prev => 
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setError(null);

    if (availabilityType === 'date_range') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (startDate && startDate < today) {
        setError('Start date cannot be in the past');
        return;
      }
      
      if (endDate && startDate && endDate < startDate) {
        setError('End date must be after start date');
        return;
      }
    }

    try {
      await apiFetch(`/admin/packages/${encodeURIComponent(id)}/availability`, {
        method: 'POST',
        headers: authHeader(token),
        body: JSON.stringify({
          availability_type: availabilityType,
          start_date: startDate ? format(startDate, 'yyyy-MM-dd') : null,
          end_date: endDate ? format(endDate, 'yyyy-MM-dd') : null,
          excluded_weekdays: excludedWeekdays,
          specific_dates: specificDates.map(d => format(d, 'yyyy-MM-dd')),
          is_open: isOpen,
        }),
      });
      await load();
    } catch (e2) {
      setError((e2 as Error).message);
    }
  };

  const onDelete = async () => {
    if (!confirm('Delete availability settings for this package?')) return;
    setError(null);

    try {
      await apiFetch(`/admin/packages/${encodeURIComponent(id!)}/availability`, {
        method: 'DELETE',
        headers: authHeader(token),
      });
      setAvailability(null);
      setAvailabilityType('always');
      setStartDate(undefined);
      setEndDate(undefined);
      setExcludedWeekdays([]);
      setSpecificDates([]);
      setIsOpen(true);
    } catch (e) {
      setError((e as Error).message);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="bg-white border rounded-2xl p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <Link to="/admin" className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-red-700 mb-2">
                ← Back to Dashboard
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">Package Availability</h1>
              <div className="mt-1 text-sm text-gray-600">Package ID: {id}</div>
            </div>
            <div className="flex items-center gap-2">
              <Link to="/admin/packages" className="px-3 py-2 rounded-md border text-sm hover:bg-gray-50">
                Back to Packages
              </Link>
              <button onClick={load} className="px-3 py-2 rounded-md border text-sm hover:bg-gray-50">
                Refresh
              </button>
            </div>
          </div>

          {error && (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">{error}</div>
          )}

          {loading ? (
            <div className="mt-6 text-gray-600">Loading…</div>
          ) : (
            <form onSubmit={onSave} className="mt-6 space-y-6">
              <div className="rounded-xl border p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Availability Settings</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Availability Type</label>
                    <select 
                      value={availabilityType} 
                      onChange={(e) => setAvailabilityType(e.target.value as any)}
                      className="w-full rounded-md border px-3 py-2"
                    >
                      <option value="always">Always Available</option>
                      <option value="date_range">Available Between Dates</option>
                      <option value="specific_dates">Specific Dates Only</option>
                      <option value="always_except">Always Available Except Certain Days</option>
                    </select>
                  </div>

                  {availabilityType === 'date_range' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                        <input
                          type="date"
                          value={startDate ? format(startDate, 'yyyy-MM-dd') : ''}
                          onChange={(e) => {
                            if (e.target.value) {
                              const [y, m, d] = e.target.value.split('-');
                              setStartDate(new Date(Number(y), Number(m) - 1, Number(d)));
                            } else {
                              setStartDate(undefined);
                            }
                          }}
                          min={format(new Date(), 'yyyy-MM-dd')}
                          className="w-full rounded-md border px-3 py-2"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                        <input
                          type="date"
                          value={endDate ? format(endDate, 'yyyy-MM-dd') : ''}
                          onChange={(e) => {
                            if (e.target.value) {
                              const [y, m, d] = e.target.value.split('-');
                              setEndDate(new Date(Number(y), Number(m) - 1, Number(d)));
                            } else {
                              setEndDate(undefined);
                            }
                          }}
                          min={startDate ? format(startDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd')}
                          className="w-full rounded-md border px-3 py-2"
                          required
                        />
                      </div>
                    </div>
                  )}

                  {availabilityType === 'always_except' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Exclude These Days</label>
                      <div className="flex flex-wrap gap-2">
                        {weekdayNames.map((name, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => toggleWeekday(idx)}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                              excludedWeekdays.includes(idx)
                                ? 'bg-red-700 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {availabilityType === 'specific_dates' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Select Specific Dates</label>
                      <div className="border rounded-lg p-4">
                        <AvailabilityCalendar
                          availability={null}
                          mode="multiple"
                          selectedDates={specificDates}
                          onDateSelect={(dates) => {
                            if (Array.isArray(dates)) {
                              setSpecificDates(dates.filter((d): d is Date => d instanceof Date));
                            } else if (dates instanceof Date) {
                              setSpecificDates([dates]);
                            } else {
                              setSpecificDates([]);
                            }
                          }}
                          isAdminView={true}
                        />
                      </div>
                      {specificDates.length > 0 && (
                        <div className="mt-3 text-sm text-gray-600">
                          Selected {specificDates.length} date{specificDates.length !== 1 ? 's' : ''}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="is-open"
                      checked={isOpen}
                      onChange={(e) => setIsOpen(e.target.checked)}
                      className="rounded"
                    />
                    <label htmlFor="is-open" className="text-sm font-medium text-gray-700">
                      Package is Open for Bookings
                    </label>
                  </div>
                </div>

                <div className="mt-6 flex items-center gap-3">
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-md bg-red-700 text-white text-sm font-medium hover:bg-red-600"
                  >
                    Save Availability
                  </button>
                  {availability && (
                    <button
                      type="button"
                      onClick={onDelete}
                      className="px-4 py-2 rounded-md border border-red-700 text-red-700 text-sm font-medium hover:bg-red-50"
                    >
                      Delete Settings
                    </button>
                  )}
                </div>
              </div>

              {availability && (
                <div className="rounded-xl border p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Preview Calendar</h2>
                  <p className="text-sm text-gray-600 mb-4">
                    Green dates are available for booking. This is how customers will see availability.
                  </p>
                  <AvailabilityCalendar availability={availability} />
                </div>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

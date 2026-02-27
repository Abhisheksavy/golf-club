import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useRental } from "../../context/RentalContext";
import { getAvailableDates } from "../../api/courses";

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const toDateStr = (year: number, month: number, day: number): string => {
  const mm = String(month).padStart(2, "0");
  const dd = String(day).padStart(2, "0");
  return `${year}-${mm}-${dd}`;
};

const SelectDate = () => {
  const navigate = useNavigate();
  const { selectedCourse, selectedDate, setDate } = useRental();

  const now = new Date();
  const todayStr = toDateStr(
    now.getFullYear(),
    now.getMonth() + 1,
    now.getDate()
  );

  const [displayYear, setDisplayYear] = useState(now.getFullYear());
  const [displayMonth, setDisplayMonth] = useState(now.getMonth() + 1); // 1-indexed

  const {
    data: availableDates,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["availableDates", selectedCourse?.id, displayYear, displayMonth],
    queryFn: () =>
      getAvailableDates(selectedCourse!.id, displayYear, displayMonth),
    enabled: !!selectedCourse,
  });

  // Month navigation helpers
  const isCurrentMonth =
    displayYear === now.getFullYear() && displayMonth === now.getMonth() + 1;

  const prevMonth = () => {
    if (isCurrentMonth) return;
    if (displayMonth === 1) {
      setDisplayYear((y) => y - 1);
      setDisplayMonth(12);
    } else {
      setDisplayMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (displayMonth === 12) {
      setDisplayYear((y) => y + 1);
      setDisplayMonth(1);
    } else {
      setDisplayMonth((m) => m + 1);
    }
  };

  // Build calendar cells
  const daysInMonth = new Date(displayYear, displayMonth, 0).getDate();
  const firstDow = new Date(displayYear, displayMonth - 1, 1).getDay(); // 0=Sun
  const cells: (number | null)[] = [
    ...Array(firstDow).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const monthName = new Date(displayYear, displayMonth - 1, 1).toLocaleString(
    "default",
    { month: "long" }
  );

  const handleDayClick = (day: number) => {
    const dateStr = toDateStr(displayYear, displayMonth, day);
    const isPast = dateStr < todayStr;
    if (isPast) return;

    if (selectedCourse && !isError && availableDates) {
      if (!availableDates.includes(dateStr)) return;
    }

    setDate(dateStr === selectedDate ? null : dateStr);
  };

  const handleNext = () => {
    if (selectedDate) navigate("/reserve/auth");
  };

  const handleSkip = () => {
    setDate(null);
    navigate("/reserve/auth");
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-golf-yellow mb-2">Select a Date</h1>
      <p className="text-white/60 mb-6">
        {selectedCourse ? (
          <>
            Choose your rental date at{" "}
            <span className="font-medium text-white">
              {selectedCourse.name}
            </span>
            , or skip.
          </>
        ) : (
          "Choose a rental date, or skip if you're not sure yet."
        )}
      </p>

      <div className="bg-white/10 rounded-lg border border-white/20 p-6 max-w-sm select-none">
        {/* Month header */}
        <div className="flex items-center justify-between mb-4">
          <button
            type="button"
            onClick={prevMonth}
            disabled={isCurrentMonth}
            className="p-1 rounded hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            aria-label="Previous month"
          >
            <svg
              className="w-5 h-5 text-white/70"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          <span className="text-sm font-semibold text-white">
            {monthName} {displayYear}
          </span>

          <button
            type="button"
            onClick={nextMonth}
            className="p-1 rounded hover:bg-white/10 transition-colors"
            aria-label="Next month"
          >
            <svg
              className="w-5 h-5 text-white/70"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>

        {/* Day-of-week labels */}
        <div className="grid grid-cols-7 mb-1">
          {DAY_LABELS.map((label) => (
            <div
              key={label}
              className="text-center text-xs font-medium text-white/50 py-1"
            >
              {label}
            </div>
          ))}
        </div>

        {/* Calendar grid with optional loading overlay */}
        <div className="relative">
          <div className="grid grid-cols-7 gap-y-1">
            {cells.map((day, idx) => {
              if (day === null) {
                return <div key={`empty-${idx}`} />;
              }

              const dateStr = toDateStr(displayYear, displayMonth, day);
              const isPast = dateStr < todayStr;
              const isToday = dateStr === todayStr;
              const isSelected = dateStr === selectedDate;
              // If the API errored or data isn't loaded yet, don't restrict dates
              const isAvailable =
                !selectedCourse ||
                isError ||
                !availableDates ||
                availableDates.includes(dateStr);
              const isUnavailable =
                !!selectedCourse &&
                !isError &&
                !!availableDates &&
                !isAvailable &&
                !isPast;

              let cellClass =
                "w-8 h-8 mx-auto flex items-center justify-center text-sm rounded-full transition-colors ";

              if (isSelected) {
                cellClass += "bg-[#FBE118] text-[#285610] font-semibold";
              } else if (isPast || isUnavailable) {
                cellClass += "text-white/20 cursor-default";
                if (isUnavailable) cellClass += " line-through";
              } else {
                cellClass +=
                  "text-white cursor-pointer hover:bg-white/10";
                if (isToday) cellClass += " ring-1 ring-golf-400";
              }

              return (
                <div
                  key={dateStr}
                  className="flex items-center justify-center py-0.5"
                >
                  <button
                    type="button"
                    onClick={() => handleDayClick(day)}
                    disabled={isPast || isUnavailable}
                    className={cellClass}
                    aria-label={dateStr}
                    aria-pressed={isSelected}
                  >
                    {day}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Loading overlay */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-golf-dark/60 rounded">
              <svg
                className="animate-spin h-5 w-5 text-golf-yellow"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8H4z"
                />
              </svg>
            </div>
          )}
        </div>

        {/* Selected date display */}
        {selectedDate && (
          <p className="mt-4 text-center text-sm text-golf-yellow font-medium">
            Selected:{" "}
            {new Date(selectedDate + "T00:00:00").toLocaleDateString(
              "default",
              {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric",
              }
            )}
          </p>
        )}
      </div>

      <div className="flex justify-between mt-8">
        <button
          onClick={() => navigate("/reserve/course")}
          className="btn-secondary"
        >
          Back
        </button>
        <div className="flex gap-3">
          <button onClick={handleSkip} className="btn-secondary">
            Skip — No specific date
          </button>
          <button
            onClick={handleNext}
            disabled={!selectedDate}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default SelectDate;

import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useQuery } from "@tanstack/react-query";
import type { Club, Course } from "../types";
import {
  useFavouriteSets,
  useFavouriteSetDetail,
} from "../hooks/useFavouriteSets";
import { getCourses, getAvailableDatesForBag } from "../api/courses";
import { useRental } from "../context/RentalContext";
import SaveSetModal from "../components/ui/SaveSetModal";
import ConfirmModal from "../components/ui/ConfirmModal";

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const toDateStr = (year: number, month: number, day: number): string => {
  const mm = String(month).padStart(2, "0");
  const dd = String(day).padStart(2, "0");
  return `${year}-${mm}-${dd}`;
};

const CLUBS_PAGE_SIZE = 8;

const FavouriteSetDetail = () => {
  const { setId } = useParams<{ setId: string }>();
  const navigate = useNavigate();
  const { renameSet, updateSetClubs, deleteSet, sets } = useFavouriteSets();
  const { setCourse, setDate, setClubs } = useRental();

  const [showRenameModal, setShowRenameModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [clubsPage, setClubsPage] = useState(1);

  // Play modal state
  const [showPlayModal, setShowPlayModal] = useState(false);
  const [playStep, setPlayStep] = useState<1 | 2>(1);
  const [playCourse, setPlayCourse] = useState<Course | null>(null);
  const [playDisplayYear, setPlayDisplayYear] = useState(() =>
    new Date().getFullYear()
  );
  const [playDisplayMonth, setPlayDisplayMonth] = useState(
    () => new Date().getMonth() + 1
  );
  const [playSelectedDate, setPlaySelectedDate] = useState<string | null>(null);

  const { data: set, isLoading } = useFavouriteSetDetail(setId || "");

  const { data: courses = [] } = useQuery({
    queryKey: ["courses"],
    queryFn: getCourses,
    enabled: showPlayModal,
  });

  const setClubsData = (set?.clubs ?? []) as Club[];
  const bagProductIds = setClubsData
    .map((c) => c.booqableProductId)
    .filter(Boolean);

  const { data: bagAvailableDates, isLoading: datesLoading } = useQuery({
    queryKey: [
      "bagAvailableDates",
      playCourse?.id,
      playDisplayYear,
      playDisplayMonth,
    ],
    queryFn: () =>
      getAvailableDatesForBag(
        playCourse!.id,
        bagProductIds,
        playDisplayYear,
        playDisplayMonth
      ),
    enabled: !!playCourse && playStep === 2 && bagProductIds.length > 0,
  });

  const now = new Date();
  const todayStr = toDateStr(
    now.getFullYear(),
    now.getMonth() + 1,
    now.getDate()
  );
  const isCurrentMonth =
    playDisplayYear === now.getFullYear() &&
    playDisplayMonth === now.getMonth() + 1;

  const prevPlayMonth = () => {
    if (isCurrentMonth) return;
    if (playDisplayMonth === 1) {
      setPlayDisplayYear((y) => y - 1);
      setPlayDisplayMonth(12);
    } else {
      setPlayDisplayMonth((m) => m - 1);
    }
  };

  const nextPlayMonth = () => {
    if (playDisplayMonth === 12) {
      setPlayDisplayYear((y) => y + 1);
      setPlayDisplayMonth(1);
    } else {
      setPlayDisplayMonth((m) => m + 1);
    }
  };

  const daysInMonth = new Date(playDisplayYear, playDisplayMonth, 0).getDate();
  const firstDow = new Date(playDisplayYear, playDisplayMonth - 1, 1).getDay();
  const calendarCells: (number | null)[] = [
    ...Array(firstDow).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  const monthName = new Date(
    playDisplayYear,
    playDisplayMonth - 1,
    1
  ).toLocaleString("default", {
    month: "long",
  });

  const closePlayModal = () => {
    setShowPlayModal(false);
    setPlayStep(1);
    setPlayCourse(null);
    setPlaySelectedDate(null);
  };

  const handleConfirmPlay = () => {
    if (!playCourse || !playSelectedDate) return;
    setCourse(playCourse);
    setDate(playSelectedDate);
    setClubs(setClubsData);
    navigate("/reserve/auth");
  };

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center text-golf-yellow">
        Loading...
      </div>
    );
  }

  if (!set) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <h2 className="text-xl font-semibold text-golf-yellow mb-2">
          Bag not found
        </h2>
        <p className="text-golf-yellow mb-4">
          This favourite bag doesn't exist or was deleted.
        </p>
        <button onClick={() => navigate("/my-bags")} className="btn-primary">
          Back to My Bags
        </button>
      </div>
    );
  }

  const setClubs2 = set.clubs as Club[];

  const handleRemoveClub = (clubId: string) => {
    const updated = setClubs2.filter((c) => c._id !== clubId);
    updateSetClubs(set._id, updated);
    toast.success("Club removed");
    const newTotal = updated.length;
    const newTotalPages = Math.ceil(newTotal / CLUBS_PAGE_SIZE);
    if (clubsPage > newTotalPages) setClubsPage(Math.max(1, newTotalPages));
  };

  const handleRename = (newName: string) => {
    renameSet(set._id, newName);
    toast.success(`Renamed to "${newName}"`);
  };

  const handleDelete = () => {
    deleteSet(set._id);
    toast.success(`"${set.setName}" deleted`);
    navigate("/my-bags");
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      {/* Back link */}
      <button
        onClick={() => navigate("/my-bags")}
        className="text-sm text-golf-yellow hover:text-golf-yellow/80 mb-4 inline-flex items-center gap-1"
      >
        <svg
          className="w-4 h-4"
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
        Back to My Bags
      </button>

      {/* Set info card */}
      <div className="bg-white/10 rounded-lg border border-white/20 p-6 mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold text-golf-yellow">
              {set.setName}
            </h1>
            <p className="text-sm text-golf-yellow mt-1">
              {setClubs2.length} {setClubs2.length === 1 ? "club" : "clubs"}
            </p>
          </div>
          <div className="flex gap-2 flex-wrap justify-end">
            <button
              onClick={() => {
                setShowPlayModal(true);
                setPlayStep(1);
                setPlayCourse(null);
                setPlaySelectedDate(null);
              }}
              className="btn-primary text-sm"
            >
              Play with this bag
            </button>
            <button
              onClick={() => setShowRenameModal(true)}
              className="btn-secondary text-sm"
            >
              Rename
            </button>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="btn-danger text-sm"
            >
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* Clubs in this set */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-golf-yellow">
          Clubs in this Bag
        </h2>
        <button
          onClick={() => navigate(`/my-bags/${setId}/add-clubs`)}
          className="btn-primary text-sm"
        >
          + Add Clubs
        </button>
      </div>

      {setClubs2.length === 0 ? (
        <div className="bg-white/10 rounded-lg border border-white/20 p-8 text-center">
          <p className="text-charcoal mb-3">No clubs in this Bag yet.</p>
          <button
            onClick={() => navigate(`/my-bags/${setId}/add-clubs`)}
            className="btn-primary text-sm"
          >
            + Add Clubs
          </button>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {setClubs2
              .slice(
                (clubsPage - 1) * CLUBS_PAGE_SIZE,
                clubsPage * CLUBS_PAGE_SIZE
              )
              .map((club) => (
                <div
                  key={club._id}
                  className="group bg-white/10 rounded-2xl hover:bg-white/15 transition-all duration-300 p-4 flex items-center gap-5 border border-white/20"
                >
                  {/* Image */}
                  <div className="w-20 h-16 rounded-xl bg-white/10 overflow-hidden flex-shrink-0">
                    {club.image ? (
                      <img
                        src={club.image}
                        alt={club.name}
                        className="w-full h-full object-inherit group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-charcoal">
                        <svg
                          className="w-6 h-6"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14"
                          />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-golf-yellow text-base truncate">
                      {club.name}
                    </h3>

                    {/* Modern Badge */}
                    <span
                      className={`inline-flex items-center gap-1 mt-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                        club.isActive
                          ? "bg-emerald-50 text-emerald-600"
                          : "bg-red-50 text-red-600"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          club.isActive ? "bg-emerald-500" : "bg-red-500"
                        }`}
                      />
                      {club.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={() => handleRemoveClub(club._id)}
                    className="opacity-0 group-hover:opacity-100 transition-all duration-200 bg-red-50 hover:bg-red-100 text-red-600 p-2 rounded-lg"
                    title="Remove club"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7"
                      />
                    </svg>
                  </button>
                </div>
              ))}
          </div>
          <div className="flex items-center justify-between mt-6">
            <p className="text-sm text-golf-yellow">
              Showing{" "}
              <span className="font-medium text-golf-yellow">
                {(clubsPage - 1) * CLUBS_PAGE_SIZE + 1}–
                {Math.min(clubsPage * CLUBS_PAGE_SIZE, setClubs2.length)}
              </span>{" "}
              of{" "}
              <span className="font-medium text-golf-yellow">
                {setClubs2.length}
              </span>{" "}
              clubs
            </p>
            {Math.ceil(setClubs2.length / CLUBS_PAGE_SIZE) > 1 && (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setClubsPage((p) => p - 1)}
                  disabled={clubsPage === 1}
                  className="w-8 h-8 flex items-center justify-center rounded-xl border border-white/20 text-white/70 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10 transition-all"
                >
                  ‹
                </button>
                {Array.from(
                  { length: Math.ceil(setClubs2.length / CLUBS_PAGE_SIZE) },
                  (_, i) => i + 1
                )
                  .filter(
                    (p) =>
                      p === 1 ||
                      p === Math.ceil(setClubs2.length / CLUBS_PAGE_SIZE) ||
                      Math.abs(p - clubsPage) <= 1
                  )
                  .reduce<(number | "...")[]>((acc, p, idx, arr) => {
                    if (idx > 0 && p - (arr[idx - 1] as number) > 1)
                      acc.push("...");
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((item, idx) =>
                    item === "..." ? (
                      <span
                        key={`e-${idx}`}
                        className="w-8 flex items-center justify-center text-white/40 text-sm"
                      >
                        …
                      </span>
                    ) : (
                      <button
                        key={item}
                        onClick={() => setClubsPage(item as number)}
                        className={`w-8 h-8 rounded-xl border text-sm font-medium transition-all ${
                          clubsPage === item
                            ? "bg-[#FBE118] text-[#285610] border-[#FBE118]"
                            : "border-white/20 text-white/70 hover:bg-white/10"
                        }`}
                      >
                        {item}
                      </button>
                    )
                  )}
                <button
                  onClick={() => setClubsPage((p) => p + 1)}
                  disabled={
                    clubsPage === Math.ceil(setClubs2.length / CLUBS_PAGE_SIZE)
                  }
                  className="w-8 h-8 flex items-center justify-center rounded-xl border border-white/20 text-white/70 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10 transition-all"
                >
                  ›
                </button>
              </div>
            )}
          </div>
        </>
      )}

      <SaveSetModal
        isOpen={showRenameModal}
        onClose={() => setShowRenameModal(false)}
        onSave={handleRename}
        initialName={set.setName}
        title="Rename Set"
        existingNames={sets
          .filter((s) => s._id !== setId)
          .map((s) => s.setName)}
      />

      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Delete Set"
        message={`Are you sure you want to delete "${set.setName}"? This action cannot be undone.`}
      />

      {/* Play with this bag modal */}
      {showPlayModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-golf-dark border border-white/20 rounded-xl w-full max-w-md max-h-[90vh] flex flex-col">
            {/* Modal header */}
            <div className="flex items-center justify-between p-5 border-b border-white/10">
              <div className="flex items-center gap-2">
                {playStep === 2 && (
                  <button
                    onClick={() => {
                      setPlayStep(1);
                      setPlaySelectedDate(null);
                    }}
                    className="text-golf-yellow hover:text-golf-yellow/80 mr-1"
                    aria-label="Back"
                  >
                    <svg
                      className="w-5 h-5"
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
                )}
                <h2 className="text-lg font-bold text-golf-yellow">
                  {playStep === 1 ? "Select a Course" : "Select a Date"}
                </h2>
              </div>
              <button
                onClick={closePlayModal}
                className="text-white/50 hover:text-white transition-colors"
                aria-label="Close"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="overflow-y-auto flex-1 p-5">
              {/* Step 1: Course selection */}
              {playStep === 1 && (
                <div className="space-y-2">
                  {courses.length === 0 ? (
                    <p className="text-center text-white/50 py-4">
                      Loading courses...
                    </p>
                  ) : (
                    courses.map((course) => (
                      <button
                        key={course.id}
                        onClick={() => {
                          setPlayCourse(course);
                          setPlayStep(2);
                        }}
                        className="w-full text-left p-4 rounded-lg border border-white/20 bg-white/5 hover:bg-white/10 transition-colors"
                      >
                        <p className="font-medium text-golf-yellow">
                          {course.name}
                        </p>
                        {course.address && (
                          <p className="text-sm text-white/50 mt-0.5">
                            {course.address}
                          </p>
                        )}
                      </button>
                    ))
                  )}
                </div>
              )}

              {/* Step 2: Date selection */}
              {playStep === 2 && playCourse && (
                <div>
                  <p className="text-sm text-[#EDD287] mb-4">
                    Choose a date at{" "}
                    <span className="font-medium text-golf-yellow">
                      {playCourse.name}
                    </span>
                  </p>

                  <div className="bg-white/10 rounded-lg border border-white/20 p-4 select-none">
                    {/* Month header */}
                    <div className="flex items-center justify-between mb-4">
                      <button
                        type="button"
                        onClick={prevPlayMonth}
                        disabled={isCurrentMonth}
                        className="p-1 rounded hover:bg-[#EDD287] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
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
                      <span className="text-sm font-semibold text-golf-yellow">
                        {monthName} {playDisplayYear}
                      </span>
                      <button
                        type="button"
                        onClick={nextPlayMonth}
                        className="p-1 rounded hover:bg-golf-yellow transition-colors"
                        aria-label="Next month"
                      >
                        <svg
                          className="w-5 h-5 text-golf-dark"
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

                    {/* Day labels */}
                    <div className="grid grid-cols-7 mb-1">
                      {DAY_LABELS.map((label) => (
                        <div
                          key={label}
                          className="text-center text-xs font-medium text-golf-yellow py-1"
                        >
                          {label}
                        </div>
                      ))}
                    </div>

                    {/* Calendar grid */}
                    <div className="relative">
                      <div className="grid grid-cols-7 gap-y-1">
                        {calendarCells.map((day, idx) => {
                          if (day === null) return <div key={`empty-${idx}`} />;

                          const dateStr = toDateStr(
                            playDisplayYear,
                            playDisplayMonth,
                            day
                          );
                          const isPast = dateStr < todayStr;
                          const isToday = dateStr === todayStr;
                          const isSelected = dateStr === playSelectedDate;
                          const isAvailable =
                            !bagAvailableDates ||
                            bagAvailableDates.includes(dateStr);
                          const isUnavailable =
                            !!bagAvailableDates && !isAvailable && !isPast;

                          let cellClass =
                            "w-8 h-8 mx-auto flex items-center justify-center text-sm rounded-full transition-colors ";
                          if (isSelected) {
                            cellClass +=
                              "bg-golf-dark text-golf-yellow font-semibold";
                          } else if (isPast || isUnavailable) {
                            cellClass += "text-white/20 cursor-default";
                            if (isUnavailable) cellClass += " line-through";
                          } else {
                            cellClass +=
                              "text-golf-yellow cursor-pointer hover:bg-white/10";
                            if (isToday) cellClass += " ring-1 ring-golf-400";
                          }

                          return (
                            <div
                              key={dateStr}
                              className="flex items-center justify-center py-0.5"
                            >
                              <button
                                type="button"
                                onClick={() => {
                                  if (isPast || isUnavailable) return;
                                  setPlaySelectedDate(
                                    dateStr === playSelectedDate
                                      ? null
                                      : dateStr
                                  );
                                }}
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

                      {datesLoading && (
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

                    {playSelectedDate && (
                      <p className="mt-4 text-center text-sm text-golf-yellow font-medium">
                        Selected:{" "}
                        {new Date(
                          playSelectedDate + "T00:00:00"
                        ).toLocaleDateString("default", {
                          weekday: "long",
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={handleConfirmPlay}
                    disabled={!playSelectedDate}
                    className="btn-primary w-full mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Confirm &amp; Continue
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FavouriteSetDetail;

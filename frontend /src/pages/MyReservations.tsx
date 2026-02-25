import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { getReservations } from "../api/reservations";
import { isAuthenticated } from "../hooks/useAuth";
import type { Club } from "../types";

const PAGE_SIZE = 10;

const STATUS_STYLES = {
  confirmed: "bg-green-100 text-green-700",
  pending: "bg-yellow-100 text-yellow-700",
  cancelled: "bg-red-100 text-red-500",
};

const MyReservations = () => {
  const [page, setPage] = useState(1);
  const navigate = useNavigate();
  const loggedIn = isAuthenticated();

  const { data, isLoading } = useQuery({
    queryKey: ["reservations", page],
    queryFn: () => getReservations(page, PAGE_SIZE),
    enabled: loggedIn,
  });

  const reservations = data?.reservations ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;

  if (!loggedIn) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">Log in to view your reservations</h1>
        <p className="text-gray-500 text-sm mb-6">Your reserved club sets are saved to your account.</p>
        <button onClick={() => navigate("/login")} className="btn-primary">
          Log In
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Reservations</h1>
          <p className="text-gray-500 text-sm mt-1">All your reserved club sets</p>
        </div>
        <button onClick={() => navigate("/reserve/course")} className="btn-primary text-sm">
          New Reservation
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-16 text-gray-400">Loading reservations...</div>
      ) : !data || reservations.length === 0 ? (
        <div className="text-center py-16">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
            </svg>
          </div>
          <p className="text-gray-500 font-medium">No reservations yet</p>
          <p className="text-gray-400 text-sm mt-1">Reserve your clubs for an upcoming round.</p>
          <button onClick={() => navigate("/reserve/course")} className="btn-primary mt-4">
            Reserve Clubs
          </button>
        </div>
      ) : (
        <>
        <div className="space-y-4">
          {reservations.map((reservation) => {
            const clubs = reservation.clubs as Club[];
            const dateStr = new Date(reservation.date).toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            });
            const status = reservation.status ?? "confirmed";

            return (
              <div key={reservation._id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                {/* Header row */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                  <div>
                    <p className="font-semibold text-gray-900">{reservation.course}</p>
                    <p className="text-sm text-gray-500 mt-0.5">{dateStr}</p>
                  </div>
                  <span
                    className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${STATUS_STYLES[status] ?? STATUS_STYLES.confirmed}`}
                  >
                    {status}
                  </span>
                </div>

                {/* Club list */}
                <div className="px-5 py-3">
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-3">
                    Reserved Clubs ({clubs.length})
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {clubs.map((club, i) => (
                      typeof club === "object" ? (
                        <div key={club._id ?? i} className="flex items-center gap-2.5">
                          <div className="w-9 h-7 rounded bg-gray-100 overflow-hidden flex-shrink-0">
                            {club.image ? (
                              <img src={club.image} alt={club.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-300">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm text-gray-800 truncate">{club.name}</p>
                            {club.category && (
                              <p className="text-xs text-gray-400 capitalize">
                                {club.category.replace(/-/g, " ")}
                              </p>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div key={i} className="text-sm text-gray-400 italic">Club ID: {club}</div>
                      )
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Pagination ── */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <p className="text-sm text-gray-500">
              Showing{" "}
              <span className="font-medium text-gray-700">
                {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)}
              </span>{" "}
              of <span className="font-medium text-gray-700">{total}</span> reservations
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => p - 1)}
                disabled={page === 1}
                className="w-8 h-8 flex items-center justify-center rounded-xl border border-gray-200 text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50 transition-all"
              >
                ‹
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                .reduce<(number | "...")[]>((acc, p, idx, arr) => {
                  if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push("...");
                  acc.push(p);
                  return acc;
                }, [])
                .map((item, idx) =>
                  item === "..." ? (
                    <span key={`ellipsis-${idx}`} className="w-8 flex items-center justify-center text-gray-400 text-sm">…</span>
                  ) : (
                    <button
                      key={item}
                      onClick={() => setPage(item as number)}
                      className={`w-8 h-8 rounded-xl border text-sm font-medium transition-all ${
                        page === item
                          ? "bg-emerald-500 text-white border-emerald-500"
                          : "border-gray-200 text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      {item}
                    </button>
                  )
                )}
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={page === totalPages}
                className="w-8 h-8 flex items-center justify-center rounded-xl border border-gray-200 text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50 transition-all"
              >
                ›
              </button>
            </div>
          </div>
        )}
        </>
      )}
    </div>
  );
};

export default MyReservations;

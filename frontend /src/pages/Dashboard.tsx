import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getFavourites } from "../api/favourites";
import type { Club } from "../types";

const Dashboard = () => {
  const { data } = useQuery({
    queryKey: ["favourites", "dashboard"],
    queryFn: () => getFavourites(1, 3),
  });
  const bags = data?.favourites ?? [];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
      {/* Hero */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-golf-yellow tracking-tight mb-3">
          What would you like to do?
        </h1>
        <p className="text-white text-base max-w-sm mx-auto">
          Choose an action to get started with your round.
        </p>
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-14">
        <Link
          to="/my-bags"
          className="group relative bg-white/10 rounded-2xl border border-white/20 p-8 text-center transition-all duration-200 hover:bg-white/15 hover:-translate-y-1 overflow-hidden"
        >
          <div className="relative">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#FBE118]/20 text-golf-yellow mb-5 group-hover:bg-[#FBE118]/30 group-hover:scale-110 transition-all duration-200">
              <svg
                className="w-8 h-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-golf-yellow mb-2">
              Create / Manage Bags
            </h2>
            <p className="text-sm text-white leading-relaxed">
              Build your favourite club sets and manage your saved bags.
            </p>
            <div className="mt-5 inline-flex items-center gap-1.5 text-xs font-semibold text-golf-yellow group-hover:gap-2.5 transition-all">
              Go to My Bags
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                />
              </svg>
            </div>
          </div>
        </Link>

        <Link
          to="/reserve/course"
          className="group relative bg-white/10 rounded-2xl border border-white/20 p-8 text-center transition-all duration-200 hover:bg-white/15 hover:-translate-y-1 overflow-hidden"
        >
          <div className="relative">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#FBE118]/20 text-golf-yellow mb-5 group-hover:bg-[#FBE118]/30 group-hover:scale-110 transition-all duration-200">
              <svg
                className="w-8 h-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
                />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-golf-yellow mb-2">
              Reserve Clubs
            </h2>
            <p className="text-sm text-white leading-relaxed">
              Pick a course, choose a date, and reserve clubs for your round.
            </p>
            <div className="mt-5 inline-flex items-center gap-1.5 text-xs font-semibold text-golf-yellow group-hover:gap-2.5 transition-all">
              Make a Reservation
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                />
              </svg>
            </div>
          </div>
        </Link>
      </div>

      {/* Your Bags */}
      {bags.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-golf-yellow">Your Bags</h3>
              <p className="text-xs text-white mt-0.5">
                Quick access to your saved sets
              </p>
            </div>
            <Link
              to="/my-bags"
              className="text-xs font-semibold text-golf-yellow hover:text-golf-yellow/80 flex items-center gap-1 transition-colors"
            >
              View all
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                />
              </svg>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {bags.slice(0, 3).map((bag) => {
              const clubs = bag.clubs as Club[];
              const thumbnails = clubs.slice(0, 2);

              return (
                <Link
                  key={bag._id}
                  to={`/my-bags/${bag._id}`}
                  className="group bg-white/10 rounded-2xl border border-white/20 overflow-hidden hover:bg-white/15 hover:-translate-y-0.5 transition-all duration-200"
                >
                  <div className="h-40 bg-white/5 flex overflow-hidden">
                    {thumbnails.length > 0 ? (
                      thumbnails.map((club, i) => (
                        <div
                          key={club._id}
                          className="flex-1 overflow-hidden"
                          style={{
                            borderRight:
                              i < thumbnails.length - 1
                                ? "2px solid rgba(255,255,255,0.1)"
                                : "none",
                          }}
                        >
                          {club.image ? (
                            <img
                              src={club.image}
                              alt={club.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full bg-white/5" />
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="flex-1 flex items-center justify-center text-white/20">
                        <svg
                          className="w-8 h-8"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1}
                            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                          />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="p-4 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-white text-sm">
                        {bag.setName}
                      </p>
                      <p className="text-xs text-white mt-0.5">
                        {clubs.length} {clubs.length === 1 ? "club" : "clubs"}
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;

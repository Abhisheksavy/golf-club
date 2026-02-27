import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useRental } from "../../context/RentalContext";
import { getCourses } from "../../api/courses";

const SelectCourse = () => {
  const navigate = useNavigate();
  const { selectedCourse, setCourse } = useRental();

  const { data: courses = [], isLoading } = useQuery({
    queryKey: ["courses"],
    queryFn: getCourses,
  });

  const handleSelect = (courseId: string) => {
    const course = courses.find((c) => c.id === courseId);
    if (course) setCourse(course);
  };

  const handleNext = () => {
    if (selectedCourse) navigate("/reserve/date");
  };

  const handleSkip = () => {
    setCourse(null);
    navigate("/reserve/auth");
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-golf-yellow mb-2">
        Select a Course
      </h1>
      <p className="text-white mb-6">
        Choose the golf course for your rental, or skip if you're not sure yet.
      </p>

      {isLoading ? (
        <div className="text-center py-12 text-golf-yellow">
          Loading courses...
        </div>
      ) : courses.length === 0 ? (
        <div className="text-center py-8 text-golf-yellow">
          No courses available.
        </div>
      ) : (
        <div className="grid gap-4">
          {courses.map((course) => (
            <button
              key={course.id}
              type="button"
              onClick={() => handleSelect(course.id)}
              className={`text-left p-6 rounded-lg border-2 transition-all ${
                selectedCourse?.id === course.id
                  ? "border-[#FBE118] bg-[#FBE118]/10 ring-2 ring-[#FBE118]/30"
                  : "border-white/20 hover:border-white/40 bg-white/10"
              }`}
            >
              <h3 className="text-lg font-semibold text-white">
                {course.name}
              </h3>
              {(course.address || course.location) && (
                <p className="text-sm text-white/60 mt-1">
                  {course.address ?? course.location}
                </p>
              )}
            </button>
          ))}
        </div>
      )}

      <div className="flex justify-between mt-8">
        <button onClick={handleSkip} className="btn-secondary">
          Skip — No specific course
        </button>
        <button
          onClick={handleNext}
          disabled={!selectedCourse}
          className="btn-primary  disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default SelectCourse;

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
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Select a Course</h1>
      <p className="text-gray-500 mb-6">
        Choose the golf course for your rental, or skip if you're not sure yet.
      </p>

      {isLoading ? (
        <div className="text-center py-12 text-gray-500">Loading courses...</div>
      ) : courses.length === 0 ? (
        <div className="text-center py-8 text-gray-500">No courses available.</div>
      ) : (
        <div className="grid gap-4">
          {courses.map((course) => (
            <button
              key={course.id}
              type="button"
              onClick={() => handleSelect(course.id)}
              className={`text-left p-6 rounded-lg border-2 transition-all ${
                selectedCourse?.id === course.id
                  ? "border-golf-500 bg-golf-50 ring-2 ring-golf-200"
                  : "border-gray-200 hover:border-gray-300 bg-white"
              }`}
            >
              <h3 className="text-lg font-semibold text-gray-900">{course.name}</h3>
              {(course.address || course.location) && (
                <p className="text-sm text-gray-500 mt-1">{course.address ?? course.location}</p>
              )}
            </button>
          ))}
        </div>
      )}

      <div className="flex justify-between mt-8">
        <button
          onClick={handleSkip}
          className="btn-secondary"
        >
          Skip — No specific course
        </button>
        <button
          onClick={handleNext}
          disabled={!selectedCourse}
          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default SelectCourse;

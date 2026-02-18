import { useNavigate } from "react-router-dom";
import { useRental } from "../../context/RentalContext";
import { courses } from "../../data/courses";

const SelectCourse = () => {
  const navigate = useNavigate();
  const { selectedCourse, setCourse } = useRental();

  const handleSelect = (courseId: string) => {
    const course = courses.find((c) => c.id === courseId);
    if (course) setCourse(course);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Select a Course</h1>
      <p className="text-gray-500 mb-6">Choose the golf course for your reservation.</p>

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
            <p className="text-sm text-gray-500 mt-1">{course.location}</p>
          </button>
        ))}
      </div>

      <div className="flex justify-end mt-8">
        <button
          onClick={() => navigate("/reserve/date")}
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

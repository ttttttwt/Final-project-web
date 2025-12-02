import userEvent from "@testing-library/user-event";
import { render, screen } from "@/tests/utils/test-utils";
import { CourseCard } from "@/components/courses/CourseCard";
import { mockCourses } from "@/tests/mocks/mockData";

describe("CourseCard", () => {
  const baseCourse = {
    ...mockCourses[0],
    durationMinutes: 90,
  };

  it("renders course information with CEFR badge and metadata", () => {
    render(<CourseCard course={baseCourse} />);

    expect(
      screen.getByRole("link", { name: new RegExp(baseCourse.title, "i") })
    ).toBeInTheDocument();
    expect(screen.getByText(baseCourse.title)).toBeInTheDocument();
    expect(screen.getByText(baseCourse.description)).toBeInTheDocument();
    expect(screen.getByText(baseCourse.cefrLevel)).toBeInTheDocument();
    expect(screen.getByText(/3 sections/i)).toBeInTheDocument();
    expect(screen.getByText(/90 min/i)).toBeInTheDocument();
    // Non-enrolled users see "View Detail" button
    expect(
      screen.getByRole("button", { name: /view detail/i })
    ).toBeInTheDocument();
  });

  it("invokes onEnroll callback when view detail button is clicked", async () => {
    const onEnroll = jest.fn();

    render(<CourseCard course={baseCourse} onEnroll={onEnroll} />);

    // Component uses "View Detail" for non-enrolled courses
    await userEvent.click(screen.getByRole("button", { name: /view detail/i }));

    expect(onEnroll).toHaveBeenCalledTimes(1);
    expect(onEnroll).toHaveBeenCalledWith(String(baseCourse.id));
  });

  it("shows progress bar and continue button for enrolled courses", () => {
    render(
      <CourseCard course={baseCourse} isEnrolled progressPercentage={65.6} />
    );

    expect(screen.getByText(/progress/i)).toBeInTheDocument();
    expect(screen.getByText("66%")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /continue learning/i })
    ).toBeInTheDocument();
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  it("displays completed badge when course is marked as finished", () => {
    render(<CourseCard course={baseCourse} isCompleted />);

    expect(screen.getByText(/completed/i)).toBeInTheDocument();
  });
});

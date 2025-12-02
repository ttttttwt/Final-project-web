import userEvent from "@testing-library/user-event";
import { render, screen, waitFor, act } from "@/tests/utils/test-utils";
import CoursesPage from "@/app/courses/page";
import { courseService } from "@/services/courseService";
import { enrollmentService } from "@/services/enrollmentService";
import { mockCourses, mockEnrollments } from "@/tests/mocks/mockData";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

jest.mock("@/components/layout", () => ({
  MainLayout: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="main-layout">{children}</div>
  ),
}));

jest.mock("@/components/auth/ProtectedRoute", () => ({
  ProtectedRoute: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));

jest.mock("sonner", () => ({
  toast: {
    info: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock("@/services/courseService", () => ({
  courseService: {
    getCourses: jest.fn(),
    searchCourses: jest.fn(),
  },
}));

jest.mock("@/services/enrollmentService", () => ({
  enrollmentService: {
    getMyEnrollments: jest.fn(),
  },
}));

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
}));

const pushMock = jest.fn();
const replaceMock = jest.fn();
const prefetchMock = jest.fn();

const paginatedResponse = {
  content: mockCourses,
  pageable: {
    pageNumber: 0,
    pageSize: 12,
  },
  totalPages: 1,
  totalElements: mockCourses.length,
  last: true,
  first: true,
};

const useRouterMock = useRouter as unknown as jest.Mock;
const useSearchParamsMock = useSearchParams as unknown as jest.Mock;
const getCoursesMock = courseService.getCourses as unknown as jest.Mock;
const searchCoursesMock = courseService.searchCourses as unknown as jest.Mock;
const getMyEnrollmentsMock =
  enrollmentService.getMyEnrollments as unknown as jest.Mock;
const toastInfoMock = toast.info as unknown as jest.Mock;

beforeAll(() => {
  Object.defineProperty(window, "scrollTo", {
    writable: true,
    value: jest.fn(),
  });
});

beforeEach(() => {
  jest.clearAllMocks();

  pushMock.mockReset();
  replaceMock.mockReset();
  prefetchMock.mockReset();

  useRouterMock.mockReturnValue({
    push: pushMock,
    replace: replaceMock,
    prefetch: prefetchMock,
    back: jest.fn(),
  });

  useSearchParamsMock.mockReturnValue({
    get: () => null,
  });

  getCoursesMock.mockResolvedValue(paginatedResponse);
  searchCoursesMock.mockResolvedValue(paginatedResponse);
  getMyEnrollmentsMock.mockResolvedValue(mockEnrollments);
});

describe("CoursesPage", () => {
  it("fetches and renders course cards on mount", async () => {
    render(<CoursesPage />);

    expect(await screen.findByText(mockCourses[0].title)).toBeInTheDocument();
    expect(getCoursesMock).toHaveBeenCalledWith(
      0,
      12,
      "createdAt,desc",
      expect.anything()
    );
    await waitFor(() =>
      expect(replaceMock).toHaveBeenCalledWith("/courses", { scroll: false })
    );
  });

  it("applies CEFR filter and triggers search", async () => {
    render(<CoursesPage />);

    const levelBadge = await screen.findByRole("button", { name: "B1" });
    await userEvent.click(levelBadge);

    await waitFor(() =>
      expect(levelBadge).toHaveAttribute("aria-pressed", "true")
    );

    await waitFor(() =>
      expect(searchCoursesMock).toHaveBeenCalledWith(
        expect.objectContaining({
          page: 0,
          size: 12,
          sort: "createdAt,desc",
          cefrLevel: "B1",
        }),
        expect.anything()
      )
    );

    await waitFor(() =>
      expect(replaceMock).toHaveBeenLastCalledWith("/courses?level=B1", {
        scroll: false,
      })
    );
  });

  it("debounces search input before requesting filtered results", async () => {
    render(<CoursesPage />);

    const searchInput = await screen.findByPlaceholderText("Search courses...");

    await userEvent.type(searchInput, "Business");

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 320));
    });

    await waitFor(() =>
      expect(searchCoursesMock).toHaveBeenCalledWith(
        expect.objectContaining({
          page: 0,
          size: 12,
          sort: "createdAt,desc",
          title: "Business",
        }),
        expect.anything()
      )
    );
  });

  it("navigates to course detail page when view detail button is clicked", async () => {
    render(<CoursesPage />);

    // Component uses "View Detail" button for non-enrolled courses
    const viewDetailButtons = await screen.findAllByRole("button", {
      name: /view detail/i,
    });

    await userEvent.click(viewDetailButtons[0]);

    // Clicking View Detail navigates to a course detail page
    // The order may vary based on rendering, so just verify navigation happened
    expect(pushMock).toHaveBeenCalledTimes(1);
    expect(pushMock).toHaveBeenCalledWith(
      expect.stringMatching(/^\/courses\/\d+$/)
    );
  });
});

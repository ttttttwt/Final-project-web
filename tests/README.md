# Testing Infrastructure - LEXIA Web

## 📋 Overview

This directory contains the testing infrastructure for the LEXIA web application. We use Jest and React Testing Library for unit and integration testing.

## 🛠️ Tech Stack

- **Jest** (v30.x): Test runner and assertion library
- **React Testing Library** (v16.x): Component testing utilities
- **@testing-library/jest-dom**: Custom matchers for DOM assertions
- **@testing-library/user-event**: User interaction simulation

## 📁 Directory Structure

```
tests/
├── mocks/
│   └── mockData.ts          # Mock data for API responses
├── utils/
│   └── test-utils.tsx       # Custom render with providers
├── index.ts                 # Re-exports for easy imports
├── jest-dom.d.ts            # TypeScript types for jest-dom
└── setup.test.tsx           # Sample test to verify setup
```

## 🚀 Running Tests

### Run all tests

```bash
npm test
```

### Run tests in watch mode

```bash
npm run test:watch
```

### Run tests with coverage

```bash
npm run test:coverage
```

## 📊 Coverage Thresholds

### Global Coverage (60%)

- **Lines**: 60%
- **Branches**: 50%
- **Functions**: 60%
- **Statements**: 60%

### Service Coverage (80%)

Services have higher thresholds due to critical business logic:

- **Lines**: 80%
- **Branches**: 70%
- **Functions**: 80%
- **Statements**: 80%

## 📝 Writing Tests

### Basic Component Test

```typescript
import { render, screen } from "@/tests/utils/test-utils";
import { MyComponent } from "@/components/MyComponent";

describe("MyComponent", () => {
  it("renders correctly", () => {
    render(<MyComponent />);
    expect(screen.getByText("Hello")).toBeInTheDocument();
  });
});
```

### Using Mock Data

```typescript
import { mockUser, mockCourses } from "@/tests/mocks/mockData";

describe("CourseList", () => {
  it("displays courses", () => {
    render(<CourseList courses={mockCourses} />);
    expect(screen.getByText("Business English Basics")).toBeInTheDocument();
  });
});
```

### Testing User Interactions

```typescript
import { render, screen } from "@/tests/utils/test-utils";
import userEvent from "@testing-library/user-event";

describe("LoginForm", () => {
  it("submits form with valid data", async () => {
    const user = userEvent.setup();
    const onSubmit = jest.fn();

    render(<LoginForm onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText(/email/i), "test@example.com");
    await user.type(screen.getByLabelText(/password/i), "password123");
    await user.click(screen.getByRole("button", { name: /login/i }));

    expect(onSubmit).toHaveBeenCalledWith({
      email: "test@example.com",
      password: "password123",
    });
  });
});
```

### Testing Async Operations

```typescript
import { render, screen, waitFor } from "@/tests/utils/test-utils";

describe("AsyncComponent", () => {
  it("loads data", async () => {
    render(<AsyncComponent />);

    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });

    // Or use findBy queries (built-in waiting)
    const element = await screen.findByText("Data loaded!");
    expect(element).toBeInTheDocument();
  });
});
```

### Mocking API Calls

```typescript
import { authService } from "@/services/authService";
import { mockLoginResponse } from "@/tests/mocks/mockData";

jest.mock("@/services/authService");

describe("Login", () => {
  it("logs in successfully", async () => {
    (authService.login as jest.Mock).mockResolvedValue(mockLoginResponse);

    render(<LoginPage />);

    // ... interact with form

    await waitFor(() => {
      expect(authService.login).toHaveBeenCalled();
    });
  });
});
```

## 🧪 Test Utils

### Custom Render

The `render` function from `test-utils.tsx` automatically wraps components with necessary providers:

- `ThemeProvider` for theme context

```typescript
import { render } from "@/tests/utils/test-utils";

// No need to manually wrap with providers
render(<MyComponent />);
```

### Mock Data

All mock data is available in `tests/mocks/mockData.ts`:

- `mockUser`, `mockUserMinimal` - User objects
- `mockCourses` - Array of courses
- `mockSections` - Array of course sections
- `mockLessons` - Array of lessons
- `mockEnrollments` - Array of enrollments
- `mockDashboardStats` - Dashboard statistics
- `mockStreakData` - Streak information
- `mockDailyActivities` - Daily activity data
- `mockProgressSummary` - Progress summary
- `mockApiErrors` - Common API error responses

## 🔍 Common Queries

### Finding Elements

```typescript
// By text
screen.getByText("Hello");

// By role
screen.getByRole("button", { name: /submit/i });

// By label
screen.getByLabelText(/email/i);

// By placeholder
screen.getByPlaceholderText("Enter email");

// By test ID
screen.getByTestId("custom-element");
```

### Async Queries

```typescript
// findBy - waits for element (use for async content)
await screen.findByText("Loaded!");

// waitFor - wait for assertion to pass
await waitFor(() => {
  expect(screen.getByText("Done")).toBeInTheDocument();
});
```

### Query Variants

- `getBy*` - Throws error if not found (use for elements that should exist)
- `queryBy*` - Returns null if not found (use for asserting non-existence)
- `findBy*` - Returns promise (use for async elements)

## 🎯 Best Practices

### ✅ DO

- Test user behavior, not implementation details
- Use semantic queries (byRole, byLabelText)
- Test accessibility (ARIA labels, keyboard nav)
- Mock external dependencies (API calls, timers)
- Use descriptive test names
- Arrange-Act-Assert pattern
- Clean up after tests (automatic with RTL)

### ❌ DON'T

- Test internal state or props directly
- Use container.querySelector (prefer RTL queries)
- Test third-party libraries (shadcn/ui)
- Create brittle tests tied to markup structure
- Skip async/await for async operations
- Forget to mock side effects

## 📚 Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Testing Library Queries](https://testing-library.com/docs/queries/about)
- [Common Mistakes](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

## 🔐 Security Testing

For authentication tests, remember:

- **NO tokens in client-side code** (httpOnly cookies only)
- Mock `authService` calls, not token storage
- Test session validation via API calls
- Test auto-logout on token expiry

## ♿ Accessibility Testing

Ensure components are accessible:

- Use `getByRole` queries (validates ARIA)
- Test keyboard navigation
- Check focus management
- Verify form labels (`getByLabelText`)
- Test screen reader experience

## 🐛 Debugging Tests

### View rendered output

```typescript
import { render, screen } from "@/tests/utils/test-utils";

const { debug } = render(<MyComponent />);
debug(); // Prints DOM to console
```

### Find available queries

```typescript
screen.logTestingPlaygroundURL(); // Opens testing playground
```

### Run single test

```bash
npm test -- MyComponent.test.tsx
```

### Run tests matching pattern

```bash
npm test -- --testNamePattern="renders correctly"
```

## 📈 Next Steps

After setup (Task F4), the next task is:

- **Task F5**: Write component unit tests
  - Authentication components (login, register)
  - Course components (cards, lists)
  - Dashboard components (stats, charts)
  - Navigation components (sidebar, header)
  - Achieve 60%+ global coverage
  - Achieve 80%+ service coverage

---

**Last Updated**: November 17, 2025  
**Status**: ✅ Testing infrastructure complete (Task F4)

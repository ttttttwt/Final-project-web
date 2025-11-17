import { render, RenderOptions } from "@testing-library/react";
import { ReactElement, ReactNode } from "react";
import { ThemeProvider } from "@/components/theme-provider";

/**
 * Custom render function that wraps components with necessary providers
 * Usage: render(<MyComponent />, { wrapper: AllTheProviders })
 */
interface AllTheProvidersProps {
  children: ReactNode;
}

function AllTheProviders({ children }: AllTheProvidersProps) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </ThemeProvider>
  );
}

/**
 * Custom render function with providers
 * @param ui - React component to render
 * @param options - Additional render options
 */
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">
) => render(ui, { wrapper: AllTheProviders, ...options });

// Re-export everything from @testing-library/react
export * from "@testing-library/react";

// Override render with our custom version
export { customRender as render };

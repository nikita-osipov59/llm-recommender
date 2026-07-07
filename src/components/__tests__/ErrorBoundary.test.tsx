import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ErrorBoundary from "../ErrorBoundary";

const Thrower = () => { throw new Error("test error") };

it("catches error and shows retry button", async () => {
  render(<ErrorBoundary><Thrower /></ErrorBoundary>);
  expect(screen.getByText("Что-то пошло не так")).toBeInTheDocument();
  expect(screen.getByText("test error")).toBeInTheDocument();
  await userEvent.click(screen.getByText("Попробовать снова"));
  expect(screen.getByText("Что-то пошло не так")).toBeInTheDocument();
});

it("renders children when no error", () => {
  render(<ErrorBoundary><div>OK</div></ErrorBoundary>);
  expect(screen.getByText("OK")).toBeInTheDocument();
});

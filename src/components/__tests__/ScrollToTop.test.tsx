import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ScrollToTop from "../ScrollToTop";

beforeEach(() => {
  window.scrollTo = vi.fn();
  window.scrollY = 500;
});

it("renders button and scrolls to top on click", async () => {
  window.scrollY = 500;
  render(<ScrollToTop />);
  window.dispatchEvent(new Event("scroll"));
  const btn = await screen.findByRole("button");
  expect(btn).toBeInTheDocument();
  await userEvent.click(btn);
  expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: "smooth" });
});

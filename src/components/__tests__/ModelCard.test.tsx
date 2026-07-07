import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ModelCard from "../ModelCard";

const model = {
  slug: "llama-3-8b",
  name: "Llama 3 8B",
  provider: "Meta",
  parameters: 8,
  vramQ4: 6,
  vramQ8: 10,
  ramMin: 8,
  hfUrl: "https://hf.co/llama",
  downloads: 50000,
  description: "A test model",
};

it("renders model info and calls onToggle", async () => {
  const onToggle = vi.fn();
  render(<ModelCard model={model} selected={false} onToggle={onToggle} userVram={0} isBest={false} favorited={false} onFavorite={vi.fn()} />);
  expect(screen.getByText("Llama 3 8B")).toBeInTheDocument();
  expect(screen.getByText(/Meta/)).toBeInTheDocument();
  expect(screen.getByText("6 ГБ")).toBeInTheDocument();
  expect(screen.getByText("10 ГБ")).toBeInTheDocument();
  await userEvent.click(screen.getByText("Сравнить"));
  expect(onToggle).toHaveBeenCalledWith("llama-3-8b");
});

it("shows comparison state when selected", () => {
  render(<ModelCard model={model} selected={true} onToggle={vi.fn()} userVram={0} isBest={false} favorited={false} onFavorite={vi.fn()} />);
  expect(screen.getByText("В сравнении ✓")).toBeInTheDocument();
});

it("renders link to model detail page", () => {
  render(<ModelCard model={model} selected={false} onToggle={vi.fn()} userVram={0} isBest={false} favorited={false} onFavorite={vi.fn()} />);
  const link = screen.getByRole("link", { name: "Llama 3 8B" });
  expect(link).toHaveAttribute("href", "/models/llama-3-8b");
});

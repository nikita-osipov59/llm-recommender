import { render, screen } from "@testing-library/react";
import ComparisonTable from "../ComparisonTable";

const models = [
  {
    slug: "model-a", name: "Model A", provider: "Meta",
    parameters: 8, vramQ4: 6, vramQ8: 10, ramMin: 8,
    hfUrl: null, downloads: 50000, description: null, tags: "instruct,code",
  },
  {
    slug: "model-b", name: "Model B", provider: "Meta",
    parameters: 70, vramQ4: 40, vramQ8: 70, ramMin: 48,
    hfUrl: "https://hf.co/b", downloads: 100000, description: null, tags: "instruct",
  },
];

it("renders comparison table with tags row", () => {
  render(<ComparisonTable models={models} />);
  expect(screen.getByText("Теги")).toBeInTheDocument();
  expect(screen.getByText("Чат, Код")).toBeInTheDocument();
  expect(screen.getByText("Чат")).toBeInTheDocument();
});

it("highlights best and worst values", () => {
  const { container } = render(<ComparisonTable models={models} />);
  // Find the VRAM Q4 row cells
  const cells = container.querySelectorAll("td");
  const vramCells = [...cells].filter((c) => c.textContent === "6 ГБ" || c.textContent === "40 ГБ");
  expect(vramCells.length).toBe(2);
});

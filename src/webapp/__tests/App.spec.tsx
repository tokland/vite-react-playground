import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

import App from "../App";

describe("App", () => {
    it("renders headline", () => {
        const res = render(<App />);

        expect(screen.getByRole("heading")).toHaveTextContent("Vite + React");
        expect(res.asFragment()).toMatchSnapshot();
    });
});

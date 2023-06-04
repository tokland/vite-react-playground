import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

import App from "../App";

describe("App", () => {
    it("renders headline", async () => {
        const res = render(<App />);
        expect(screen.getByText("Home"));
        expect(res.asFragment()).toMatchSnapshot();
    });
});

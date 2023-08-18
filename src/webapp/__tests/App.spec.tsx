import { act, fireEvent, render, waitFor } from "@testing-library/react";

import App from "../App";
import { getProxiedCompositionRoot } from "../../compositionRootTest";
import { routes } from "../routes";

describe("App", () => {
    it("renders components", async () => {
        act(() => routes.counter({ id: "1" }).push());

        const compositionRoot = await getProxiedCompositionRoot();
        const view = render(<App compositionRoot={compositionRoot} />);

        await waitFor(() => expect(view.getByText("+1")));
        fireEvent.click(view.getByText("+1"));
        fireEvent.click(view.getByText("+1"));
        expect(view.asFragment()).toMatchSnapshot();
    });
});

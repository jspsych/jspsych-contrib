import {pressKey, startTimeline} from "@jspsych/test-utils";

import rok from ".";

describe("rok plugin", () => {
    test("choices and frame data are stored as arrays", async () => {
        const {getData} = await startTimeline([
            {
                type: rok,
                number_of_oobs: 200,
                choices: ["a", "l"],
                correct_choice: ["l"],
                coherent_movement_direction: 0,
            },
        ]);

        pressKey("l");
        const data = getData().values()[0];
        expect(data.choices).toStrictEqual(["a", "l"]);
        expect(Array.isArray(data.frame_rate_array)).toBe(true);
    });

});

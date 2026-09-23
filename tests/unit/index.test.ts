import { HELLO_WORLD } from "../../src/index";

describe("index", () => {
  it("exports the hello world constant", () => {
    expect(HELLO_WORLD).toBe("hello world");
  });
});

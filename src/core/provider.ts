import type { ModelProvider } from "./types";

export class StubModelProvider implements ModelProvider {
  readonly id = "stub/templates";

  async complete(): Promise<string> {
    throw new Error(
      "Model provider is stubbed. Primer Core does not call a frontier model until Phase 3; text is rendered from curriculum templates.",
    );
  }
}

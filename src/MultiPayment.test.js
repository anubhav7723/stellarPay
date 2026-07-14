import { describe, it, expect } from "vitest";
import { getAddressAvatar } from "./utils/avatar";

describe("Frontend Address Avatar Utilities", () => {
  it("generates correct initials and dynamic gradient from valid Stellar public key", () => {
    const address = "GBHNGTRVWQAOM73456WB4JJ77677NLD43FEPXOO72A32SCS42T5N2FQA";
    const result = getAddressAvatar(address);
    
    expect(result.initials).toBe("GG");
    expect(result.gradient).toContain("linear-gradient");
  });

  it("handles invalid or empty addresses gracefully with fallback ??", () => {
    const result = getAddressAvatar("");
    expect(result.initials).toBe("??");
    expect(result.gradient).toContain("linear-gradient");
  });

  it("handles short addresses gracefully with fallback ??", () => {
    const result = getAddressAvatar("GBA");
    expect(result.initials).toBe("??");
    expect(result.gradient).toContain("linear-gradient");
  });
});

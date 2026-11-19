import { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { TagAutocomplete } from "@/components/upload/TagAutocomplete";

function ControlledTags({ initialValue = "" }: { initialValue?: string }) {
  const [value, setValue] = useState(initialValue);

  return (
    <TagAutocomplete
      availableTags={["wedding", "wildlife"]}
      label="Tags"
      onChange={setValue}
      value={value}
    />
  );
}

describe("tag suggestions", () => {
  it("matches the trimmed, case-insensitive last token and preserves previous text on click", async () => {
    const user = userEvent.setup();
    render(<ControlledTags initialValue="  portrait  ,   WI" />);
    const input = screen.getByRole("combobox");

    await user.click(input);
    await user.click(screen.getByRole("option", { name: "wildlife" }));

    expect(input).toHaveValue("  portrait  , wildlife");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("does not show empty, unmatched, or already selected suggestions", async () => {
    const user = userEvent.setup();
    render(<ControlledTags />);
    const input = screen.getByRole("combobox");

    await user.click(input);
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    await user.type(input, " WEDDING , wed");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    await user.clear(input);
    await user.type(input, "xyz");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    await user.clear(input);
    await user.type(input, "wedding, ");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });
});

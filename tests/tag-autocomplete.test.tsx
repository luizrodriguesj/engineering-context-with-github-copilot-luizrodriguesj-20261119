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

  it("navigates suggestions with the keyboard and selects without submitting", async () => {
    const user = userEvent.setup();
    let submissions = 0;
    render(
      <form
        onSubmit={(event) => {
          event.preventDefault();
          submissions += 1;
        }}
      >
        <ControlledTags />
        <button type="submit">Continue</button>
      </form>,
    );
    const input = screen.getByRole("combobox");

    await user.type(input, "w");
    await user.keyboard("{ArrowDown}{ArrowDown}");
    const wildlife = screen.getByRole("option", { name: "wildlife" });
    expect(input).toHaveFocus();
    expect(input).toHaveAttribute("aria-activedescendant", wildlife.id);
    expect(wildlife).toHaveAttribute("aria-selected", "true");

    await user.keyboard("{ArrowUp}");
    const wedding = screen.getByRole("option", { name: "wedding" });
    expect(input).toHaveAttribute("aria-activedescendant", wedding.id);
    expect(wedding).toHaveAttribute("aria-selected", "true");

    await user.clear(input);
    await user.type(input, "portrait, wi");
    await user.keyboard("{ArrowDown}{Enter}");
    expect(input).toHaveValue("portrait, wildlife");
    expect(submissions).toBe(0);
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("closes on Escape without clearing text and lets Tab move focus", async () => {
    const user = userEvent.setup();
    render(
      <form>
        <ControlledTags />
        <button type="button">Continue</button>
      </form>,
    );
    const input = screen.getByRole("combobox");

    await user.type(input, "w");
    await user.keyboard("{Escape}");
    expect(input).toHaveValue("w");
    expect(input).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();

    await user.type(input, "i");
    await user.keyboard("{Tab}");
    expect(screen.getByRole("button", { name: "Continue" })).toHaveFocus();
    expect(input).toHaveAttribute("aria-expanded", "false");
  });
});

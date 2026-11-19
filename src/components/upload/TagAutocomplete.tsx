"use client";

import { useId, useState } from "react";

type TagAutocompleteProps = {
  availableTags: readonly string[];
  label: string;
  value: string;
  onChange: (value: string) => void;
};

export function TagAutocomplete({ availableTags, label, value, onChange }: TagAutocompleteProps) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const listId = useId();
  const tokens = value.split(",");
  const query = tokens[tokens.length - 1].trim().toLowerCase();
  const selectedTags = new Set(tokens.slice(0, -1).map((tag) => tag.trim().toLowerCase()));
  const suggestions = query
    ? availableTags.filter((tag) => {
        const normalizedTag = tag.trim().toLowerCase();
        return normalizedTag.startsWith(query) && !selectedTags.has(normalizedTag);
      })
    : [];
  const expanded = open && suggestions.length > 0;
  const activeOptionIndex =
    activeIndex !== null && activeIndex < suggestions.length ? activeIndex : null;
  const activeOptionId =
    expanded && activeOptionIndex !== null
      ? `${listId}-option-${activeOptionIndex}`
      : undefined;

  function selectTag(tag: string) {
    const lastComma = value.lastIndexOf(",");
    onChange(lastComma === -1 ? tag : `${value.slice(0, lastComma + 1)} ${tag}`);
    setOpen(false);
    setActiveIndex(null);
  }

  return (
    <>
      <label>
        {label}
        <input
          aria-activedescendant={activeOptionId}
          aria-controls={expanded ? listId : undefined}
          aria-expanded={expanded}
          autoComplete="off"
          name="tags"
          onBlur={() => {
            setOpen(false);
            setActiveIndex(null);
          }}
          onChange={(event) => {
            onChange(event.target.value);
            setOpen(true);
            setActiveIndex(null);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(event) => {
            if (event.key === "ArrowDown" && suggestions.length > 0) {
              event.preventDefault();
              setOpen(true);
              setActiveIndex((current) =>
                current === null ? 0 : (current + 1) % suggestions.length,
              );
            } else if (event.key === "ArrowUp" && suggestions.length > 0) {
              event.preventDefault();
              setOpen(true);
              setActiveIndex((current) =>
                current === null
                  ? suggestions.length - 1
                  : (current - 1 + suggestions.length) % suggestions.length,
              );
            } else if (event.key === "Enter" && expanded && activeOptionIndex !== null) {
              event.preventDefault();
              selectTag(suggestions[activeOptionIndex]);
            } else if (event.key === "Escape" || event.key === "Tab") {
              setOpen(false);
              setActiveIndex(null);
            }
          }}
          placeholder="wedding, portrait, outdoor..."
          role="combobox"
          type="text"
          value={value}
        />
      </label>
      {expanded && (
        <ul
          className="m-0 list-none border border-[var(--line)] bg-white p-0"
          id={listId}
          role="listbox"
        >
          {suggestions.map((tag, index) => (
            <li
              className={`cursor-pointer px-3 py-2 hover:bg-[var(--paper)] ${
                activeOptionIndex === index ? "bg-[var(--paper)]" : ""
              }`}
              id={`${listId}-option-${index}`}
              key={tag}
              onClick={() => selectTag(tag)}
              onMouseDown={(event) => event.preventDefault()}
              role="option"
              aria-selected={activeOptionIndex === index}
            >
              {tag}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

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

  function selectTag(tag: string) {
    const lastComma = value.lastIndexOf(",");
    onChange(lastComma === -1 ? tag : `${value.slice(0, lastComma + 1)} ${tag}`);
    setOpen(false);
  }

  return (
    <>
      <label>
        {label}
        <input
          aria-controls={expanded ? listId : undefined}
          aria-expanded={expanded}
          autoComplete="off"
          name="tags"
          onBlur={() => setOpen(false)}
          onChange={(event) => {
            onChange(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
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
          {suggestions.map((tag) => (
            <li
              className="cursor-pointer px-3 py-2 hover:bg-[var(--paper)]"
              key={tag}
              onClick={() => selectTag(tag)}
              onMouseDown={(event) => event.preventDefault()}
              role="option"
              aria-selected="false"
            >
              {tag}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

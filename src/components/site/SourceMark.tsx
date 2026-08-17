/**
 * Compact endnote-style source marker.
 *
 * Lets body copy state a useful fact plainly and keep the institutional
 * attribution quiet: the marker links down to the nearest SourceNotes block
 * (pass its `id`) where the full reference lives.
 */
export function SourceMark({
  to,
  mark = "\u2020",
  label = "See references",
}: {
  to: string;
  mark?: string;
  label?: string;
}) {
  return (
    <a
      href={`#${to}`}
      aria-label={label}
      className="ml-0.5 align-super text-[0.7em] font-semibold text-primary no-underline hover:underline"
    >
      {mark}
    </a>
  );
}

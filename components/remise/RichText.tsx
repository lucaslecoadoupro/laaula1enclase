import { Fragment } from "react";

/** Affiche les contenus du kit (seules balises utilisées : <br/> et <b>) sans HTML brut. */
export default function RichText({ text, className }: { text: string; className?: string }) {
  const lines = text.split(/<br\s*\/?>/i);
  return (
    <span className={className}>
      {lines.map((line, i) => (
        <Fragment key={i}>
          {i > 0 && <br />}
          {line.split(/(<b>.*?<\/b>)/g).map((part, j) =>
            part.startsWith("<b>") ? <strong key={j}>{part.replace(/<\/?b>/g, "")}</strong> : <Fragment key={j}>{part}</Fragment>
          )}
        </Fragment>
      ))}
    </span>
  );
}

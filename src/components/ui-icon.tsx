import type { IconDefinition } from "@fortawesome/free-solid-svg-icons";

export function UiIcon({ icon, className = "" }: { icon: IconDefinition; className?: string }) {
  const [width, height, , , data] = icon.icon;
  const paths = Array.isArray(data) ? data : [data];
  return <svg className={`ox-ui-icon ${className}`} viewBox={`0 0 ${width} ${height}`} fill="currentColor" aria-hidden="true" focusable="false">
    {paths.map((path, index) => <path key={index} d={path} />)}
  </svg>;
}

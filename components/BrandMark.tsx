/** Logo : un cadre de visée turquoise autour d'un « ñ ». */
export default function BrandMark({ size = 36 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true">
      <g fill="none" stroke="var(--color-teal)" strokeWidth="3.2" strokeLinecap="round">
        <path d="M4 13V8a4 4 0 0 1 4-4h5" />
        <path d="M27 4h5a4 4 0 0 1 4 4v5" />
        <path d="M36 27v5a4 4 0 0 1-4 4h-5" />
        <path d="M13 36H8a4 4 0 0 1-4-4v-5" />
      </g>
      <rect x="10" y="10" width="20" height="20" rx="5" fill="var(--color-ink)" />
      <text
        x="20"
        y="26.5"
        textAnchor="middle"
        fontFamily="var(--font-lexend), sans-serif"
        fontWeight="700"
        fontSize="17"
        fill="var(--color-bg)"
      >
        ñ
      </text>
    </svg>
  );
}

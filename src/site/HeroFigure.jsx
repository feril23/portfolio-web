// Hero character: a developer between the interface and the server, sketched
// line by line on load (see useAnimations). data-draw strokes are drawn in DOM
// order; data-fade fills appear afterwards. Purely decorative for screen readers.
export default function HeroFigure() {
  return (
    <div className="hero-figure" aria-hidden="true">
      <svg viewBox="0 0 440 520" focusable="false">
        <g className="fig-window">
          <rect className="fig-line fig-cover" x="262" y="34" width="158" height="112" rx="8" data-draw />
          <path className="fig-line fig-thin" d="M262 60H420" data-draw />
          <circle className="fig-fill" cx="278" cy="47" r="4" data-fade />
          <circle className="fig-ink" cx="292" cy="47" r="4" data-fade />
          <path className="fig-line fig-accent" d="M280 82H346" data-draw />
          <path className="fig-line fig-thin" d="M280 100H382" data-draw />
          <path className="fig-line fig-thin" d="M280 118H336" data-draw />
          <rect className="fig-fill fig-caret" x="344" y="110" width="8" height="16" data-fade />
        </g>

        <g className="fig-server">
          <rect className="fig-line fig-cover" x="14" y="196" width="104" height="38" rx="6" data-draw />
          <rect className="fig-line fig-cover" x="14" y="234" width="104" height="38" rx="6" data-draw />
          <rect className="fig-line fig-cover" x="14" y="272" width="104" height="38" rx="6" data-draw />
          <circle className="fig-fill" cx="32" cy="215" r="4.5" data-fade />
          <circle className="fig-fill" cx="32" cy="253" r="4.5" data-fade />
          <circle className="fig-fill" cx="32" cy="291" r="4.5" data-fade />
          <path className="fig-line fig-thin" d="M56 215H100M56 253H100M56 291H100" data-draw />
        </g>

        <path className="fig-line fig-thin fig-accent" d="M66 196C66 120 150 62 262 84" data-draw />

        <path className="fig-line fig-cover" d="M92 448C92 362 128 320 186 306L254 306C312 320 348 362 348 448" data-draw />
        <path className="fig-line fig-cover" d="M192 268V306C204 322 236 322 248 306V268" data-draw />

        <path className="fig-line fig-cover" d="M162 196C150 192 146 214 158 224C160 226 164 226 166 224" data-draw />
        <path className="fig-line fig-cover" d="M278 196C290 192 294 214 282 224C280 226 276 226 274 224" data-draw />
        <path className="fig-line fig-cover" d="M162 176C162 136 188 118 220 118C252 118 278 136 278 176V206C278 248 250 280 220 280C190 280 162 248 162 206Z" data-draw />

        <path className="fig-hair" d="M156 186C146 132 186 100 228 104C270 106 292 144 284 186C280 168 268 156 252 152C224 164 190 162 172 158C164 166 160 174 156 186Z" data-fade />
        <path className="fig-line" d="M156 186C146 132 186 100 228 104C270 106 292 144 284 186C280 168 268 156 252 152C224 164 190 162 172 158C164 166 160 174 156 186Z" data-draw />

        <path className="fig-line" d="M180 188C186 183 196 183 202 187M238 187C244 183 254 183 260 188" data-draw />
        <g className="fig-eyes">
          <circle className="fig-ink fig-pupil" cx="192" cy="205" r="5" data-fade />
          <circle className="fig-ink fig-pupil" cx="249" cy="205" r="5" data-fade />
        </g>
        <path className="fig-line fig-thin" d="M220 208C216 218 214 226 224 227" data-draw />
        <path className="fig-line" d="M198 244C208 256 232 256 242 244" data-draw />

        <rect className="fig-fill" x="124" y="336" width="192" height="116" rx="10" data-fade />
        <rect className="fig-line fig-cover" x="124" y="336" width="192" height="116" rx="10" style={{ fillOpacity: 0 }} data-draw />
        <path className="fig-on-fill" d="M202 378L180 394L202 410M238 378L260 394L238 410" data-fade />
        <path className="fig-on-fill" d="M226 372L214 416" data-fade />

        <path className="fig-line" d="M98 452H342L354 466H86Z" data-draw />
        <path className="fig-line" d="M14 466H426" data-draw />

        <path className="fig-line fig-cover" d="M372 410H418L412 466H378Z" data-draw />
        <path className="fig-line" d="M416 420C434 418 434 448 412 446" data-draw />
        <g className="fig-steam"><path className="fig-line fig-thin fig-accent" d="M386 396C378 384 394 376 386 362" data-draw /></g>
        <g className="fig-steam fig-steam--late"><path className="fig-line fig-thin fig-accent" d="M404 396C396 384 412 376 404 362" data-draw /></g>
      </svg>
    </div>
  )
}

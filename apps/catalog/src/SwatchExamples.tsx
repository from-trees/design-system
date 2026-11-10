import { useId, useState } from "react";
import * as stylex from "@stylexjs/stylex";
import {
  ParameterRow,
  Section,
  SwatchPicker,
  type SwatchOption,
} from "@from-trees/ui";
import { layout, gap } from "@from-trees/ui/utilities";
const styles = stylex.create({
  photo: {
    display: "block",
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  photoWrap: {
    display: "block",
    width: "100%",
    height: "100%",
    position: "relative",
    overflow: "hidden",
  },
  dark: { filter: "brightness(0.62)" },
  warm: { filter: "sepia(0.2) brightness(0.94)" },
  sage: {
    position: "absolute",
    inset: 0,
    backgroundColor: "#849184",
    mixBlendMode: "multiply",
  },
  art: { display: "block", width: "100%", height: "100%" },
  demo: { width: "100%", maxWidth: 480 },
});
type Kind =
  | "oak"
  | "walnut"
  | "planks"
  | "dark-planks"
  | "paint-grade"
  | "white"
  | "sage"
  | "charcoal"
  | "natural"
  | "plaster"
  | "white-plaster"
  | "concrete"
  | "quartz"
  | "taj"
  | "granite"
  | "stainless"
  | "slab"
  | "shaker"
  | "slim"
  | "cove"
  | "ogee"
  | "none"
  | "overlay"
  | "inset"
  | "vertical"
  | "horizontal"
  | "automatic"
  | "door-drawer"
  | "single-door"
  | "drawers"
  | "shelves"
  | "pullout"
  | "corner";
/** Illustrative artwork for catalog review. Actual application imagery stays app-owned. */
function Preview({ kind }: { kind: Kind }) {
  const id = useId().replaceAll(":", "");
  const dark = kind === "walnut" || kind === "dark-planks";
  const wood = [
    "oak",
    "walnut",
    "planks",
    "dark-planks",
    "natural",
    "vertical",
    "horizontal",
    "automatic",
  ].includes(kind);
  const flat: Partial<Record<Kind, string>> = {
    white: "#f4f0e7",
    sage: "#7b8d76",
    charcoal: "#3c4142",
    "paint-grade": "#b8a185",
    plaster: "#dfd5c4",
    "white-plaster": "#f0ede5",
    concrete: "#b2b1aa",
    quartz: "#eeeae3",
    taj: "#d5c6a7",
    granite: "#424746",
  };
  const photos: Partial<Record<Kind, string>> = {
    oak: "oak.jpg",
    walnut: "walnut.jpg",
    natural: "oak.jpg",
    planks: "floor.jpg",
    "dark-planks": "floor.jpg",
    concrete: "concrete.jpg",
    plaster: "plaster.jpg",
    "white-plaster": "plaster.jpg",
    sage: "plaster.jpg",
    granite: "granite.jpg",
  };
  if (photos[kind])
    return (
      <span aria-hidden="true" {...stylex.props(styles.photoWrap)}>
        <img
          src={`./swatches/${photos[kind]}`}
          alt=""
          loading="lazy"
          {...stylex.props(
            styles.photo,
            (kind === "dark-planks" || kind === "granite") && styles.dark,
            kind === "plaster" && styles.warm,
          )}
        />
        {kind === "sage" && <span {...stylex.props(styles.sage)} />}
      </span>
    );
  const front = ["slab", "shaker", "slim"].includes(kind);
  const config = [
    "door-drawer",
    "single-door",
    "drawers",
    "shelves",
    "pullout",
    "corner",
  ].includes(kind);
  return (
    <svg
      viewBox="0 0 120 80"
      aria-hidden="true"
      focusable="false"
      {...stylex.props(styles.art)}
    >
      <defs>
        <pattern
          id={`${id}-grain`}
          width="35"
          height="80"
          patternUnits="userSpaceOnUse"
          patternTransform={kind === "horizontal" ? "rotate(90)" : undefined}
        >
          <rect width="35" height="80" fill={dark ? "#71513c" : "#c9a777"} />
          {[4, 12, 22, 30].map((x, i) => (
            <path
              key={x}
              d={`M${x} -10 C${x - 8} 10 ${x + 9} 24 ${x} 42 S${x - 6} 67 ${x + 2} 90`}
              fill="none"
              stroke={dark ? "#39281e" : "#88633d"}
              strokeWidth={i % 2 ? 0.6 : 1.3}
              opacity="0.45"
            />
          ))}
        </pattern>
        <linearGradient id={`${id}-metal`}>
          <stop stopColor="#747d7e" />
          <stop offset="0.35" stopColor="#e5e8e8" />
          <stop offset="0.65" stopColor="#a3acac" />
          <stop offset="1" stopColor="#d1d6d6" />
        </linearGradient>
      </defs>
      <rect
        width="120"
        height="80"
        fill={
          wood
            ? `url(#${id}-grain)`
            : kind === "stainless"
              ? `url(#${id}-metal)`
              : (flat[kind] ?? "#edf0ed")
        }
      />
      {(kind === "planks" || kind === "dark-planks") && (
        <g stroke={dark ? "#3b2c23" : "#8e744f"} strokeWidth="1">
          <path d="M30 0V80M60 0V80M90 0V80M0 30H30M30 60H60M60 20H90M90 50H120" />
        </g>
      )}
      {[
        "plaster",
        "white-plaster",
        "concrete",
        "paint-grade",
        "granite",
      ].includes(kind) &&
        Array.from({ length: 36 }, (_, i) => (
          <circle
            key={i}
            cx={(i * 29 + 7) % 120}
            cy={(i * 19 + 11) % 80}
            r={kind === "granite" ? 1.2 : 0.7}
            fill={kind === "granite" ? "#c0beb0" : "#857d70"}
            opacity="0.3"
          />
        ))}
      {(kind === "quartz" || kind === "taj") && (
        <g
          fill="none"
          stroke={kind === "taj" ? "#9d8a68" : "#b4b7b2"}
          opacity="0.55"
        >
          <path d="M-10 65C24 60 26 19 58 29S94 0 130 8" strokeWidth="1.6" />
          <path d="M-10 70C20 65 35 34 57 38S104 10 130 14" strokeWidth="0.6" />
          <path d="M34 82C55 61 78 73 99 48S123 40 130 38" strokeWidth="1" />
        </g>
      )}
      {front && (
        <g stroke="#626f66" strokeWidth="1.4">
          <rect x="10" y="7" width="43" height="66" rx="1" fill="#d7dfd6" />
          <rect x="65" y="9" width="45" height="27" rx="1" fill="#d7dfd6" />
          <rect x="65" y="44" width="45" height="27" rx="1" fill="#d7dfd6" />
          {kind !== "slab" && (
            <>
              <rect
                x={kind === "slim" ? 14 : 18}
                y={kind === "slim" ? 11 : 15}
                width={kind === "slim" ? 35 : 27}
                height={kind === "slim" ? 58 : 50}
                fill="#f5f6f2"
              />
              {[9, 44].map((y) => (
                <rect
                  key={y}
                  x={kind === "slim" ? 69 : 73}
                  y={y + (kind === "slim" ? 4 : 7)}
                  width={kind === "slim" ? 37 : 29}
                  height={kind === "slim" ? 19 : 13}
                  fill="#f5f6f2"
                />
              ))}
            </>
          )}
        </g>
      )}
      {(kind === "cove" || kind === "ogee") && (
        <g fill="#d7dfd6" stroke="#526158" strokeWidth="1.7">
          <path
            d={
              kind === "cove"
                ? "M17 68V12H103V23H90C53 23 64 55 29 59V68Z"
                : "M17 68V12H103V22H89C88 34 64 23 64 41C64 57 35 47 31 60V68Z"
            }
          />
          <path d="M17 17H103M18 64H30" fill="none" />
        </g>
      )}
      {kind === "none" && (
        <path d="M42 40H78" stroke="#879087" strokeWidth="3" />
      )}
      {(kind === "overlay" || kind === "inset") && (
        <g stroke="#526158" strokeWidth="2">
          <rect x="20" y="7" width="80" height="66" fill="#9aa79b" />
          <rect
            x={kind === "overlay" ? 23 : 31}
            y={kind === "overlay" ? 10 : 18}
            width={kind === "overlay" ? 74 : 58}
            height={kind === "overlay" ? 60 : 44}
            fill="#e8ece4"
          />
          <path d="M60 12V68" strokeWidth="1" />
        </g>
      )}
      {["vertical", "horizontal", "automatic"].includes(kind) && (
        <g fill="none" stroke="#f9f7ed" strokeWidth="3">
          {kind !== "horizontal" && (
            <path d="M60 15V65M54 22L60 15L66 22M54 58L60 65L66 58" />
          )}
          {kind !== "vertical" && (
            <path d="M30 40H90M37 34L30 40L37 46M83 34L90 40L83 46" />
          )}
        </g>
      )}
      {config && (
        <g stroke="#526158" strokeWidth="1.8" fill="#dce4da">
          <rect x="29" y="7" width="62" height="66" fill="#f5f6f2" />
          {kind === "single-door" && (
            <>
              <rect x="33" y="11" width="54" height="58" />
              <circle cx="79" cy="41" r="1.5" />
            </>
          )}
          {kind === "door-drawer" && (
            <>
              <rect x="33" y="11" width="54" height="16" />
              <rect x="33" y="31" width="54" height="38" />
              <path d="M53 18H67M79 44V54" />
            </>
          )}
          {kind === "drawers" &&
            [11, 31, 51].map((y) => (
              <g key={y}>
                <rect x="33" y={y} width="54" height="18" />
                <path d={`M53 ${y + 7}H67`} />
              </g>
            ))}
          {kind === "shelves" && (
            <>
              <path d="M33 28H87M33 49H87M33 69H87" />
              <path d="M33 11V69M87 11V69" />
            </>
          )}
          {kind === "pullout" && (
            <>
              <rect x="34" y="12" width="22" height="57" />
              <path d="M40 34V48" />
              <path d="M59 19L101 27V61L59 68Z" fill="#b9c9b6" />
              <path d="M65 29L95 35M65 44L95 49M65 58L95 61" />
            </>
          )}
          {kind === "corner" && (
            <>
              <path d="M34 12H86V69H60V43H34Z" />
              <path d="M60 43L86 12" />
            </>
          )}
        </g>
      )}
    </svg>
  );
}
const option = (
  id: string,
  kind: Kind,
  label = id,
  description?: string,
): SwatchOption => ({
  id,
  label,
  preview: <Preview kind={kind} />,
  description,
});
export const swatches = {
  material: [
    option("Oak", "oak"),
    option("Walnut", "walnut"),
    option("Paint grade", "paint-grade"),
  ],
  color: [
    option("Natural", "natural"),
    option("White", "white"),
    option("Sage", "sage"),
    option("Charcoal", "charcoal"),
  ],
  front: [
    option(
      "Shaker",
      "shaker",
      "Shaker",
      "Framed front with a recessed center.",
    ),
    option("Slab", "slab", "Slab", "Flat door and drawer fronts."),
    option(
      "Slim shaker",
      "slim",
      "Slim shaker",
      "Narrow frame around a recessed center.",
    ),
  ],
  overlay: [option("Full overlay", "overlay"), option("Inset", "inset")],
  grain: [
    option("Automatic", "automatic"),
    option("Vertical", "vertical"),
    option("Horizontal", "horizontal"),
  ],
  walls: [
    option("Warm plaster", "plaster"),
    option("White plaster", "white-plaster"),
    option("Sage paint", "sage"),
  ],
  floors: [
    option("Oak", "planks"),
    option("Dark wood", "dark-planks"),
    option("Concrete", "concrete"),
  ],
  countertops: [
    option("White quartz", "quartz"),
    option("Taj Mahal", "taj"),
    option("Dark granite", "granite"),
  ],
  crown: [
    option("None", "none"),
    option("Cove", "cove"),
    option("Ogee", "ogee"),
  ],
  finish: [
    option("Oak", "oak"),
    option("Walnut", "walnut"),
    option("White paint", "white"),
  ],
  object: [
    option("oak", "oak", "Oak"),
    option("walnut", "walnut", "Walnut"),
    option("white paint", "white", "White paint"),
    option("stainless", "stainless", "Stainless"),
  ],
  configuration: [
    option("door-drawer", "door-drawer", "Door + drawer"),
    option("single-door", "single-door", "Single door"),
    option("drawers", "drawers", "Drawers"),
    option("open shelves", "shelves", "Open shelves"),
    option("pullout", "pullout", "Pullout"),
    option("corner", "corner", "Corner"),
  ],
} satisfies Record<string, SwatchOption[]>;
export function VisualChoice({
  label,
  value,
  category,
  onChange,
  disabled,
  help,
}: {
  label: string;
  value: string;
  category: keyof typeof swatches;
  onChange: (value: string) => void;
  disabled?: boolean;
  help?: string;
}) {
  return (
    <ParameterRow label={label} help={help}>
      <SwatchPicker
        value={value}
        options={swatches[category]}
        onChange={onChange}
        disabled={disabled}
      />
    </ParameterRow>
  );
}
export function SwatchesDemo() {
  const [values, setValues] = useState({
    material: "walnut-natural",
    color: "Natural",
    front: "Shaker",
    crown: "Cove",
    walls: "Warm plaster",
    floors: "Oak",
    countertops: "White quartz",
    configuration: "door-drawer",
  });
  return (
    <div {...stylex.props(styles.demo, layout.stack, gap.xl)}>
      <ParameterRow
        label="Material"
        help="Choose a complete named material from Built-In or Library. Each choice includes its own finish."
      >
        <SwatchPicker
          value={values.material}
          onChange={(material) =>
            setValues((current) => ({ ...current, material }))
          }
          groups={[
            {
              id: "built-in",
              label: "Built-In",
              options: [
                option("walnut-natural", "walnut", "Walnut · Natural"),
                option("oak-natural", "oak", "Oak · Natural"),
                option("white-paint", "white", "White paint"),
                option("sage-paint", "sage", "Sage green paint"),
                option("warm-plaster", "plaster", "Warm white plaster"),
                option("quartz", "quartz", "White quartz"),
              ],
            },
            {
              id: "library",
              label: "Library",
              options: [
                option("library-walnut", "walnut", "Walnut veneer PBR"),
                option("library-oak", "planks", "Oak floor PBR"),
                option("library-granite", "granite", "Dark granite PBR"),
              ],
            },
          ]}
        />
      </ParameterRow>
      {(
        [
          ["front", "Front profile"],
          ["configuration", "Configuration"],
          ["crown", "Crown profile"],
        ] as const
      ).map(([key, label]) => (
        <VisualChoice
          key={key}
          label={label}
          value={values[key]}
          category={key}
          onChange={(value) =>
            setValues((current) => ({ ...current, [key]: value }))
          }
        />
      ))}
      <Section title="Room surfaces" collapsible>
        {(
          [
            ["walls", "Walls"],
            ["floors", "Floor"],
            ["countertops", "Countertops"],
          ] as const
        ).map(([key, label]) => (
          <VisualChoice
            key={key}
            label={label}
            value={values[key]}
            category={key}
            onChange={(value) =>
              setValues((current) => ({ ...current, [key]: value }))
            }
          />
        ))}
      </Section>
    </div>
  );
}

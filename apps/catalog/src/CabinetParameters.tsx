import {
  Parameters,
  type Parameter,
  type ParameterGroup,
} from "@from-trees/ui";

// Application policy lives in this reusable wrapper, never in the UI package.
export type CabinetParameterKey =
  | "width"
  | "height"
  | "depth"
  | "offset"
  | "heightFromFloor"
  | "setback"
  | "rotation";
export type CabinetParameterValues = Record<CabinetParameterKey, number>;
export function CabinetParameters({
  values,
  onChange,
  subset = false,
  disabled = false,
  readOnly = false,
}: {
  values: CabinetParameterValues;
  onChange: (key: CabinetParameterKey, value: number) => void;
  subset?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
}) {
  const field = (
    key: CabinetParameterKey,
    label: string,
    icon: Parameter["icon"],
    options: Partial<Parameter> = {},
  ): Parameter => ({
    id: key,
    label,
    icon,
    value: values[key],
    onChange: (value) => onChange(key, value),
    disabled,
    readOnly,
    ...options,
  });
  const groups: ParameterGroup[] = [
    {
      id: "size",
      label: "Size",
      helpLabel: "Entering measurements",
      help: "Use decimals or fractions, such as 30 1/2, 30.5 or 1/2. Changes apply when focus leaves the field. Enter finishes editing; Escape resets the draft.",
      parameters: [
        field("width", "Width", "width", { min: 1 }),
        field("height", "Height", "height", { min: 1 }),
        field("depth", "Depth", "depth", { min: 1 }),
      ],
    },
    ...(!subset
      ? [
          {
            id: "position",
            label: "Position",
            parameters: [
              field("offset", "Offset from left", "offset", {
                reference: "From the start of the parent wall.",
              }),
              field("heightFromFloor", "Height from floor", "ground"),
              field("setback", "Setback", "depth"),
            ],
          },
          {
            id: "orientation",
            label: "Orientation",
            parameters: [
              field("rotation", "Rotation", "rotation", { unit: "°" }),
            ],
          },
        ]
      : []),
  ];
  return <Parameters groups={groups} unit="in" />;
}

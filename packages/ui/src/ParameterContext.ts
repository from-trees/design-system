import { createContext, useContext } from "react";

/** Forward these attributes to the single editable control in a parameter row. */
export type ParameterControlProps = {
  id: string;
  "aria-labelledby": string;
  "aria-describedby"?: string;
  "aria-invalid"?: true;
};
export const ParameterContext = createContext<
  ParameterControlProps | undefined
>(undefined);
export const useParameterControl = () => useContext(ParameterContext);

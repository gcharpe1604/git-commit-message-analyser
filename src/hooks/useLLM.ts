import { useContext } from "react";
import { AIContext } from "../contexts/AIContext";

export const useLLM = () => {
  const context = useContext(AIContext);
  if (!context) throw new Error("useLLM must be used within an AIProvider");
  return context;
};

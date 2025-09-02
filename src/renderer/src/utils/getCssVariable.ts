const getCssVariable = (variableName: string): string => {
  return getComputedStyle(document.documentElement)
    .getPropertyValue(variableName)
    .trim();
};
export default getCssVariable;
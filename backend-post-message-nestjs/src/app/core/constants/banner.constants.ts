export const WIDTH = 50;

export const row = (label: string, value: string): string => {
  const content = `  ${label.padEnd(10)}: ${value}`;
  return `│${content.padEnd(WIDTH)}│`;
};

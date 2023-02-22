export const svgRect = (options={x: 0, y: 0, width: 50, height: 50, className: "", color: "red",}) => {

  const { x, y, width, height, className, color, } = options;

  const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");

  rect.setAttribute("x", `${x}`);
  rect.setAttribute("y", `${y}`);
  rect.setAttribute("width", `${width}`);
  rect.setAttribute("height", `${height}`);
  const css = `stroke: ${color}; stroke-width: 1px; fill: transparent;`;
  rect.setAttribute("style", css);
  rect.setAttribute("class", className);

  return rect;
}

export const svgText = (textString, options={ x: 0, y: 0, size: "16px", color: "red", }) => {

  const { x, y, size, color, } = options;

  const css = `font-size: ${size}; font-weight: 300; stroke: ${color}; fill: ${color};`;

  const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
  text.setAttribute("x", x-4);
  text.setAttribute("y", y-4);
  const textNode = document.createTextNode(textString);
  text.appendChild( textNode );
  text.setAttribute("style", css);

  return text;
}
import "./chunk-MKBO26DX.js";

// src/main.ts
import { h } from "preact";
function Render(props) {
  return h(
    props.tag,
    { dangerouslySetInnerHTML: { __html: props.html } }
  );
}
export {
  Render
};

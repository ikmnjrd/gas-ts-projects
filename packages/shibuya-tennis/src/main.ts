import { getUseMonth } from "./date";
import { sendPostRequest } from "./fetch";

function main(): void {
  const month = getUseMonth();
  sendPostRequest(month);
}

// GASから参照したい変数はglobalオブジェクトに渡してあげる必要がある
// @ts-expect-error
global.main = main;

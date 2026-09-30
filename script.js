"use strict";

/* ---------- Expression evaluation (no eval) ---------- */

const OPERATORS = ["+", "-", "*", "/"];

function tokenize(expr) {
  const tokens = [];
  let i = 0;
  while (i < expr.length) {
    const ch = expr[i];
    if (OPERATORS.includes(ch)) {
      tokens.push({ type: "op", value: ch });
      i++;
    } else if (/[0-9.]/.test(ch)) {
      let j = i;
      while (j < expr.length && /[0-9.]/.test(expr[j])) j++;
      const raw = expr.slice(i, j);
      if ((raw.match(/\./g) || []).length > 1 || raw === ".") {
        throw new Error("Invalid number");
      }
      tokens.push({ type: "num", value: parseFloat(raw) });
      i = j;
    } else {
      throw new Error("Invalid character");
    }
  }
  return tokens;
}

// expr := term (('+' | '-') term)* ; term := unary (('*' | '/') unary)*
function evaluateTokens(tokens) {
  let pos = 0;

  function unary() {
    const t = tokens[pos];
    if (!t) throw new Error("Incomplete expression");
    if (t.type === "op" && (t.value === "-" || t.value === "+")) {
      pos++;
      const v = unary();
      return t.value === "-" ? -v : v;
    }
    if (t.type === "num") {
      pos++;
      return t.value;
    }
    throw new Error("Unexpected operator");
  }

  function term() {
    let left = unary();
    while (tokens[pos] && (tokens[pos].value === "*" || tokens[pos].value === "/")) {
      const op = tokens[pos++].value;
      const right = unary();
      if (op === "/" && right === 0) throw new Error("Cannot divide by zero");
      left = op === "*" ? left * right : left / right;
    }
    return left;
  }

  function expression() {
    let left = term();
    while (tokens[pos] && (tokens[pos].value === "+" || tokens[pos].value === "-")) {
      const op = tokens[pos++].value;
      const right = term();
      left = op === "+" ? left + right : left - right;
    }
    return left;
  }

  const result = expression();
  if (pos !== tokens.length) throw new Error("Unexpected input");
  return result;
}

function evaluate(expr) {
  return evaluateTokens(tokenize(expr));
}

// Trim floating-point noise: 0.1 + 0.2 -> "0.3"
function formatNumber(n) {
  if (!Number.isFinite(n)) throw new Error("Result out of range");
  return String(Number(n.toPrecision(12)));
}

/* ---------- Calculator state ---------- */

const display = document.getElementById("display");
const memoryIndicator = document.getElementById("memory-indicator");

let expression = "";
let justEvaluated = false; // last action was "=" (or "%"/memory result)
let hasError = false;
let memory = 0;
let hasMemory = false;

function render() {
  display.value = expression;
  memoryIndicator.textContent = hasMemory ? "M" : "\u00a0";
}

function showError(message) {
  expression = message;
  hasError = true;
  justEvaluated = false;
  render();
}

function resetIfNeeded() {
  if (hasError) {
    expression = "";
    hasError = false;
  }
}

function currentNumber() {
  const m = expression.match(/[0-9.]+$/);
  return m ? m[0] : "";
}

function endsWithOperator() {
  return OPERATORS.includes(expression.slice(-1));
}

// Evaluate what's on screen, ignoring a dangling operator ("5+" -> 5).
function evaluateCurrent() {
  let expr = expression;
  while (expr && OPERATORS.includes(expr.slice(-1))) expr = expr.slice(0, -1);
  if (!expr) return null;
  return evaluate(expr);
}

/* ---------- Actions ---------- */

function inputDigit(d) {
  if (justEvaluated || hasError) {
    expression = "";
    justEvaluated = false;
    hasError = false;
  }
  const num = currentNumber();
  if (num === "0" && d !== ".") {
    // avoid leading zeros like "007"
    expression = expression.slice(0, -1) + d;
  } else {
    expression += d;
  }
  render();
}

function inputDecimal() {
  if (justEvaluated || hasError) {
    expression = "";
    justEvaluated = false;
    hasError = false;
  }
  const num = currentNumber();
  if (num.includes(".")) return;
  expression += num === "" ? "0." : ".";
  render();
}

function inputOperator(op) {
  resetIfNeeded();
  justEvaluated = false;
  if (expression === "") {
    if (op === "-") expression = "-"; // allow a leading negative number
    render();
    return;
  }
  if (expression === "-") return;
  if (endsWithOperator()) {
    // allow "5*-3", otherwise replace the previous operator(s)
    const prev = expression.slice(-1);
    if (op === "-" && (prev === "*" || prev === "/")) {
      expression += op;
    } else {
      while (endsWithOperator()) expression = expression.slice(0, -1);
      if (expression) expression += op;
    }
  } else {
    expression += op;
  }
  render();
}

function clearAll() {
  expression = "";
  justEvaluated = false;
  hasError = false;
  render();
}

function backspace() {
  if (hasError || justEvaluated) return clearAll();
  expression = expression.slice(0, -1);
  render();
}

function equals() {
  if (hasError) return;
  try {
    const result = evaluateCurrent();
    if (result === null) return;
    expression = formatNumber(result);
    justEvaluated = true;
    render();
  } catch (e) {
    showError(e.message === "Cannot divide by zero" ? e.message : "Error");
  }
}

// "50 + 10 %" -> 50 + 5 (10% of 50); "200 * 10 %" -> 200 * 0.1; "10 %" -> 0.1
function percent() {
  if (hasError) return;
  const num = currentNumber();
  if (!num) return;
  try {
    const before = expression.slice(0, expression.length - num.length);
    const n = parseFloat(num);
    let pct = n / 100;
    const op = before.slice(-1);
    if ((op === "+" || op === "-") && before.length > 1) {
      const base = evaluate(before.slice(0, -1));
      pct = (base * n) / 100;
    }
    expression = before + formatNumber(pct);
    justEvaluated = false;
    render();
  } catch (e) {
    showError("Error");
  }
}

function memoryChange(sign) {
  if (hasError) return;
  try {
    const value = evaluateCurrent();
    if (value === null) return;
    memory += sign * value;
    hasMemory = true;
    expression = formatNumber(value);
    justEvaluated = true;
    render();
  } catch (e) {
    showError("Error");
  }
}

function memoryRecall() {
  if (!hasMemory) return;
  resetIfNeeded();
  if (justEvaluated) {
    expression = "";
    justEvaluated = false;
  }
  const num = currentNumber();
  expression = expression.slice(0, expression.length - num.length) + formatNumber(memory);
  render();
}

function memoryClear() {
  memory = 0;
  hasMemory = false;
  render();
}

const ACTIONS = {
  clear: clearAll,
  backspace,
  equals,
  percent,
  "memory-add": () => memoryChange(1),
  "memory-subtract": () => memoryChange(-1),
  "memory-recall": memoryRecall,
  "memory-clear": memoryClear,
};

function handleValue(value) {
  if (/^[0-9]$/.test(value)) inputDigit(value);
  else if (value === ".") inputDecimal();
  else if (OPERATORS.includes(value)) inputOperator(value);
}

/* ---------- Event wiring ---------- */

document.querySelectorAll(".button").forEach((button) => {
  button.addEventListener("click", () => {
    const { action, value } = button.dataset;
    if (action && ACTIONS[action]) ACTIONS[action]();
    else if (value !== undefined) handleValue(value);
  });
});

document.addEventListener("keydown", (e) => {
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  const key = e.key;
  if (/^[0-9.]$/.test(key) || OPERATORS.includes(key)) {
    e.preventDefault(); // e.g. "/" opens quick-find in some browsers
    handleValue(key);
  } else if (key === "Enter" || key === "=") {
    e.preventDefault();
    equals();
  } else if (key === "%") {
    percent();
  } else if (key === "Backspace") {
    e.preventDefault();
    backspace();
  } else if (key === "Escape" || key === "Delete") {
    clearAll();
  }
});

render();
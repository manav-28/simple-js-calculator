# Calculator
A simple calculator app built with HTML, CSS, and JavaScript.

## Features
- Basic arithmetic (`+ - * /`) with correct operator precedence and negative numbers
- Percent that behaves like a handheld calculator (`50 + 10 %` → `55`)
- Working memory: `M+`, `M-`, `MR` (recall), `MC` (clear)
- Backspace, clear, and full keyboard support (digits, operators, `Enter`/`=`, `Backspace`, `Esc`, `%`)
- Friendly error messages (e.g. dividing by zero) instead of silent failures
- Expressions are parsed by a small hand-written evaluator — no `eval`

## Run it
Open `index.html` in a browser. No build step or dependencies.
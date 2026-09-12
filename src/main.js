import { add, greet, incrementCounter, isPositive } from './utils.js';

const greetingEl = document.querySelector('[data-testid="greeting"]');
const sumEl = document.querySelector('[data-testid="sum"]');
const statusEl = document.querySelector('[data-testid="status"]');
const incrementBtn = document.querySelector('[data-testid="increment-btn"]');
const resetBtn = document.querySelector('[data-testid="reset-btn"]');
const greetBtn = document.querySelector('[data-testid="greet-btn"]');

let counter = 0;

function setStatus(message) {
  statusEl.textContent = message;
}

function render() {
  sumEl.textContent = String(counter);
  greetingEl.textContent = greet('TestDino');
  setStatus(isPositive(counter) ? `Counter is positive: ${counter}` : 'Counter is zero');
}

incrementBtn.addEventListener('click', () => {
  counter = incrementCounter(counter);
  render();
});

resetBtn.addEventListener('click', () => {
  counter = 0;
  render();
});

greetBtn.addEventListener('click', () => {
  greetingEl.textContent = greet('Coverage');
  setStatus(`Sum preview: ${add(counter, 10)}`);
});

render();

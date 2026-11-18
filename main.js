const denominations = { dollars: 100, quarters: 25, dimes: 10, nickels: 5, pennies: 1 };

function parseCents(value) {
  const match = /^(?:(\d+)(?:\.(\d{0,2}))?|\.(\d{1,2}))$/.exec(value.trim());
  if (!match) return null;

  const cents = Number((match[1] ?? '0') + (match[2] ?? match[3] ?? '').padEnd(2, '0'));
  return Number.isSafeInteger(cents) ? cents : null;
}

function calculateChange(sale, received) {
  const total = parseCents(sale);
  const tendered = parseCents(received);

  if (total === null || tendered === null) {
    return { error: 'Enter both amounts in dollars with up to two decimal places.' };
  }
  if (tendered < total) {
    return { error: 'Amount received must cover the sale total.' };
  }

  const cents = tendered - total;
  let remainder = cents;
  const counts = {};
  for (const [name, value] of Object.entries(denominations)) {
    counts[name] = Math.floor(remainder / value);
    remainder %= value;
  }
  return { cents, counts };
}

function formatCents(cents) {
  const digits = String(cents).padStart(3, '0');
  return '$' + digits.slice(0, -2) + '.' + digits.slice(-2);
}

if (typeof document !== 'undefined') {
  const form = document.getElementById('change-form');
  const sale = document.getElementById('amount-due');
  const received = document.getElementById('amount-received');
  const error = document.getElementById('error');
  const total = document.getElementById('change-total');
  const outputs = Object.keys(denominations).map(name => [
    name, document.getElementById(name + '-output'),
  ]);

  form.addEventListener('submit', event => {
    event.preventDefault();
    const result = calculateChange(sale.value, received.value);
    error.hidden = !result.error;
    error.textContent = result.error ?? '';
    total.textContent = result.error ? '—' : formatCents(result.cents);
    for (const [name, output] of outputs) {
      output.textContent = result.error ? '—' : result.counts[name];
    }
  });
}

if (typeof module !== 'undefined') {
  module.exports = { calculateChange, formatCents };
}

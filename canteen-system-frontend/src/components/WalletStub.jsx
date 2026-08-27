const fmt = (n) =>
  Number(n ?? 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// The app's signature element: a wallet balance rendered like a torn
// ledger/token stub. Used on the student dashboard and the admin
// per-student wallet view so balance always reads the same way.
export default function WalletStub({ wallet, studentId, badge }) {
  if (!wallet) return null;
  return (
    <div className="wallet-stub">
      <div className="wallet-stub-top">
        <div>
          <span className="eyebrow">Wallet Balance</span>
          {studentId && <div className="wallet-stub-id">{studentId}</div>}
        </div>
        {badge && <span className="wallet-stub-badge">{badge}</span>}
      </div>

      <div className="wallet-stub-balance">
        <span className="cur">₹</span>
        {fmt(wallet.currentBalance)}
      </div>

      <div className="wallet-stub-tear" />

      <div className="wallet-stub-foot">
        <div className="wallet-stub-metric">
          <div className="label">Monthly Target</div>
          <div className="amt">₹{fmt(wallet.monthlyTarget)}</div>
        </div>
        <div className="wallet-stub-metric">
          <div className="label">Credited</div>
          <div className="amt credit">+₹{fmt(wallet.currentMonthCredit)}</div>
        </div>
        <div className="wallet-stub-metric">
          <div className="label">Spent</div>
          <div className="amt debit">-₹{fmt(wallet.currentMonthSpending)}</div>
        </div>
      </div>
    </div>
  );
}

export function WalletPill({ amount }) {
  return (
    <span className="wallet-pill">
      <span className="cur">₹</span>
      {fmt(amount)}
    </span>
  );
}

export { fmt };

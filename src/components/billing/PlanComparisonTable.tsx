export function PlanComparisonTable() {
  return (
    <table className="w-full overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-white text-sm">
      <thead>
        <tr className="border-b border-[var(--color-border)] bg-[var(--color-cloud)] text-left">
          <th className="p-3 font-medium">Capability</th>
          <th className="p-3 font-medium">Free</th>
          <th className="p-3 font-medium">Plus</th>
        </tr>
      </thead>
      <tbody>
        <tr className="border-b border-[var(--color-border)]">
          <td className="p-3">Discovery and messaging</td>
          <td className="p-3">Included</td>
          <td className="p-3">Included</td>
        </tr>
        <tr className="border-b border-[var(--color-border)]">
          <td className="p-3">Daily recommendations</td>
          <td className="p-3">12</td>
          <td className="p-3">12 (no ranking boost)</td>
        </tr>
        <tr className="border-b border-[var(--color-border)]">
          <td className="p-3">Active games</td>
          <td className="p-3">8</td>
          <td className="p-3">25</td>
        </tr>
        <tr className="border-b border-[var(--color-border)]">
          <td className="p-3">Private groups you own</td>
          <td className="p-3">1</td>
          <td className="p-3">Up to 10</td>
        </tr>
        <tr className="border-b border-[var(--color-border)]">
          <td className="p-3">Saved searches</td>
          <td className="p-3">0</td>
          <td className="p-3">10</td>
        </tr>
        <tr>
          <td className="p-3">Block, report, delete</td>
          <td className="p-3">Included</td>
          <td className="p-3">Included</td>
        </tr>
      </tbody>
    </table>
  );
}

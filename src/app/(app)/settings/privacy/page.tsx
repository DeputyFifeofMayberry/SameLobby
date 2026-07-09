import { DataExportPanel } from "@/components/settings/DataExportPanel";

export default function PrivacySettingsPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold">
        Privacy and data
      </h1>
      <DataExportPanel />
    </div>
  );
}

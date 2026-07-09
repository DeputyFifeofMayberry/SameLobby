"use client";

import { useEffect } from "react";
import { initClientAnalytics } from "@/lib/analytics/events";

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    void initClientAnalytics();
  }, []);

  return children;
}

"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Select } from "@/components/ui/Select";
import type { IntentGoal } from "@/domains/profile/types";

type Option = { id: string; name: string };
type GoalOption = { value: IntentGoal; label: string };

type DiscoverSearchFormProps = {
  games: Option[];
  platforms: Option[];
  goals: GoalOption[];
  actionPath?: string;
};

export function DiscoverSearchForm({
  games,
  platforms,
  goals,
  actionPath = "/discover/search",
}: DiscoverSearchFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [query, setQuery] = useState("");
  const [gameId, setGameId] = useState("");
  const [platformId, setPlatformId] = useState("");
  const [goal, setGoal] = useState("");

  function submit() {
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (gameId) params.set("game", gameId);
    if (platformId) params.set("platform", platformId);
    if (goal) params.set("goal", goal);

    startTransition(() => {
      const qs = params.toString();
      router.push(qs ? `${actionPath}?${qs}` : actionPath);
    });
  }

  return (
    <div className="mt-4 grid gap-4 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <Label htmlFor="discover-query">Display name</Label>
        <Input
          id="discover-query"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name"
        />
      </div>
      <div>
        <Label htmlFor="discover-game">Game</Label>
        <Select
          id="discover-game"
          value={gameId}
          onChange={(e) => setGameId(e.target.value)}
        >
          <option value="">Any game</option>
          {games.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name}
            </option>
          ))}
        </Select>
      </div>
      <div>
        <Label htmlFor="discover-platform">Platform</Label>
        <Select
          id="discover-platform"
          value={platformId}
          onChange={(e) => setPlatformId(e.target.value)}
        >
          <option value="">Any platform</option>
          {platforms.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </Select>
      </div>
      <div className="sm:col-span-2">
        <Label htmlFor="discover-goal">Goal</Label>
        <Select
          id="discover-goal"
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
        >
          <option value="">Any goal</option>
          {goals.map((g) => (
            <option key={g.value} value={g.value}>
              {g.label}
            </option>
          ))}
        </Select>
      </div>
      <div className="sm:col-span-2">
        <Button type="button" disabled={pending} onClick={submit}>
          {pending ? "Searching…" : "Search"}
        </Button>
      </div>
    </div>
  );
}

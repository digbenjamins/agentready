"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface Check {
  id: string;
  name: string;
  description: string;
  passed: boolean;
  details: string | null;
}

interface Submission {
  id: string;
  email: string;
  website: string;
  status: string;
  createdAt: string;
  checks: Check[];
}

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (!res.ok) {
      setError("Invalid password");
      return;
    }

    setLoggedIn(true);
    fetchSubmissions();
  }

  async function fetchSubmissions() {
    setLoading(true);
    const res = await fetch("/api/submissions");
    if (res.ok) {
      const data = await res.json();
      setSubmissions(data);
    }
    setLoading(false);
  }

  if (!loggedIn) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle>Admin Login</CardTitle>
            <CardDescription>
              Enter the admin password to view submissions.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" className="w-full">
                Login
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">AgentReady Admin</h1>
          <Button variant="outline" size="sm" onClick={fetchSubmissions}>
            {loading ? "Refreshing..." : "Refresh"}
          </Button>
        </div>

        {submissions.length === 0 && !loading && (
          <p className="text-muted-foreground text-center py-12">
            No submissions yet.
          </p>
        )}

        <div className="space-y-4">
          {submissions.map((sub) => {
            const passedCount = sub.checks.filter((c) => c.passed).length;
            const score =
              sub.checks.length > 0
                ? Math.round((passedCount / sub.checks.length) * 100)
                : 0;

            return (
              <Card key={sub.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base">
                        {sub.website}
                      </CardTitle>
                      <CardDescription>
                        {sub.email} &middot;{" "}
                        {new Date(sub.createdAt).toLocaleString()} &middot;{" "}
                        <span
                          className={`font-medium ${
                            sub.status === "completed"
                              ? "text-green-600"
                              : sub.status === "failed"
                              ? "text-red-600"
                              : "text-yellow-600"
                          }`}
                        >
                          {sub.status}
                        </span>
                      </CardDescription>
                    </div>
                    <span
                      className={`text-2xl font-bold ${
                        score >= 66
                          ? "text-green-600"
                          : score >= 33
                          ? "text-yellow-600"
                          : "text-red-600"
                      }`}
                    >
                      {score}%
                    </span>
                  </div>
                </CardHeader>
                {sub.checks.length > 0 && (
                  <CardContent>
                    <div className="space-y-2">
                      {sub.checks.map((check) => (
                        <div
                          key={check.id}
                          className="flex items-center gap-2 text-sm"
                        >
                          <span
                            className={
                              check.passed ? "text-green-600" : "text-red-500"
                            }
                          >
                            {check.passed ? "✓" : "✗"}
                          </span>
                          <span className="font-medium">{check.name}</span>
                          {check.details && (
                            <span className="text-muted-foreground">
                              — {check.details}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      </div>
    </main>
  );
}

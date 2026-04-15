"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

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
  score: number | null;
  pro: boolean;
  status: string;
  createdAt: string;
  checks: Check[];
}

export default function SubmissionsPage() {
  const router = useRouter();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchSubmissions() {
    setLoading(true);
    const res = await fetch("/api/submissions");
    if (res.status === 401) {
      router.push("/");
      return;
    }
    if (res.ok) {
      setSubmissions(await res.json());
    }
    setLoading(false);
  }

  useEffect(() => { fetchSubmissions(); }, []);

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold">All Submissions</h2>
        <Button variant="outline" size="sm" onClick={fetchSubmissions}>
          {loading ? "Refreshing..." : "Refresh"}
        </Button>
      </div>

      {submissions.length === 0 && !loading && (
        <p className="text-muted-foreground text-center py-12">No submissions yet.</p>
      )}

      <div className="space-y-4">
        {submissions.map((sub) => {
          const passedCount = sub.checks.filter((c) => c.passed).length;
          const score = sub.checks.length > 0 ? Math.round((passedCount / sub.checks.length) * 100) : 0;

          return (
            <Card key={sub.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">
                      {sub.website}
                      {sub.pro && (
                        <span className="ml-2 text-xs font-medium bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">PRO</span>
                      )}
                    </CardTitle>
                    <CardDescription>
                      {sub.email || "no email"} &middot; {new Date(sub.createdAt).toLocaleString()} &middot;{" "}
                      <span
                        className={`font-medium ${
                          sub.status === "completed" ? "text-green-600" : sub.status === "failed" ? "text-red-600" : "text-yellow-600"
                        }`}
                      >
                        {sub.status}
                      </span>
                    </CardDescription>
                  </div>
                  <span className={`text-2xl font-bold ${score >= 66 ? "text-green-600" : score >= 33 ? "text-yellow-600" : "text-red-600"}`}>
                    {score}%
                  </span>
                </div>
              </CardHeader>
              {sub.checks.length > 0 && (
                <CardContent>
                  <div className="space-y-2">
                    {sub.checks.map((check) => (
                      <div key={check.id} className="flex items-center gap-2 text-sm">
                        <span className={check.passed ? "text-green-600" : "text-red-500"}>{check.passed ? "✓" : "✗"}</span>
                        <span className="font-medium">{check.name}</span>
                        {check.details && <span className="text-muted-foreground">{check.details}</span>}
                      </div>
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>
    </>
  );
}

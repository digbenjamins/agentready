"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface PaidSubmission {
  id: string;
  email: string;
  website: string;
  score: number | null;
  paidAt: string | null;
  mcdaStatus: string | null;
  createdAt: string;
}

export default function PaidReportsPage() {
  const router = useRouter();
  const [submissions, setSubmissions] = useState<PaidSubmission[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchPaid() {
    setLoading(true);
    const res = await fetch("/api/submissions?filter=paid");
    if (res.status === 401) {
      router.push("/");
      return;
    }
    if (res.ok) {
      setSubmissions(await res.json());
    }
    setLoading(false);
  }

  useEffect(() => { fetchPaid(); }, []);

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold">Paid Reports</h2>
        <Button variant="outline" size="sm" onClick={fetchPaid}>
          {loading ? "Refreshing..." : "Refresh"}
        </Button>
      </div>

      {submissions.length === 0 && !loading && (
        <p className="text-muted-foreground text-center py-12">No paid reports yet.</p>
      )}

      <div className="space-y-3">
        {submissions.map((sub) => (
          <Card key={sub.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">{sub.website}</CardTitle>
                  <CardDescription>
                    {sub.email || "no email"} &middot;{" "}
                    Paid {sub.paidAt ? new Date(sub.paidAt).toLocaleString() : "unknown"} &middot;{" "}
                    <span
                      className={`font-medium ${
                        sub.mcdaStatus === "completed"
                          ? "text-green-600"
                          : sub.mcdaStatus === "processing"
                            ? "text-yellow-600"
                            : sub.mcdaStatus === "failed"
                              ? "text-red-600"
                              : "text-muted-foreground"
                      }`}
                    >
                      MCDA: {sub.mcdaStatus || "pending"}
                    </span>
                  </CardDescription>
                </div>
                <a
                  href={`https://okfor.ai/results/${sub.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline"
                >
                  View report
                </a>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
    </>
  );
}

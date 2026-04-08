import { useState, useEffect } from "react";
import { Star, Check, X, LogOut } from "lucide-react";

interface PendingTestimonial {
  id: string | number;
  name: string;
  email: string;
  rating: number;
  message: string;
  created_at: string;
}

const AdminTestimonials = () => {
  const [passphrase, setPassphrase] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [authError, setAuthError] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);

  const [testimonials, setTestimonials] = useState<PendingTestimonial[]>([]);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | number | null>(null);

  // Check sessionStorage on mount
  useEffect(() => {
    const stored = sessionStorage.getItem("ss_admin_auth");
    if (stored === "true") setAuthenticated(true);
  }, []);

  // Fetch pending testimonials once authenticated
  useEffect(() => {
    if (!authenticated) return;
    const fetchPending = async () => {
      setFetchLoading(true);
      try {
        const res = await fetch("/api/get-testimonials?status=pending");
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setTestimonials(data.testimonials ?? []);
      } catch {
        setTestimonials([]);
      } finally {
        setFetchLoading(false);
      }
    };
    fetchPending();
  }, [authenticated]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError(false);
    try {
      const res = await fetch("/api/verify-passphrase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passphrase }),
      });
      const data = await res.json();
      if (data.valid) {
        sessionStorage.setItem("ss_admin_auth", "true");
        sessionStorage.setItem("ss_admin_pp", passphrase);
        setAuthenticated(true);
      } else {
        setAuthError(true);
        setPassphrase("");
      }
    } catch {
      setAuthError(true);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleAction = async (id: string | number, action: "approve" | "reject") => {
    const stored = sessionStorage.getItem("ss_admin_auth");
    const storedPassphrase = sessionStorage.getItem("ss_admin_pp") ?? "";
    // Re-read passphrase from session for server-side check
    // We store it temporarily in session for this purpose
    setActionLoading(id);
    try {
      const res = await fetch("/api/manage-testimonial", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: String(id),
          action,
          passphrase: storedPassphrase,
        }),
      });
      if (res.status === 401) {
        // Session expired or tampered — log out
        handleLogout();
        return;
      }
      if (!res.ok) throw new Error("Action failed");
      // Optimistically remove from list
      setTestimonials((prev) => prev.filter((t) => t.id !== id));
    } catch {
      alert("Something went wrong. Please try again.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("ss_admin_auth");
    sessionStorage.removeItem("ss_admin_pp");
    setAuthenticated(false);
    setPassphrase("");
    setTestimonials([]);
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  // ── Passphrase Gate ──────────────────────────────────────────────────────────
  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground mb-2">
              SoulSynergy
            </p>
            <h1 className="text-2xl text-display">Admin Access</h1>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs tracking-wider uppercase text-muted-foreground mb-2 block">
                Passphrase
              </label>
              <input
                type="password"
                required
                value={passphrase}
                onChange={(e) => setPassphrase(e.target.value)}
                autoFocus
                className="w-full px-4 py-3 bg-secondary border border-border text-sm focus:outline-none focus:border-accent transition-colors"
                placeholder="Enter passphrase"
              />
            </div>
            {authError && (
              <p className="text-xs text-destructive">Incorrect passphrase. Please try again.</p>
            )}
            <button
              type="submit"
              disabled={authLoading}
              className="btn-primary w-full text-center disabled:opacity-50"
            >
              {authLoading ? "Verifying…" : "Enter"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ── Admin Portal ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border px-6 py-4 flex items-center justify-between">
        <div>
          <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground">SoulSynergy</p>
          <h1 className="text-lg font-medium">Testimonial Reviews</h1>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <LogOut size={14} />
          Sign out
        </button>
      </div>

      {/* Content */}
      <div className="container-wide max-w-3xl mx-auto py-12 px-6">
        {fetchLoading ? (
          <div className="text-center py-24 text-muted-foreground text-sm">
            Loading pending testimonials…
          </div>
        ) : testimonials.length === 0 ? (
          <div className="text-center py-24 space-y-2">
            <p className="text-lg font-display">All caught up!</p>
            <p className="text-sm text-muted-foreground">No pending testimonials to review.</p>
          </div>
        ) : (
          <div className="space-y-6">
            <p className="text-sm text-muted-foreground">
              {testimonials.length} pending {testimonials.length === 1 ? "testimonial" : "testimonials"} to review
            </p>
            {testimonials.map((t) => (
              <div
                key={t.id}
                className="card-service space-y-4"
              >
                {/* Header row */}
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-medium text-sm">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.email}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{formatDate(t.created_at)}</p>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    {Array.from({ length: t.rating }).map((_, j) => (
                      <Star key={j} size={12} className="fill-accent text-accent" />
                    ))}
                  </div>
                </div>

                {/* Message */}
                <p className="text-sm text-muted-foreground leading-relaxed italic border-l-2 border-border pl-4">
                  "{t.message}"
                </p>

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => handleAction(t.id, "approve")}
                    disabled={actionLoading === t.id}
                    className="flex items-center gap-2 px-4 py-2 bg-accent text-accent-foreground text-xs tracking-wider uppercase hover:opacity-90 transition-opacity disabled:opacity-40"
                  >
                    <Check size={14} />
                    {actionLoading === t.id ? "Saving…" : "Approve"}
                  </button>
                  <button
                    onClick={() => handleAction(t.id, "reject")}
                    disabled={actionLoading === t.id}
                    className="flex items-center gap-2 px-4 py-2 border border-border text-xs tracking-wider uppercase hover:border-destructive hover:text-destructive transition-colors disabled:opacity-40"
                  >
                    <X size={14} />
                    {actionLoading === t.id ? "Saving…" : "Reject"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminTestimonials;

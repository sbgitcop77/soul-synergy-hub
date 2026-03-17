import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { Check, ChevronLeft, ChevronRight, Loader2, Building2 } from "lucide-react";
import { DayPicker } from "react-day-picker";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import "react-day-picker/dist/style.css";

// ---------------------------------------------------------------------------
// Stripe
// ---------------------------------------------------------------------------
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------
type Service = {
  id: string;
  name: string;
  price: number;
  duration: string;
  description: string;
  features: string[];
  popular?: boolean;
};

const SERVICES: Service[] = [
  {
    id: "clarity",
    name: "Clarity Session",
    price: 50,
    duration: "60 min · Single Session",
    description: "A focused session to gain clarity on your most pressing challenge.",
    features: ["One-on-one 60-minute session", "Identify key blockers", "Actionable next steps", "Follow-up summary email"],
  },
  {
    id: "align",
    name: "Align with Goals",
    price: 200,
    duration: "4 Sessions · 2 Months",
    description: "A structured program to align your actions with your deepest aspirations.",
    popular: true,
    features: ["Four 60-minute sessions", "Personalized growth plan", "Resume & LinkedIn review", "Progress monitoring via text", "Email support between sessions"],
  },
  {
    id: "transform",
    name: "90-Day Transformation",
    price: 600,
    duration: "12 Sessions · 3 Months",
    description: "A comprehensive journey of personal and professional transformation.",
    features: ["Twelve 60-minute sessions", "Deep-dive assessments", "Custom transformation roadmap", "Unlimited text support", "Priority scheduling", "Post-program check-in"],
  },
  {
    id: "payg",
    name: "Pay as You Go",
    price: 50,
    duration: "Per Session · Flexible",
    description: "Ongoing support at your own pace, whenever you need it.",
    features: ["60-minute session", "No commitment required", "Book when you need it", "Session summary provided"],
  },
];

const FREE_CONSULTATION: Service = {
  id: "free-consultation",
  name: "Free Consultation",
  price: 0,
  duration: "30 min · Complimentary",
  description: "A complimentary 30-minute call to explore how coaching can help you.",
  features: ["30-minute introductory call", "No payment required", "Explore how coaching can help", "No commitment"],
};

const SERVICE_SLUG_MAP: Record<string, Service> = {
  "clarity-session":       SERVICES[0],
  "align-with-goals":      SERVICES[1],
  "90-day-transformation": SERVICES[2],
  "pay-as-you-go":         SERVICES[3],
  "free-consultation":     FREE_CONSULTATION,
};

type Discount = {
  promoId:     string;
  percent_off: number | null;
  amount_off:  number | null;
  name:        string;
};

type Booking = {
  id:                string;
  service:           string;
  date:              string;
  time:              string;
  client_name:       string;
  client_email:      string;
  amount_paid:       number;
  stripe_payment_id: string;
  calendar_event_id: string | null;
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function formatDate(d: Date) {
  return d.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
}

function formatTime(t: string) {
  const [h] = t.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  const display = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${display}:00 ${suffix} EST`;
}

function calcDiscount(price: number, discount: Discount | null): number {
  if (!discount) return 0;
  if (discount.percent_off) return Math.floor(price * (discount.percent_off / 100));
  if (discount.amount_off)  return Math.min(discount.amount_off / 100, price);
  return 0;
}

// ---------------------------------------------------------------------------
// Step indicator
// ---------------------------------------------------------------------------
const STEPS = ["Service", "Date & Time", "Your Details", "Payment", "Confirmed"];

function StepBar({ current }: { current: number }) {
  return (
    <div className="flex items-center justify-center gap-0 mb-12 overflow-x-auto pb-2">
      {STEPS.map((label, i) => (
        <div key={label} className="flex items-center">
          <div className="flex flex-col items-center gap-1 min-w-[64px]">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-colors
                ${i + 1 < current ? "bg-accent text-accent-foreground" :
                  i + 1 === current ? "bg-primary text-primary-foreground" :
                  "bg-secondary text-muted-foreground border border-border"}`}
            >
              {i + 1 < current ? <Check size={14} /> : i + 1}
            </div>
            <span className={`text-[10px] tracking-wider uppercase whitespace-nowrap ${i + 1 === current ? "text-foreground" : "text-muted-foreground"}`}>
              {label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div className={`w-8 h-px mb-5 mx-1 ${i + 1 < current ? "bg-accent" : "bg-border"}`} />
          )}
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step 1 — Service selector
// ---------------------------------------------------------------------------
function ServiceStep({ onSelect }: { onSelect: (s: Service) => void }) {
  return (
    <div>
      <h2 className="text-3xl md:text-4xl text-display text-center mb-2">Choose your <span className="text-display-italic">package</span></h2>
      <p className="text-sm text-muted-foreground text-center mb-10">Select the coaching package that best fits where you are right now.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
        {SERVICES.map((s) => (
          <button
            key={s.id}
            onClick={() => onSelect(s)}
            className="card-service text-left relative flex flex-col hover:border-accent transition-colors group cursor-pointer"
          >
            {s.popular && (
              <span className="absolute top-4 right-4 text-[10px] tracking-[0.2em] uppercase text-accent font-medium">
                Most Popular
              </span>
            )}
            <h3 className="text-xl font-display font-semibold mb-1">{s.name}</h3>
            <p className="text-3xl font-display font-light mb-1">${s.price}</p>
            <p className="text-xs text-muted-foreground tracking-wider mb-4">{s.duration}</p>
            <p className="text-sm text-muted-foreground leading-relaxed mb-5 flex-1">{s.description}</p>
            <div className="space-y-2">
              {s.features.map((f) => (
                <div key={f} className="flex items-start gap-2">
                  <Check size={13} className="text-accent mt-0.5 shrink-0" />
                  <span className="text-xs text-muted-foreground">{f}</span>
                </div>
              ))}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step 2 — Date & time picker
// ---------------------------------------------------------------------------
function DateTimeStep({
  service,
  onSelect,
  onBack,
}: {
  service: Service;
  onSelect: (date: Date, time: string) => void;
  onBack: () => void;
}) {
  const [availability, setAvailability] = useState<Record<string, string[]>>({});
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState("");
  const [month, setMonth]               = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState("");

  const DEV_SLOTS = ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"];

  const buildMockAvailability = (m: Date): Record<string, string[]> => {
    const year       = m.getFullYear();
    const month      = m.getMonth() + 1;
    const daysInMonth = new Date(year, month, 0).getDate();
    const today      = new Date();
    const result: Record<string, string[]> = {};
    for (let day = 1; day <= daysInMonth; day++) {
      const d = new Date(year, month - 1, day);
      if (d < today && d.toDateString() !== today.toDateString()) continue;
      const str = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      result[str] = DEV_SLOTS;
    }
    return result;
  };

  const fetchAvailability = useCallback(async (m: Date) => {
    setLoading(true);
    setError("");
    try {
      if (import.meta.env.DEV) {
        // Use mock data in development — Netlify Functions aren't available locally
        await new Promise((r) => setTimeout(r, 300)); // simulate network delay
        setAvailability((prev) => ({ ...prev, ...buildMockAvailability(m) }));
      } else {
        const res = await fetch(
          `/.netlify/functions/get-availability?year=${m.getFullYear()}&month=${m.getMonth() + 1}`
        );
        if (!res.ok) throw new Error("Failed to load availability");
        const data = await res.json();
        setAvailability((prev) => ({ ...prev, ...data }));
      }
    } catch {
      setError("Could not load availability. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAvailability(month); }, [month, fetchAvailability]);

  const availableDates = Object.keys(availability).map((d) => new Date(d + "T12:00:00"));

  const isDayDisabled = (day: Date) => {
    if (import.meta.env.DEV) return false; // all dates clickable in dev
    const str = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, "0")}-${String(day.getDate()).padStart(2, "0")}`;
    return !availability[str] || availability[str].length === 0;
  };

  const slotsForDate = selectedDate
    ? availability[`${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, "0")}-${String(selectedDate.getDate()).padStart(2, "0")}`] ?? []
    : [];

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-3xl md:text-4xl text-display text-center mb-2">Pick a <span className="text-display-italic">date & time</span></h2>
      <p className="text-sm text-muted-foreground text-center mb-8">All times shown in Eastern Time (EST/EDT).</p>

      {error && <p className="text-sm text-destructive text-center mb-4">{error}</p>}

      <div className="card-service mb-6 flex justify-center">
        {loading ? (
          <div className="flex items-center gap-2 py-8 text-muted-foreground text-sm">
            <Loader2 size={16} className="animate-spin" /> Loading availability…
          </div>
        ) : (
          <DayPicker
            mode="single"
            selected={selectedDate}
            onSelect={(d) => { setSelectedDate(d); setSelectedTime(""); }}
            month={month}
            onMonthChange={(m) => { setMonth(m); fetchAvailability(m); }}
            fromMonth={new Date()}
            disabled={[{ before: new Date() }, isDayDisabled]}
            modifiers={{ available: availableDates }}
            modifiersStyles={{
              available: { fontWeight: "bold" },
            }}
            styles={{
              caption: { fontFamily: "inherit" },
              head_cell: { fontFamily: "inherit", fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--muted-foreground)" },
              day: { fontFamily: "inherit" },
            }}
            classNames={{
              day_selected: "!bg-primary !text-primary-foreground !rounded-none",
              day_today: "!font-bold !text-accent",
              button: "hover:!bg-secondary !rounded-none",
              nav_button: "!rounded-none hover:!bg-secondary",
            }}
          />
        )}
      </div>

      {selectedDate && slotsForDate.length > 0 && (
        <div className="card-service mb-6">
          <p className="text-xs tracking-[0.2em] uppercase text-muted-foreground mb-4">Available times — {formatDate(selectedDate)}</p>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {slotsForDate.map((t) => (
              <button
                key={t}
                onClick={() => setSelectedTime(t)}
                className={`py-2 px-3 text-sm border transition-colors
                  ${selectedTime === t
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border hover:border-accent hover:text-accent"}`}
              >
                {formatTime(t)}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-4 justify-between mt-8">
        <button onClick={onBack} className="btn-secondary flex items-center gap-2">
          <ChevronLeft size={14} /> Back
        </button>
        <button
          onClick={() => selectedDate && selectedTime && onSelect(selectedDate, selectedTime)}
          disabled={!selectedDate || !selectedTime}
          className="btn-primary disabled:opacity-40"
        >
          Continue <ChevronRight size={14} className="inline ml-1" />
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step 3 — Client details
// ---------------------------------------------------------------------------
function DetailsStep({
  isFree,
  onSubmit,
  onBack,
}: {
  isFree: boolean;
  onSubmit: (details: { firstName: string; lastName: string; email: string; discount: Discount | null }) => void;
  onBack: () => void;
}) {
  const [firstName, setFirstName]         = useState("");
  const [lastName, setLastName]           = useState("");
  const [email, setEmail]                 = useState("");
  const [codeInput, setCodeInput]         = useState("");
  const [discount, setDiscount]           = useState<Discount | null>(null);
  const [codeError, setCodeError]         = useState("");
  const [validating, setValidating]       = useState(false);

  const validateCode = async () => {
    if (!codeInput.trim()) return;
    setValidating(true);
    setCodeError("");
    setDiscount(null);
    try {
      if (import.meta.env.DEV) {
        await new Promise((r) => setTimeout(r, 300));
        setDiscount({ promoId: "mock_promo", percent_off: 10, amount_off: null, name: codeInput.trim() });
      } else {
        const res  = await fetch("/.netlify/functions/validate-discount", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code: codeInput.trim() }),
        });
        const data = await res.json();
        if (data.valid) {
          setDiscount(data);
        } else {
          setCodeError("This discount code is invalid or has expired.");
        }
      }
    } catch {
      setCodeError("Could not validate code. Please try again.");
    } finally {
      setValidating(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ firstName, lastName, email, discount });
  };

  return (
    <div className="max-w-lg mx-auto">
      <h2 className="text-3xl md:text-4xl text-display text-center mb-8">Your <span className="text-display-italic">details</span></h2>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs tracking-wider uppercase text-muted-foreground mb-2 block">First Name *</label>
            <input type="text" required value={firstName} onChange={(e) => setFirstName(e.target.value)}
              className="w-full px-4 py-3 bg-secondary border border-border text-sm focus:outline-none focus:border-accent transition-colors" />
          </div>
          <div>
            <label className="text-xs tracking-wider uppercase text-muted-foreground mb-2 block">Last Name *</label>
            <input type="text" required value={lastName} onChange={(e) => setLastName(e.target.value)}
              className="w-full px-4 py-3 bg-secondary border border-border text-sm focus:outline-none focus:border-accent transition-colors" />
          </div>
        </div>
        <div>
          <label className="text-xs tracking-wider uppercase text-muted-foreground mb-2 block">Email Address *</label>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 bg-secondary border border-border text-sm focus:outline-none focus:border-accent transition-colors" />
        </div>
        {!isFree && (
          <div>
            <label className="text-xs tracking-wider uppercase text-muted-foreground mb-2 block">Discount Code (optional)</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={codeInput}
                onChange={(e) => { setCodeInput(e.target.value); setCodeError(""); setDiscount(null); }}
                placeholder="Enter code"
                className="flex-1 px-4 py-3 bg-secondary border border-border text-sm focus:outline-none focus:border-accent transition-colors"
              />
              <button
                type="button"
                onClick={validateCode}
                disabled={!codeInput.trim() || validating}
                className="btn-secondary text-xs px-4 disabled:opacity-40"
              >
                {validating ? <Loader2 size={14} className="animate-spin" /> : "Apply"}
              </button>
            </div>
            {codeError && <p className="text-xs text-destructive mt-1">{codeError}</p>}
            {discount && (
              <p className="text-xs text-accent mt-1">
                ✓ Code applied — {discount.percent_off ? `${discount.percent_off}% off` : `$${(discount.amount_off! / 100).toFixed(2)} off`}
              </p>
            )}
          </div>
        )}

        <div className="flex gap-4 justify-between pt-4">
          <button type="button" onClick={onBack} className="btn-secondary flex items-center gap-2">
            <ChevronLeft size={14} /> Back
          </button>
          <button type="submit" className="btn-primary flex items-center gap-2">
            {isFree ? "Confirm Booking" : "Continue to Payment"} <ChevronRight size={14} />
          </button>
        </div>
      </form>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Shared order summary used by both payment form variants
// ---------------------------------------------------------------------------
function OrderSummary({
  service, date, time, discount, finalAmount,
}: {
  service: Service; date: Date; time: string; discount: Discount | null; finalAmount: number;
}) {
  const discountAmt  = calcDiscount(service.price, discount);
  const displayFinal = finalAmount / 100;
  return (
    <div className="card-service space-y-2 text-sm">
      <p className="text-xs tracking-[0.2em] uppercase text-muted-foreground mb-3">Order Summary</p>
      <div className="flex justify-between">
        <span className="text-muted-foreground">{service.name}</span>
        <span>${service.price.toFixed(2)}</span>
      </div>
      <div className="flex justify-between text-muted-foreground text-xs">
        <span>{formatDate(date)} at {formatTime(time)}</span>
      </div>
      {discountAmt > 0 && (
        <div className="flex justify-between text-accent text-sm">
          <span>Discount ({discount!.name})</span>
          <span>−${discountAmt.toFixed(2)}</span>
        </div>
      )}
      <div className="pt-2 border-t border-border flex justify-between font-medium">
        <span>Total</span>
        <span>${displayFinal.toFixed(2)}</span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Alternative payment methods (PayPal + Bank Transfer / Zelle)
// ---------------------------------------------------------------------------
function AlternativePayments() {
  const [showBank, setShowBank] = useState(false);

  return (
    <div className="max-w-lg mx-auto mt-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 h-px bg-border" />
        <p className="text-xs tracking-[0.15em] uppercase text-muted-foreground whitespace-nowrap">
          Prefer a different payment method?
        </p>
        <div className="flex-1 h-px bg-border" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* PayPal */}
        <a
          href="https://www.paypal.com/paypalme/soulsynergycoach"
          target="_blank"
          rel="noopener noreferrer"
          className="card-service flex flex-col items-center gap-3 p-5 hover:border-accent transition-colors cursor-pointer group no-underline"
        >
          {/* PayPal logo mark */}
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="PayPal">
            <circle cx="18" cy="18" r="18" fill="#F5F5F5"/>
            <path d="M24.5 10.5H14.5C13.4 10.5 12.5 11.3 12.3 12.4L10 24.5C9.9 25.1 10.4 25.5 11 25.5H14.5L15.2 21.5H19.5C22.8 21.5 25.5 19 25.9 15.8L26.2 13.5C26.5 11.8 25.2 10.5 24.5 10.5Z" fill="#009CDE"/>
            <path d="M13 14.5H17.5C19.4 14.5 20.5 15.5 20.3 17.4L20 19.5H16.5L15.5 25.5H12L14 13.5L13 14.5Z" fill="#012169"/>
          </svg>
          <div className="text-center">
            <p className="text-sm font-medium text-foreground group-hover:text-accent transition-colors">Pay with PayPal</p>
            <p className="text-[11px] text-muted-foreground mt-1 leading-snug">
              You will be redirected to PayPal to complete payment. Please email{" "}
              <span className="text-accent">connect.sscoach@gmail.com</span>{" "}
              with your booking details after payment.
            </p>
          </div>
        </a>

        {/* Bank Transfer / Zelle */}
        <button
          type="button"
          onClick={() => setShowBank((v) => !v)}
          className="card-service flex flex-col items-center gap-3 p-5 hover:border-accent transition-colors cursor-pointer group text-left w-full"
        >
          <Building2 size={36} className="text-[#2D6A6A] shrink-0" />
          <div className="text-center w-full">
            <p className="text-sm font-medium text-foreground group-hover:text-accent transition-colors">
              Pay by Bank Transfer or Zelle
            </p>
            {showBank ? (
              <div className="mt-3 text-left space-y-2 text-[11px] text-muted-foreground">
                <div className="bg-secondary border border-border px-3 py-2">
                  <span className="text-xs tracking-wider uppercase text-muted-foreground block mb-1">Zelle</span>
                  <span className="font-medium text-foreground text-sm">connect.sscoach@gmail.com</span>
                </div>
                <p className="leading-snug">
                  Please use your name and session date as the payment reference. Email{" "}
                  <span className="text-accent">connect.sscoach@gmail.com</span>{" "}
                  to confirm your booking after payment.
                </p>
              </div>
            ) : (
              <p className="text-[11px] text-muted-foreground mt-1">
                Tap to see bank &amp; Zelle details
              </p>
            )}
          </div>
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step 4a — Dev mock payment form (no Stripe hooks)
// ---------------------------------------------------------------------------
function DevPaymentForm({
  service, date, time, discount, finalAmount, onSuccess, onBack,
}: {
  service: Service; date: Date; time: string; discount: Discount | null;
  finalAmount: number; onSuccess: (id: string) => void; onBack: () => void;
}) {
  const [paying, setPaying] = useState(false);
  const displayFinal = finalAmount / 100;

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    setPaying(true);
    await new Promise((r) => setTimeout(r, 600));
    onSuccess("mock_pi_dev_" + Date.now());
  };

  return (
    <div className="max-w-lg mx-auto">
      <form onSubmit={handlePay} className="space-y-6">
        <h2 className="text-3xl md:text-4xl text-display text-center mb-2">Complete your <span className="text-display-italic">payment</span></h2>
        <OrderSummary service={service} date={date} time={time} discount={discount} finalAmount={finalAmount} />
        <div className="card-service space-y-3">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs tracking-[0.2em] uppercase text-muted-foreground">Dev Mode — Mock Payment</p>
            <span className="text-[10px] tracking-[0.15em] uppercase bg-accent/10 text-accent px-2 py-0.5 font-medium">Recommended</span>
          </div>
          <div className="flex items-center gap-3 bg-secondary border border-border px-4 py-3">
            <span className="text-xs text-muted-foreground">Test card:</span>
            <span className="text-sm font-mono tracking-widest">4242 4242 4242 4242</span>
          </div>
          <p className="text-xs text-muted-foreground">No real charge will be made. Clicking Pay Now skips Stripe and goes directly to confirmation.</p>
        </div>
        <div className="flex gap-4 justify-between">
          <button type="button" onClick={onBack} disabled={paying} className="btn-secondary flex items-center gap-2 disabled:opacity-40">
            <ChevronLeft size={14} /> Back
          </button>
          <button type="submit" disabled={paying} className="btn-primary flex items-center gap-2 disabled:opacity-40">
            {paying ? <><Loader2 size={14} className="animate-spin" /> Processing…</> : `Pay $${displayFinal.toFixed(2)}`}
          </button>
        </div>
      </form>
      <AlternativePayments />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step 4b — Real Stripe payment form (must be inside <Elements>)
// ---------------------------------------------------------------------------
function StripePaymentForm({
  service, date, time, clientEmail, clientSecret, discount, finalAmount, onSuccess, onBack,
}: {
  service: Service; date: Date; time: string; clientEmail: string; clientSecret: string;
  discount: Discount | null; finalAmount: number; onSuccess: (id: string) => void; onBack: () => void;
}) {
  const stripe   = useStripe();
  const elements = useElements();
  const [error, setError]   = useState("");
  const [paying, setPaying] = useState(false);
  const displayFinal = finalAmount / 100;

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setPaying(true);
    setError("");

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setError("Card form not loaded. Please refresh and try again.");
      setPaying(false);
      return;
    }

    const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
      clientSecret,
      { payment_method: { card: cardElement }, receipt_email: clientEmail },
    );

    if (stripeError) {
      setError(stripeError.message ?? "Payment failed. Please try again.");
      setPaying(false);
    } else if (paymentIntent?.status === "succeeded") {
      onSuccess(paymentIntent.id);
    } else {
      setError("Payment could not be confirmed. Please try again.");
      setPaying(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto">
      <form onSubmit={handlePay} className="space-y-6">
        <h2 className="text-3xl md:text-4xl text-display text-center mb-2">Complete your <span className="text-display-italic">payment</span></h2>
        <OrderSummary service={service} date={date} time={time} discount={discount} finalAmount={finalAmount} />
        <div className="card-service space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs tracking-[0.2em] uppercase text-muted-foreground">Pay by Card</p>
            <span className="text-[10px] tracking-[0.15em] uppercase bg-accent/10 text-accent px-2 py-0.5 font-medium">Recommended</span>
          </div>
          <CardElement
            options={{
              style: {
                base: {
                  fontSize:        "14px",
                  color:           "#1a1a1a",
                  fontFamily:      "inherit",
                  "::placeholder": { color: "#9e9e9e" },
                },
                invalid: { color: "#c0392b" },
              },
              hidePostalCode: false,
            }}
          />
        </div>
        {error && <p className="text-xs text-destructive">{error}</p>}
        <div className="flex gap-4 justify-between">
          <button type="button" onClick={onBack} disabled={paying} className="btn-secondary flex items-center gap-2 disabled:opacity-40">
            <ChevronLeft size={14} /> Back
          </button>
          <button type="submit" disabled={!stripe || paying} className="btn-primary flex items-center gap-2 disabled:opacity-40">
            {paying ? <><Loader2 size={14} className="animate-spin" /> Processing…</> : `Pay $${displayFinal.toFixed(2)}`}
          </button>
        </div>
      </form>
      <AlternativePayments />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step 5 — Confirmation
// ---------------------------------------------------------------------------
function ConfirmationStep({ booking }: { booking: Booking }) {
  return (
    <div className="max-w-lg mx-auto text-center space-y-6">
      <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto">
        <Check size={32} className="text-accent" />
      </div>
      <h2 className="text-3xl md:text-4xl text-display">You're <span className="text-display-italic">booked!</span></h2>
      <p className="text-sm text-muted-foreground">
        A calendar invite and confirmation email will be sent to <strong>{booking.client_email}</strong>.
      </p>
      <div className="card-service text-left space-y-3 text-sm">
        <p className="text-xs tracking-[0.2em] uppercase text-muted-foreground mb-3">Booking Details</p>
        <div className="flex justify-between"><span className="text-muted-foreground">Service</span><span>{booking.service}</span></div>
        <div className="flex justify-between"><span className="text-muted-foreground">Date</span><span>{formatDate(new Date(booking.date + "T12:00:00"))}</span></div>
        <div className="flex justify-between"><span className="text-muted-foreground">Time</span><span>{formatTime(booking.time)}</span></div>
        <div className="flex justify-between"><span className="text-muted-foreground">Name</span><span>{booking.client_name}</span></div>
        {booking.amount_paid > 0 && (
          <div className="flex justify-between"><span className="text-muted-foreground">Amount Paid</span><span>${(booking.amount_paid / 100).toFixed(2)}</span></div>
        )}
      </div>
      <a href="/" className="btn-secondary inline-flex items-center gap-2 mt-4">
        Back to Home
      </a>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Book page
// ---------------------------------------------------------------------------
export default function Book() {
  const [searchParams] = useSearchParams();
  const preselected = SERVICE_SLUG_MAP[searchParams.get("service") ?? ""] ?? null;

  const [step, setStep]                     = useState(preselected ? 2 : 1);
  const [service, setService]               = useState<Service | null>(preselected);
  const [date, setDate]                     = useState<Date | null>(null);
  const [time, setTime]                     = useState("");
  const [clientName, setClientName]         = useState("");
  const [clientEmail, setClientEmail]       = useState("");
  const [discount, setDiscount]             = useState<Discount | null>(null);
  const [clientSecret, setClientSecret]     = useState("");
  const [finalAmount, setFinalAmount]       = useState(0);
  const [booking, setBooking]               = useState<Booking | null>(null);
  const [confirmError, setConfirmError]     = useState("");

  const handleServiceSelect = (s: Service) => { setService(s); setStep(2); };

  const handleDateTimeSelect = (d: Date, t: string) => { setDate(d); setTime(t); setStep(3); };

  const handleFreeBookingConfirm = async (name: string, email: string) => {
    setConfirmError("");
    const dateStr = date
      ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
      : "";
    try {
      if (import.meta.env.DEV) {
        await new Promise((r) => setTimeout(r, 400));
        setBooking({
          id:                "mock-free-booking-dev",
          service:           service!.name,
          date:              dateStr,
          time,
          client_name:       name,
          client_email:      email,
          amount_paid:       0,
          stripe_payment_id: "free_mock_dev",
          calendar_event_id: null,
        });
        setStep(5);
      } else {
        const res = await fetch("/.netlify/functions/confirm-booking", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            paymentIntentId: null,
            service:         service!.name,
            date:            dateStr,
            time,
            clientName:      name,
            clientEmail:     email,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Booking confirmation failed");
        setBooking(data.booking);
        setStep(5);
      }
    } catch (err: unknown) {
      setConfirmError(err instanceof Error ? err.message : "Confirmation failed. Please contact us directly.");
    }
  };

  const handleDetailsSubmit = async ({
    firstName, lastName, email, discount: disc,
  }: { firstName: string; lastName: string; email: string; discount: Discount | null }) => {
    const name = `${firstName} ${lastName}`.trim();
    setClientName(name);
    setClientEmail(email);
    setDiscount(disc);

    // Free consultation — skip payment entirely
    if (service!.price === 0) {
      await handleFreeBookingConfirm(name, email);
      return;
    }

    try {
      if (import.meta.env.DEV) {
        await new Promise((r) => setTimeout(r, 300));
        const base     = service!.price * 100;
        const discount = disc?.percent_off ? Math.floor(base * disc.percent_off / 100) : 0;
        setClientSecret("mock_secret_dev");
        setFinalAmount(base - discount);
        setStep(4);
      } else {
        const res = await fetch("/.netlify/functions/create-payment-intent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            service:     service!.name,
            clientName:  name,
            clientEmail: email,
            promoId:     disc?.promoId,
            percent_off: disc?.percent_off,
            amount_off:  disc?.amount_off,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Failed to initialise payment");
        setClientSecret(data.clientSecret);
        setFinalAmount(data.finalAmount);
        setStep(4);
      }
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Could not initialise payment. Please try again.");
    }
  };

  const handlePaymentSuccess = async (paymentIntentId: string) => {
    setConfirmError("");
    const dateStr = date
      ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
      : "";
    try {
      if (import.meta.env.DEV) {
        await new Promise((r) => setTimeout(r, 300));
        setBooking({
          id:                "mock-booking-dev",
          service:           service!.name,
          date:              dateStr,
          time,
          client_name:       clientName,
          client_email:      clientEmail,
          amount_paid:       finalAmount,
          stripe_payment_id: paymentIntentId,
          calendar_event_id: null,
        });
        setStep(5);
      } else {
        const res = await fetch("/.netlify/functions/confirm-booking", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            paymentIntentId,
            service:     service!.name,
            date:        dateStr,
            time,
            clientName,
            clientEmail,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Booking confirmation failed");
        setBooking(data.booking);
        setStep(5);
      }
    } catch (err: unknown) {
      setConfirmError(err instanceof Error ? err.message : "Confirmation failed. Please contact us directly.");
    }
  };

  const stripeOptions = {
    clientSecret,
    paymentMethodTypes: ["card"],
    appearance: {
      theme: "stripe" as const,
      variables: {
        colorPrimary:      "#2D6A6A",
        colorBackground:   "#FAF8F5",
        borderRadius:      "0px",
        fontFamily:        "inherit",
      },
    },
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#FAF8F5" }}>
      <div className="container-wide pt-32 pb-24">
        {step < 5 && <StepBar current={step} />}

        {step === 1 && <ServiceStep onSelect={handleServiceSelect} />}

        {step === 2 && service && (
          <DateTimeStep
            service={service}
            onSelect={handleDateTimeSelect}
            onBack={() => setStep(1)}
          />
        )}

        {step === 3 && (
          <DetailsStep
            isFree={service?.price === 0}
            onSubmit={handleDetailsSubmit}
            onBack={() => setStep(2)}
          />
        )}

        {step === 4 && clientSecret && (
          import.meta.env.DEV ? (
            <DevPaymentForm
              service={service!}
              date={date!}
              time={time}
              discount={discount}
              finalAmount={finalAmount}
              onSuccess={handlePaymentSuccess}
              onBack={() => setStep(3)}
            />
          ) : (
            <Elements stripe={stripePromise} options={stripeOptions}>
              <StripePaymentForm
                service={service!}
                date={date!}
                time={time}
                clientEmail={clientEmail}
                clientSecret={clientSecret}
                discount={discount}
                finalAmount={finalAmount}
                onSuccess={handlePaymentSuccess}
                onBack={() => setStep(3)}
              />
              {confirmError && (
                <p className="text-xs text-destructive text-center mt-4">{confirmError}</p>
              )}
            </Elements>
          )
        )}

        {step === 5 && booking && <ConfirmationStep booking={booking} />}
      </div>
    </div>
  );
}

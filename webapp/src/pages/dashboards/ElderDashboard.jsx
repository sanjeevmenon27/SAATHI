import { AlertTriangle, CalendarClock, MapPin, Receipt, Star } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Layout } from "../../components/Layout";
import { LoadingSkeleton } from "../../components/LoadingSkeleton";
import { SectionCard } from "../../components/SectionCard";
import { Toast } from "../../components/Toast";
import { api } from "../../api";
import { durations, serviceOptions } from "../../data";
import { useAuth } from "../../context/AuthContext";

const emptyBooking = {
  serviceType: "Hospital Escort",
  date: "",
  time: "",
  duration: "1hr",
  location: "",
  notes: "",
  saathiId: ""
};

const bookingSteps = ["Service", "Schedule", "Details", "Match", "Confirm"];

export const ElderDashboard = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [payments, setPayments] = useState([]);
  const [matchedSaathis, setMatchedSaathis] = useState([]);
  const [bookingForm, setBookingForm] = useState(emptyBooking);
  const [step, setStep] = useState(1);
  const [toast, setToast] = useState("");
  const [confirmation, setConfirmation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    setIsLoading(true);
    const [bookingRes, paymentRes] = await Promise.all([api.get("/bookings/my"), api.get("/bookings/payments")]);
    setBookings(bookingRes.data);
    setPayments(paymentRes.data);
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const upcoming = useMemo(
    () => bookings.filter((booking) => ["pending", "confirmed", "in_progress"].includes(booking.status)),
    [bookings]
  );
  const past = useMemo(
    () => bookings.filter((booking) => ["completed", "cancelled", "declined"].includes(booking.status)),
    [bookings]
  );

  const canProceed =
    step === 1 ||
    (step === 2 && Boolean(bookingForm.date && bookingForm.time && bookingForm.duration)) ||
    (step === 3 && Boolean(bookingForm.location.trim()));

  const findMatches = async () => {
    const { data } = await api.post("/bookings/match", { serviceType: bookingForm.serviceType });
    setMatchedSaathis(data);
    setStep(4);
  };

  const confirmBooking = async () => {
    const { data } = await api.post("/bookings", bookingForm);
    setConfirmation(data);
    setBookingForm(emptyBooking);
    setMatchedSaathis([]);
    setStep(1);
    loadData();
  };

  const submitRating = async (bookingId, rating) => {
    await api.post(`/bookings/${bookingId}/rate`, { rating });
    setToast("Rating submitted");
    loadData();
  };

  const triggerSos = async () => {
    const location = user?.address || bookingForm.location || "Unknown location";
    const { data } = await api.post("/bookings/sos", { location });
    setToast(data.message);
  };

  return (
    <Layout>
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 sm:py-8 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-6">
          <SectionCard
            title={`Hello, ${user?.name?.split(" ")[0]}`}
            subtitle="Manage bookings, monitor live visits, and stay close to your loved one's care plan."
            actions={
              <button type="button" className="btn-danger w-full sm:w-auto" onClick={triggerSos}>
                <AlertTriangle size={18} /> SOS
              </button>
            }
          >
            {isLoading ? (
              <LoadingSkeleton rows={3} />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                <div className="stat-card">
                  <div className="stat-label">Upcoming visits</div>
                  <div className="stat-value">{upcoming.length}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Completed visits</div>
                  <div className="stat-value">{past.filter((item) => item.status === "completed").length}</div>
                </div>
                <div className="stat-card sm:col-span-2 xl:col-span-1">
                  <div className="stat-label">Paid orders</div>
                  <div className="stat-value">{payments.filter((item) => item.status === "paid").length}</div>
                </div>
              </div>
            )}
          </SectionCard>

          <SectionCard
            title={`Book a Saathi: Step ${step} of 5`}
            subtitle="Build the visit details, then confirm a match."
          >
            <div className="mb-5 grid grid-cols-5 gap-2">
              {bookingSteps.map((label, index) => (
                <div
                  key={label}
                  className={`rounded-2xl px-2 py-3 text-center text-[11px] font-semibold sm:text-sm ${
                    step >= index + 1 ? "bg-saffron-100 text-saffron-700" : "bg-cream-50 text-cocoa-700"
                  }`}
                >
                  {label}
                </div>
              ))}
            </div>

            <div className="grid gap-5">
              {step === 1 ? (
                <label className="block">
                  <span className="mb-2 block text-lg font-semibold">Choose service</span>
                  <select
                    className="input"
                    value={bookingForm.serviceType}
                    onChange={(event) => setBookingForm((current) => ({ ...current, serviceType: event.target.value }))}
                  >
                    {serviceOptions.map((service) => (
                      <option key={service.name}>{service.name}</option>
                    ))}
                  </select>
                </label>
              ) : null}

              {step === 2 ? (
                <div className="grid gap-5 md:grid-cols-3">
                  <label className="block">
                    <span className="mb-2 block text-lg font-semibold">Date</span>
                    <input
                      type="date"
                      className="input"
                      value={bookingForm.date}
                      onChange={(event) => setBookingForm((current) => ({ ...current, date: event.target.value }))}
                    />
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-lg font-semibold">Time</span>
                    <input
                      type="time"
                      className="input"
                      value={bookingForm.time}
                      onChange={(event) => setBookingForm((current) => ({ ...current, time: event.target.value }))}
                    />
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-lg font-semibold">Duration</span>
                    <select
                      className="input"
                      value={bookingForm.duration}
                      onChange={(event) => setBookingForm((current) => ({ ...current, duration: event.target.value }))}
                    >
                      {durations.map((duration) => (
                        <option key={duration}>{duration}</option>
                      ))}
                    </select>
                  </label>
                </div>
              ) : null}

              {step === 3 ? (
                <>
                  <label className="block">
                    <span className="mb-2 block text-lg font-semibold">Location</span>
                    <input
                      className="input"
                      placeholder="Enter address or landmark"
                      autoComplete="street-address"
                      value={bookingForm.location}
                      onChange={(event) => setBookingForm((current) => ({ ...current, location: event.target.value }))}
                    />
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-lg font-semibold">Special notes</span>
                    <textarea
                      rows="4"
                      className="input"
                      placeholder="Wheelchair help, Tamil only, medication reminders..."
                      value={bookingForm.notes}
                      onChange={(event) => setBookingForm((current) => ({ ...current, notes: event.target.value }))}
                    />
                  </label>
                </>
              ) : null}

              {step === 4 ? (
                <div className="grid gap-4">
                  {matchedSaathis.map((saathi) => (
                    <button
                      key={saathi._id}
                      type="button"
                      onClick={() => {
                        setBookingForm((current) => ({ ...current, saathiId: saathi._id }));
                        setStep(5);
                      }}
                      className={`mobile-card border text-left transition ${
                        bookingForm.saathiId === saathi._id ? "border-saffron-500 bg-saffron-50" : "border-saffron-100"
                      }`}
                    >
                      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                          <div className="text-xl font-bold sm:text-2xl">{saathi.name}</div>
                          <p className="mt-2 text-sm leading-7 text-cocoa-700 sm:text-base">{saathi.bio}</p>
                          <p className="mt-3 text-sm text-cocoa-700">Languages: {saathi.languagesSpoken.join(", ")}</p>
                          <p className="text-sm text-cocoa-700">Skills: {saathi.skills.join(", ")}</p>
                        </div>
                        <div className="rounded-3xl bg-cream-50 px-4 py-3 text-left md:min-w-36 md:text-right">
                          <div className="text-lg font-bold">{saathi.rating} / 5</div>
                          <div className="text-sm text-cocoa-700">
                            {saathi.isAvailable ? "Available now" : "Currently offline"}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                  {!matchedSaathis.length ? (
                    <div className="rounded-3xl bg-cream-50 p-5 text-cocoa-700">
                      No approved Saathis matched this service yet.
                    </div>
                  ) : null}
                </div>
              ) : null}

              {step === 5 ? (
                <div className="rounded-[28px] border border-saffron-200 bg-cream-50 p-5 sm:p-6">
                  <h3 className="text-xl font-bold sm:text-2xl">Booking summary</h3>
                  <div className="mt-4 grid gap-3 text-sm sm:text-base md:grid-cols-2">
                    <p><strong>Service:</strong> {bookingForm.serviceType}</p>
                    <p><strong>Date:</strong> {bookingForm.date}</p>
                    <p><strong>Time:</strong> {bookingForm.time}</p>
                    <p><strong>Duration:</strong> {bookingForm.duration}</p>
                    <p><strong>Location:</strong> {bookingForm.location}</p>
                    <p><strong>Notes:</strong> {bookingForm.notes || "None"}</p>
                  </div>
                </div>
              ) : null}

              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                {step > 1 ? (
                  <button type="button" className="btn-secondary w-full sm:w-auto" onClick={() => setStep((current) => current - 1)}>
                    Back
                  </button>
                ) : null}
                {step < 3 ? (
                  <button
                    type="button"
                    className="btn-primary w-full sm:w-auto"
                    onClick={() => setStep((current) => current + 1)}
                    disabled={!canProceed}
                  >
                    Next
                  </button>
                ) : null}
                {step === 3 ? (
                  <button type="button" className="btn-primary w-full sm:w-auto" onClick={findMatches} disabled={!canProceed}>
                    Find Saathis
                  </button>
                ) : null}
                {step === 4 ? (
                  <button type="button" className="btn-primary w-full sm:w-auto" onClick={findMatches}>
                    Refresh Matches
                  </button>
                ) : null}
                {step === 5 ? (
                  <button type="button" className="btn-primary w-full sm:w-auto" onClick={confirmBooking}>
                    Confirm and Book
                  </button>
                ) : null}
              </div>
            </div>
          </SectionCard>

          {confirmation ? (
            <SectionCard title="Booking confirmation" subtitle="This summary card is designed to be easy to screenshot.">
              <div className="rounded-[30px] border-2 border-dashed border-saffron-300 bg-white p-5 sm:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.25em] text-saffron-700 sm:text-sm">Confirmed visit</p>
                    <h3 className="mt-2 text-2xl font-bold sm:text-3xl">{confirmation.serviceType}</h3>
                  </div>
                  <div className="rounded-3xl bg-saffron-100 px-4 py-3 text-base font-semibold sm:text-lg">
                    {confirmation.status}
                  </div>
                </div>
                <div className="mt-5 grid gap-3 text-sm sm:text-base md:grid-cols-2">
                  <p><strong>Date:</strong> {confirmation.date}</p>
                  <p><strong>Time:</strong> {confirmation.time}</p>
                  <p><strong>Duration:</strong> {confirmation.duration}</p>
                  <p><strong>Location:</strong> {confirmation.location}</p>
                  <p><strong>Saathi:</strong> {confirmation.saathiId?.name}</p>
                  <p><strong>Phone:</strong> {confirmation.saathiId?.phone}</p>
                </div>
              </div>
            </SectionCard>
          ) : null}
        </div>

        <div className="space-y-6">
          <SectionCard title="Upcoming bookings" subtitle="Live status and assigned companion details stay here.">
            {isLoading ? (
              <LoadingSkeleton rows={3} />
            ) : (
              <div className="dashboard-list">
                {upcoming.length ? (
                  upcoming.map((booking) => (
                    <div key={booking._id} className="mobile-card bg-cream-50">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <div className="text-lg font-bold sm:text-xl">{booking.serviceType}</div>
                          <div className="mt-1 flex items-start gap-2 text-sm text-cocoa-700 sm:text-base">
                            <CalendarClock size={18} className="mt-0.5 shrink-0" /> {booking.date} at {booking.time}
                          </div>
                          <div className="mt-1 flex items-start gap-2 text-sm text-cocoa-700 sm:text-base">
                            <MapPin size={18} className="mt-0.5 shrink-0" /> {booking.location}
                          </div>
                        </div>
                        <div className="rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-saffron-700">
                          {booking.liveStatus}
                        </div>
                      </div>
                      {booking.saathiId ? (
                        <div className="mt-4 rounded-2xl bg-white p-4">
                          <div className="font-semibold">{booking.saathiId.name}</div>
                          <div className="text-sm text-cocoa-700">{booking.saathiId.phone}</div>
                        </div>
                      ) : null}
                    </div>
                  ))
                ) : (
                  <p className="text-cocoa-700">No upcoming bookings yet.</p>
                )}
              </div>
            )}
          </SectionCard>

          <SectionCard title="Past visits" subtitle="Reports and ratings appear after completed visits.">
            {isLoading ? (
              <LoadingSkeleton rows={3} />
            ) : (
              <div className="dashboard-list">
                {past.length ? (
                  past.map((booking) => (
                    <div key={booking._id} className="mobile-card">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <div className="text-lg font-bold sm:text-xl">{booking.serviceType}</div>
                          <div className="mt-1 text-sm text-cocoa-700 sm:text-base">{booking.date}</div>
                        </div>
                        <span className="rounded-full bg-cream-100 px-4 py-2 text-sm font-semibold text-cocoa-900">
                          {booking.status}
                        </span>
                      </div>
                      {booking.visitReport ? (
                        <div className="mt-4 rounded-3xl bg-cream-50 p-4 text-sm sm:text-base">
                          <div className="font-semibold">Post-visit report</div>
                          <p className="mt-2 text-cocoa-700">
                            Mood: {booking.visitReport.elderMood} | Concerns: {booking.visitReport.concerns}
                          </p>
                        </div>
                      ) : null}
                      {booking.status === "completed" ? (
                        <div className="mt-4 flex flex-wrap gap-2">
                          {[1, 2, 3, 4, 5].map((value) => (
                            <button
                              key={value}
                              type="button"
                              onClick={() => submitRating(booking._id, value)}
                              className={`inline-flex h-11 w-11 items-center justify-center rounded-full transition active:scale-[0.98] ${
                                booking.rating >= value ? "bg-saffron-500 text-white" : "bg-cream-100"
                              }`}
                              aria-label={`Rate ${value}`}
                            >
                              <Star size={18} fill="currentColor" />
                            </button>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  ))
                ) : (
                  <p className="text-cocoa-700">No past visits yet.</p>
                )}
              </div>
            )}
          </SectionCard>

          <SectionCard title="Payment history" subtitle="Mock payments only for demo purposes.">
            {isLoading ? (
              <LoadingSkeleton rows={3} />
            ) : (
              <div className="dashboard-list">
                {payments.length ? (
                  payments.map((payment) => (
                    <div key={payment._id} className="flex flex-col gap-3 rounded-3xl bg-cream-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-3">
                        <Receipt className="text-saffron-700" />
                        <div>
                          <div className="font-semibold">{payment.bookingId?.serviceType}</div>
                          <div className="text-sm text-cocoa-700">{payment.method}</div>
                        </div>
                      </div>
                      <div className="text-left sm:text-right">
                        <div className="font-bold">Rs. {payment.amount}</div>
                        <div className="text-sm text-cocoa-700">{payment.status}</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-cocoa-700">No payments recorded yet.</p>
                )}
              </div>
            )}
          </SectionCard>
        </div>
      </div>
      <Toast message={toast} onClose={() => setToast("")} />
    </Layout>
  );
};

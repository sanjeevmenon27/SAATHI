import { BadgeCheck, Clock3, IndianRupee, MapPin, Power, ShieldCheck, UserCheck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Layout } from "../../components/Layout";
import { LoadingSkeleton } from "../../components/LoadingSkeleton";
import { SectionCard } from "../../components/SectionCard";
import { Toast } from "../../components/Toast";
import { api } from "../../api";
import { useAuth } from "../../context/AuthContext";

export const SaathiDashboard = () => {
  const { user, updateProfile, refreshUser } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [openRequests, setOpenRequests] = useState([]);
  const [toast, setToast] = useState("");
  const [reportForm, setReportForm] = useState({ tasksCompleted: "", elderMood: "", concerns: "" });
  const [priceDrafts, setPriceDrafts] = useState({});
  const [latestConfirmed, setLatestConfirmed] = useState(null);
  const [timerStart] = useState(Date.now());
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    setIsLoading(true);
    const [bookingRes, openRes] = await Promise.all([api.get("/bookings/my"), api.get("/bookings/open-requests")]);
    setBookings(bookingRes.data);
    setOpenRequests(openRes.data);
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const activeBooking = useMemo(
    () => bookings.find((booking) => booking.status === "in_progress" || booking.status === "confirmed"),
    [bookings]
  );
  const requests = useMemo(() => bookings.filter((booking) => booking.status === "pending"), [bookings]);
  const completed = useMemo(() => bookings.filter((booking) => booking.status === "completed"), [bookings]);
  const earnings = completed.reduce((sum, booking) => sum + (booking.quotedPrice || 600), 0);

  const toggleAvailability = async () => {
    await updateProfile({ isAvailable: !user?.saathiProfile?.isAvailable });
    await refreshUser();
    setToast("Availability updated");
  };

  const updateStatus = async (bookingId, status, liveStatus) => {
    await api.patch(`/bookings/${bookingId}/status`, { status, liveStatus });
    setToast(`Booking ${status}`);
    loadData();
  };

  const claimRequest = async (bookingId) => {
    const price = Number(priceDrafts[bookingId]);
    if (!price) {
      setToast("Enter an appointment price first");
      return;
    }

    await api.patch(`/bookings/${bookingId}/status`, {
      status: "confirmed",
      liveStatus: "Saathi confirmed the appointment",
      quotedPrice: price,
      assignToSelf: true
    });
    const picked = openRequests.find((booking) => booking._id === bookingId);
    if (picked) {
      setLatestConfirmed({ ...picked, quotedPrice: price });
    }
    setToast("Appointment confirmed");
    setPriceDrafts((current) => ({ ...current, [bookingId]: "" }));
    loadData();
  };

  const submitReport = async () => {
    if (!activeBooking) {
      return;
    }

    await api.post(`/bookings/${activeBooking._id}/report`, {
      tasksCompleted: reportForm.tasksCompleted
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      elderMood: reportForm.elderMood,
      concerns: reportForm.concerns
    });
    setReportForm({ tasksCompleted: "", elderMood: "", concerns: "" });
    setToast("Visit report submitted");
    loadData();
  };

  return (
    <Layout>
      <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 sm:py-8">
        <section className="rounded-[32px] bg-gradient-to-r from-saffron-500 via-apricot-500 to-saffron-300 p-5 text-white shadow-card sm:p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] sm:text-sm">
                <BadgeCheck size={16} />
                Faculty Demo Flow
              </div>
              <h1 className="mt-4 text-2xl font-bold sm:text-3xl lg:text-4xl">
                Choose an elder, set your own price, confirm the visit
              </h1>
              <p className="mt-3 max-w-3xl text-base text-white/90 sm:text-lg">
                This screen is tuned for presentation: you can show open elder requests, claim one yourself, and display the confirmed appointment amount immediately.
              </p>
            </div>
            <div className="grid gap-3 rounded-[28px] bg-white/15 p-5 backdrop-blur sm:grid-cols-3 lg:min-w-[420px]">
              <div>
                <div className="text-sm uppercase tracking-wide text-white/80">Open requests</div>
                <div className="mt-1 text-3xl font-bold">{openRequests.length}</div>
              </div>
              <div>
                <div className="text-sm uppercase tracking-wide text-white/80">Assigned to you</div>
                <div className="mt-1 text-3xl font-bold">{requests.length + (activeBooking ? 1 : 0)}</div>
              </div>
              <div>
                <div className="text-sm uppercase tracking-wide text-white/80">Your quoted earnings</div>
                <div className="mt-1 text-3xl font-bold">Rs. {earnings}</div>
              </div>
            </div>
          </div>
        </section>

        <SectionCard
          title={`Saathi dashboard: ${user?.name}`}
          subtitle="Control availability, respond to requests, and complete visit reports."
          actions={
            <button type="button" className="btn-secondary w-full sm:w-auto" onClick={toggleAvailability}>
              <Power size={18} />
              {user?.saathiProfile?.isAvailable ? "Go offline" : "Go online"}
            </button>
          }
        >
          {isLoading ? (
            <LoadingSkeleton rows={4} />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <div className="stat-card">
                <div className="stat-label">Verification</div>
                <div className="stat-value text-xl">{user?.saathiProfile?.backgroundCheckStatus}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Rating</div>
                <div className="stat-value">{user?.saathiProfile?.rating || 0}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Sessions</div>
                <div className="stat-value">{user?.saathiProfile?.totalSessions || 0}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Earnings</div>
                <div className="stat-value">Rs. {earnings}</div>
              </div>
            </div>
          )}
        </SectionCard>

        {latestConfirmed ? (
          <SectionCard
            title="Latest confirmed appointment"
            subtitle="Keep this visible during your demo to show the elder selection and the amount you entered."
          >
            <div className="rounded-[30px] border-2 border-dashed border-saffron-300 bg-gradient-to-br from-white to-cream-100 p-5 sm:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-saffron-100 px-4 py-2 text-sm font-semibold text-saffron-700">
                    <UserCheck size={16} />
                    Appointment confirmed by Saathi
                  </div>
                  <h3 className="mt-4 text-2xl font-bold sm:text-3xl">{latestConfirmed.elderId?.name}</h3>
                  <p className="mt-2 text-base text-cocoa-700 sm:text-lg">{latestConfirmed.serviceType}</p>
                </div>
                <div className="rounded-3xl bg-cocoa-900 px-5 py-4 text-white">
                  <div className="text-sm uppercase tracking-wide text-white/75">Your quoted price</div>
                  <div className="mt-1 text-3xl font-bold">Rs. {latestConfirmed.quotedPrice}</div>
                </div>
              </div>
              <div className="mt-5 grid gap-3 text-sm sm:text-base md:grid-cols-2">
                <p><strong>Date:</strong> {latestConfirmed.date}</p>
                <p><strong>Time:</strong> {latestConfirmed.time}</p>
                <p><strong>Location:</strong> {latestConfirmed.location}</p>
                <p><strong>Status:</strong> Confirmed</p>
              </div>
              <div className="mt-5 rounded-3xl bg-cream-50 p-4 text-cocoa-700">
                <strong>Assistance needed:</strong> {latestConfirmed.notes}
              </div>
            </div>
          </SectionCard>
        ) : null}

        <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <SectionCard
            title="Choose an elder and confirm appointment"
            subtitle="Five demo elder requests are shown here so you can present that you selected the elder and set your own price."
          >
            {isLoading ? (
              <LoadingSkeleton rows={3} />
            ) : (
              <div className="dashboard-list">
                {openRequests.length ? (
                  openRequests.map((booking) => (
                    <div key={booking._id} className="rounded-[30px] bg-gradient-to-br from-cream-50 to-white p-4 ring-1 ring-saffron-100 sm:p-5">
                      <div className="flex flex-col gap-4">
                        <div className="max-w-xl">
                          <div className="flex flex-wrap items-center gap-3">
                            <div className="text-lg font-bold sm:text-xl">{booking.elderId?.name}</div>
                            <span className="rounded-full bg-saffron-100 px-3 py-1 text-sm font-semibold text-saffron-700">
                              {booking.serviceType}
                            </span>
                          </div>
                          <div className="mt-3 rounded-2xl bg-white px-4 py-3 text-sm text-cocoa-700 sm:text-base">
                            <strong>Assistance needed:</strong> {booking.notes}
                          </div>
                          <div className="mt-3 flex flex-wrap gap-3 text-sm text-cocoa-700">
                            <span className="rounded-full bg-cream-100 px-3 py-2">{booking.date}</span>
                            <span className="rounded-full bg-cream-100 px-3 py-2">{booking.time}</span>
                            <span className="rounded-full bg-cream-100 px-3 py-2">{booking.duration}</span>
                          </div>
                          <div className="mt-3 flex items-start gap-2 text-sm text-cocoa-700 sm:text-base">
                            <MapPin size={16} className="mt-0.5 shrink-0" />
                            {booking.location}
                          </div>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
                          <label className="block">
                            <span className="mb-2 block text-sm font-semibold text-cocoa-700">
                              Your price for one appointment
                            </span>
                            <input
                              type="number"
                              min="1"
                              inputMode="numeric"
                              className="input"
                              placeholder="Enter price in rupees"
                              value={priceDrafts[booking._id] || ""}
                              onChange={(event) =>
                                setPriceDrafts((current) => ({ ...current, [booking._id]: event.target.value }))
                              }
                            />
                          </label>
                          <div className="flex flex-col gap-2 sm:flex-row">
                            <button type="button" className="btn-primary w-full sm:w-auto" onClick={() => claimRequest(booking._id)}>
                              Choose and confirm
                            </button>
                            <button
                              type="button"
                              className="btn-secondary w-full sm:w-auto"
                              onClick={() => updateStatus(booking._id, "declined", "Saathi declined")}
                            >
                              Decline
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-cocoa-700">No demo elder requests available right now.</p>
                )}
              </div>
            )}
          </SectionCard>

          <SectionCard title="Your pending requests" subtitle="Requests already assigned to you but not started yet.">
            {isLoading ? (
              <LoadingSkeleton rows={3} />
            ) : (
              <div className="dashboard-list">
                {requests.length ? (
                  requests.map((booking) => (
                    <div key={booking._id} className="mobile-card bg-cream-50">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <div className="text-lg font-bold sm:text-xl">{booking.serviceType}</div>
                          <div className="mt-1 text-cocoa-700">{booking.elderId?.name}</div>
                          <div className="mt-1 text-sm text-cocoa-700">{booking.notes}</div>
                        </div>
                        <div className="flex flex-col gap-2 sm:flex-row">
                          <button
                            type="button"
                            className="btn-primary w-full sm:w-auto"
                            onClick={() => updateStatus(booking._id, "confirmed", "Saathi confirmed")}
                          >
                            Accept
                          </button>
                          <button
                            type="button"
                            className="btn-secondary w-full sm:w-auto"
                            onClick={() => updateStatus(booking._id, "declined", "Declined")}
                          >
                            Decline
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-cocoa-700">No pending requests right now.</p>
                )}
              </div>
            )}
          </SectionCard>

          <SectionCard title="Active visit" subtitle="Track visit timing, elder details, and completion tasks.">
            {isLoading ? (
              <LoadingSkeleton rows={3} />
            ) : activeBooking ? (
              <div className="space-y-5">
                <div className="rounded-[28px] bg-gradient-to-br from-saffron-100 to-apricot-100 p-5 sm:p-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="text-2xl font-bold">{activeBooking.elderId?.name}</div>
                      <p className="mt-2 text-cocoa-700">{activeBooking.location}</p>
                      {activeBooking.quotedPrice ? (
                        <p className="mt-2 text-lg font-semibold text-saffron-700">
                          Confirmed price: Rs. {activeBooking.quotedPrice}
                        </p>
                      ) : null}
                    </div>
                    <div className="rounded-3xl bg-white px-5 py-3 text-left sm:text-right">
                      <div className="text-sm text-cocoa-700">Visit timer</div>
                      <div className="text-2xl font-bold">{Math.floor((Date.now() - timerStart) / 60000)} min</div>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-3xl bg-cream-50 p-5">
                    <div className="mb-3 flex items-center gap-2 font-semibold">
                      <Clock3 size={18} /> Visit checklist
                    </div>
                    <ul className="space-y-2 text-cocoa-700">
                      <li>Confirm elder comfort on arrival</li>
                      <li>Review tasks from family notes</li>
                      <li>Share live status updates if needed</li>
                    </ul>
                  </div>
                  <div className="rounded-3xl bg-cream-50 p-5">
                    <div className="mb-3 flex items-center gap-2 font-semibold">
                      <ShieldCheck size={18} /> Family notes
                    </div>
                    <p className="text-cocoa-700">{activeBooking.notes || "No extra notes provided."}</p>
                  </div>
                </div>

                <div className="space-y-4 rounded-3xl bg-white p-4 ring-1 ring-saffron-100 sm:p-5">
                  <label className="block">
                    <span className="mb-2 block text-lg font-semibold">Tasks completed</span>
                    <input
                      className="input"
                      placeholder="Wheelchair assistance, pharmacy pickup..."
                      value={reportForm.tasksCompleted}
                      onChange={(event) => setReportForm((current) => ({ ...current, tasksCompleted: event.target.value }))}
                    />
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-lg font-semibold">Elder mood</span>
                    <input
                      className="input"
                      value={reportForm.elderMood}
                      onChange={(event) => setReportForm((current) => ({ ...current, elderMood: event.target.value }))}
                    />
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-lg font-semibold">Concerns</span>
                    <textarea
                      rows="3"
                      className="input"
                      value={reportForm.concerns}
                      onChange={(event) => setReportForm((current) => ({ ...current, concerns: event.target.value }))}
                    />
                  </label>
                  <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                    <button
                      type="button"
                      className="btn-secondary w-full sm:w-auto"
                      onClick={() => updateStatus(activeBooking._id, "in_progress", "Visit in progress")}
                    >
                      Mark in progress
                    </button>
                    <button type="button" className="btn-primary w-full sm:w-auto" onClick={submitReport}>
                      Mark complete
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-cocoa-700">No active visit at the moment.</p>
            )}
          </SectionCard>
        </div>

        <SectionCard title="Completed visits and earnings" subtitle="A lightweight summary of past work.">
          {isLoading ? (
            <LoadingSkeleton rows={3} />
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {completed.length ? (
                completed.map((booking) => (
                  <div key={booking._id} className="rounded-3xl bg-cream-50 p-5 ring-1 ring-saffron-100">
                    <div className="text-lg font-bold sm:text-xl">{booking.serviceType}</div>
                    <p className="mt-1 text-cocoa-700">{booking.elderId?.name}</p>
                    <div className="mt-4 flex items-center gap-2 text-saffron-700">
                      <IndianRupee size={18} />
                      Rs. {booking.quotedPrice || 600} credited
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-cocoa-700">No completed visits yet.</p>
              )}
            </div>
          )}
        </SectionCard>
      </div>
      <Toast message={toast} onClose={() => setToast("")} />
    </Layout>
  );
};

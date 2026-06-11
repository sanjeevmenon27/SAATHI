import { BarChart3, ShieldAlert, UserCog, Users, CheckCircle2, Calendar, UserCheck, Phone, Mail } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Layout } from "../../components/Layout";
import { LoadingSkeleton } from "../../components/LoadingSkeleton";
import { MobileDataList } from "../../components/MobileDataList";
import { SectionCard } from "../../components/SectionCard";
import { Toast } from "../../components/Toast";
import { api } from "../../api";

export const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [analytics, setAnalytics] = useState({ totalBookings: 0, activeSaathis: 0, revenue: 0 });
  const [toast, setToast] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [userRes, bookingRes, analyticsRes] = await Promise.all([
        api.get("/admin/users"),
        api.get("/admin/bookings"),
        api.get("/admin/analytics")
      ]);
      setUsers(userRes.data);
      setBookings(bookingRes.data);
      setAnalytics(analyticsRes.data);
    } catch (error) {
      setToast("Error loading dashboard data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const updateApproval = async (userId, status) => {
    try {
      await api.patch(`/admin/saathis/${userId}/approval`, { status });
      setToast(`Saathi background check: ${status.toUpperCase()}`);
      loadData();
    } catch (error) {
      setToast("Failed to update approval status");
    }
  };

  const suspendUser = async (userId, isSuspended) => {
    try {
      await api.patch(`/admin/users/${userId}/suspension`, { isSuspended });
      setToast(isSuspended ? "Account suspended" : "Account reactivated");
      loadData();
    } catch (error) {
      setToast("Failed to toggle suspension");
    }
  };

  const pendingSaathis = useMemo(
    () => users.filter((user) => user.role === "saathi" && user.saathiProfile?.backgroundCheckStatus === "pending"),
    [users]
  );

  const allSaathis = useMemo(
    () => users.filter((user) => user.role === "saathi"),
    [users]
  );

  return (
    <Layout>
      <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 sm:py-8">
        <SectionCard title="Admin Control Center" subtitle="Approve companions, manage accounts, and oversee marketplace bookings.">
          {/* Tab Navigation */}
          <div className="mt-4 flex flex-wrap gap-2 border-b border-saffron-100 pb-3">
            {[
              { id: "overview", label: "Overview & Bookings", icon: BarChart3 },
              { id: "pending", label: "Pending Approvals", icon: UserCog, badge: pendingSaathis.length },
              { id: "saathis", label: "Saathi Directory", icon: Users, badge: allSaathis.length },
              { id: "users", label: "User Accounts", icon: ShieldAlert }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`inline-flex min-h-12 items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-semibold transition active:scale-[0.98] sm:text-base ${
                    isActive
                      ? "bg-saffron-500 text-white shadow-card"
                      : "bg-cream-50 text-cocoa-900 hover:bg-cream-100"
                  }`}
                >
                  <Icon size={18} />
                  <span>{tab.label}</span>
                  {tab.badge !== undefined && tab.badge > 0 ? (
                    <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                      isActive ? "bg-white text-saffron-700" : "bg-saffron-200 text-saffron-800"
                    }`}>
                      {tab.badge}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </SectionCard>

        {/* Tab 1: Overview & Bookings */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Analytics Stats */}
            {isLoading ? (
              <LoadingSkeleton rows={2} />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                <div className="stat-card">
                  <div className="mb-3 flex items-center gap-2 font-semibold text-cocoa-700">
                    <Calendar size={18} className="text-saffron-500" /> Total bookings
                  </div>
                  <div className="stat-value">{analytics.totalBookings}</div>
                </div>
                <div className="stat-card">
                  <div className="mb-3 flex items-center gap-2 font-semibold text-cocoa-700">
                    <UserCheck size={18} className="text-saffron-500" /> Active Saathis
                  </div>
                  <div className="stat-value">{analytics.activeSaathis}</div>
                </div>
                <div className="stat-card sm:col-span-2 xl:col-span-1">
                  <div className="mb-3 flex items-center gap-2 font-semibold text-cocoa-700">
                    <Users size={18} className="text-saffron-500" /> Revenue
                  </div>
                  <div className="stat-value">Rs. {analytics.revenue}</div>
                </div>
              </div>
            )}

            {/* Bookings Section */}
            <SectionCard title="All bookings" subtitle="Current status across the full marketplace.">
              {isLoading ? (
                <LoadingSkeleton rows={4} />
              ) : (
                <MobileDataList
                  items={bookings}
                  headers={["Service", "Elder", "Saathi", "Date", "Status"]}
                  emptyMessage="No bookings available."
                  renderItem={(booking) => (
                    <div key={booking._id} className="mobile-card bg-cream-50">
                      <div className="text-lg font-bold">{booking.serviceType}</div>
                      <div className="mt-3 grid gap-2 text-sm text-cocoa-700 sm:grid-cols-2">
                        <p><strong>Elder:</strong> {booking.elderId?.name || "-"}</p>
                        <p><strong>Saathi:</strong> {booking.saathiId?.name || "-"}</p>
                        <p><strong>Date:</strong> {booking.date || "-"}</p>
                        <p><strong>Status:</strong> {booking.status}</p>
                      </div>
                    </div>
                  )}
                  renderRow={(booking) => (
                    <tr key={booking._id} className="border-t border-saffron-100">
                      <td className="px-4 py-4 font-semibold">{booking.serviceType}</td>
                      <td className="px-4 py-4">{booking.elderId?.name}</td>
                      <td className="px-4 py-4">{booking.saathiId?.name}</td>
                      <td className="px-4 py-4">{booking.date}</td>
                      <td className="px-4 py-4 capitalize">{booking.status.replace("_", " ")}</td>
                    </tr>
                  )}
                />
              )}
            </SectionCard>
          </div>
        )}

        {/* Tab 2: Pending Approvals */}
        {activeTab === "pending" && (
          <SectionCard title="Pending Saathi Approvals" subtitle="Review and approve Aadhar details for new companion registrations.">
            {isLoading ? (
              <LoadingSkeleton rows={3} />
            ) : (
              <div className="dashboard-list">
                {pendingSaathis.length ? (
                  pendingSaathis.map((user) => (
                    <div key={user._id} className="mobile-card bg-cream-50 border border-saffron-100">
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="space-y-2">
                          <div className="text-lg font-bold sm:text-xl text-cocoa-900">{user.name}</div>
                          <div className="flex flex-wrap gap-4 text-sm text-cocoa-700">
                            <span className="flex items-center gap-1"><Mail size={16} /> {user.email}</span>
                            <span className="flex items-center gap-1"><Phone size={16} /> {user.phone || "No phone"}</span>
                          </div>
                          <p className="text-cocoa-700 bg-white p-3 rounded-2xl border border-saffron-100 text-sm">
                            <strong>Bio:</strong> {user.saathiProfile?.bio || "No biography provided."}
                          </p>
                          <div className="flex flex-wrap gap-2 text-sm text-cocoa-700">
                            <strong>Languages:</strong> {user.saathiProfile?.languagesSpoken?.join(", ") || "None"}
                          </div>
                          <div className="mt-2">
                            <span className="inline-flex items-center gap-1.5 rounded-2xl border border-saffron-200 bg-saffron-100/50 px-3 py-1.5 text-sm font-bold text-saffron-700 uppercase tracking-wide">
                              Aadhar Number: {user.saathiProfile?.aadharNumber || "Not Provided"}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2 self-end lg:self-start">
                          <button
                            type="button"
                            className="btn-primary"
                            onClick={() => updateApproval(user._id, "approved")}
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            className="btn-secondary"
                            onClick={() => updateApproval(user._id, "rejected")}
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center bg-cream-50 rounded-[28px] p-6 border border-saffron-100">
                    <CheckCircle2 size={40} className="text-green-500 mb-2" />
                    <p className="text-cocoa-900 font-semibold">All registrations processed!</p>
                    <p className="text-sm text-cocoa-700 mt-1">There are no Saathis waiting for background checks.</p>
                  </div>
                )}
              </div>
            )}
          </SectionCard>
        )}

        {/* Tab 3: Saathi Directory */}
        {activeTab === "saathis" && (
          <SectionCard title="Registered Saathi Directory" subtitle="Complete list of all registered companions, their contact info, Aadhar numbers, and active states.">
            {isLoading ? (
              <LoadingSkeleton rows={4} />
            ) : (
              <div className="dashboard-list">
                {allSaathis.length ? (
                  allSaathis.map((user) => {
                    const status = user.saathiProfile?.backgroundCheckStatus || "pending";
                    return (
                      <div key={user._id} className="mobile-card bg-white border border-saffron-100">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                          <div className="space-y-2 flex-1">
                            <div className="flex flex-wrap items-center gap-3">
                              <span className="text-lg font-bold sm:text-xl text-cocoa-900">{user.name}</span>
                              <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold capitalize ${
                                status === "approved"
                                  ? "bg-green-100 text-green-700"
                                  : status === "rejected"
                                  ? "bg-red-100 text-red-700"
                                  : "bg-yellow-100 text-yellow-700"
                              }`}>
                                {status}
                              </span>
                              {user.isSuspended && (
                                <span className="rounded-full bg-red-500 px-2.5 py-0.5 text-xs font-bold text-white">
                                  Suspended
                                </span>
                              )}
                            </div>
                            
                            <div className="grid gap-2 text-sm text-cocoa-700 sm:grid-cols-2 lg:grid-cols-3">
                              <span className="flex items-center gap-1"><Mail size={16} /> {user.email}</span>
                              <span className="flex items-center gap-1"><Phone size={16} /> {user.phone || "No phone"}</span>
                              <span className="font-semibold text-cocoa-900">
                                Aadhar: {user.saathiProfile?.aadharNumber || "Not Provided"}
                              </span>
                            </div>

                            <p className="text-cocoa-700 bg-cream-50/50 p-3 rounded-2xl border border-saffron-100/50 text-sm">
                              <strong>Bio:</strong> {user.saathiProfile?.bio || "No biography provided."}
                            </p>

                            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-cocoa-700">
                              <span><strong>Languages:</strong> {user.saathiProfile?.languagesSpoken?.join(", ") || "None"}</span>
                              <span><strong>Rating:</strong> ⭐ {user.saathiProfile?.rating || "0.0"} ({user.saathiProfile?.totalSessions || 0} visits)</span>
                              <span><strong>Available:</strong> {user.saathiProfile?.isAvailable ? "🟢 Yes" : "🔴 No"}</span>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2 lg:flex-col lg:w-44">
                            {status !== "approved" && (
                              <button
                                type="button"
                                className="btn-primary w-full"
                                onClick={() => updateApproval(user._id, "approved")}
                              >
                                Approve
                              </button>
                            )}
                            {status !== "rejected" && (
                              <button
                                type="button"
                                className="btn-secondary w-full"
                                onClick={() => updateApproval(user._id, "rejected")}
                              >
                                Reject
                              </button>
                            )}
                            <button
                              type="button"
                              className="btn-secondary w-full border-red-200 text-red-600 hover:bg-red-50"
                              onClick={() => suspendUser(user._id, !user.isSuspended)}
                            >
                              {user.isSuspended ? "Reactivate" : "Suspend"}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-cocoa-700">No registered Saathis in the system.</p>
                )}
              </div>
            )}
          </SectionCard>
        )}

        {/* Tab 4: User Directory */}
        {activeTab === "users" && (
          <SectionCard title="User Accounts" subtitle="Manage all system accounts: Family requesters, Companions, and Administrators.">
            {isLoading ? (
              <LoadingSkeleton rows={4} />
            ) : (
              <div className="dashboard-list">
                {users.map((user) => (
                  <div key={user._id} className="flex flex-col gap-4 rounded-3xl bg-white p-4 ring-1 ring-saffron-100 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-cocoa-900">{user.name}</span>
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold capitalize ${
                          user.role === "admin"
                            ? "bg-purple-100 text-purple-700"
                            : user.role === "saathi"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-orange-100 text-orange-700"
                        }`}>
                          {user.role}
                        </span>
                        {user.isSuspended && (
                          <span className="rounded-full bg-red-500 px-2 py-0.5 text-xs font-bold text-white">
                            Suspended
                          </span>
                        )}
                      </div>
                      <div className="mt-1 text-sm text-cocoa-700 flex flex-wrap gap-3">
                        <span>{user.email}</span>
                        <span>{user.phone ? `| ${user.phone}` : ""}</span>
                      </div>
                    </div>
                    {user.role !== "admin" ? (
                      <button
                        type="button"
                        className="btn-secondary w-full sm:w-auto"
                        onClick={() => suspendUser(user._id, !user.isSuspended)}
                      >
                        <ShieldAlert size={18} />
                        {user.isSuspended ? "Reactivate" : "Suspend"}
                      </button>
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        )}
      </div>
      <Toast message={toast} onClose={() => setToast("")} />
    </Layout>
  );
};

import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Layout } from "../components/Layout";
import { SectionCard } from "../components/SectionCard";
import { howItWorks, serviceOptions, testimonials } from "../data";

export const LandingPage = () => (
  <Layout>
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(242,159,56,0.26),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(243,138,77,0.18),_transparent_30%)]" />
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 sm:py-14 lg:grid-cols-[1.2fr_0.8fr] lg:gap-12 lg:py-24">
        <div className="relative">
          <span className="inline-flex rounded-full bg-white px-4 py-2 text-xs font-semibold text-saffron-700 shadow-card sm:text-sm">
            Trusted support for elders and families
          </span>
          <h1 className="mt-5 max-w-3xl text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
            No elder should ever feel alone
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-cocoa-700 sm:text-xl sm:leading-9">
            SaathiCare helps families book verified companions for hospital visits, companionship,
            errands, tech help, and daily check-ins.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-4">
            <Link to="/register?role=elder_family" className="btn-primary w-full sm:w-auto">
              Book a Saathi <ArrowRight size={20} />
            </Link>
            <Link to="/register?role=saathi" className="btn-secondary w-full sm:w-auto">
              Become a Saathi
            </Link>
          </div>
          <div className="mt-8 grid gap-3 sm:grid-cols-3 sm:gap-4">
            {["Verified Saathis", "Tamil-friendly matching", "Visit reports for families"].map((item) => (
              <div key={item} className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-card">
                <CheckCircle2 className="text-saffron-700" size={20} />
                <span className="text-sm font-semibold">{item}</span>
              </div>
            ))}
          </div>
        </div>

        <SectionCard
          title="Care Snapshot"
          subtitle="A family-friendly view of what SaathiCare manages each day."
          className="relative border border-saffron-100 bg-gradient-to-br from-white to-cream-100"
        >
          <div className="space-y-4">
            <div className="rounded-3xl bg-saffron-100 p-5">
              <div className="text-sm font-semibold uppercase tracking-wide text-saffron-700">Today</div>
              <div className="mt-2 text-3xl font-bold">24 active visits</div>
              <div className="mt-2 text-cocoa-700">Live status shared with families across Tamil Nadu.</div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl bg-white p-5 ring-1 ring-saffron-100">
                <div className="text-sm text-cocoa-700">Top request</div>
                <div className="mt-1 text-xl font-bold">Hospital Escort</div>
              </div>
              <div className="rounded-3xl bg-white p-5 ring-1 ring-saffron-100">
                <div className="text-sm text-cocoa-700">Language fit</div>
                <div className="mt-1 text-xl font-bold">Tamil first</div>
              </div>
            </div>
          </div>
        </SectionCard>
      </div>
    </section>

    <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:py-12">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold sm:text-4xl">How it works</h2>
        <p className="mt-3 text-base text-cocoa-700 sm:text-lg">Simple care coordination in three clear steps.</p>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        {howItWorks.map((step) => {
          const Icon = step.icon;
          return (
            <SectionCard key={step.title} title={step.title}>
              <div className="mb-5 inline-flex rounded-3xl bg-apricot-100 p-4 text-apricot-500">
                <Icon size={30} />
              </div>
              <p className="text-base leading-8 text-cocoa-700 sm:text-lg">{step.text}</p>
            </SectionCard>
          );
        })}
      </div>
    </section>

    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold sm:text-4xl">Service categories</h2>
        <p className="mt-3 text-base text-cocoa-700 sm:text-lg">Flexible support for both urgent and everyday needs.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {serviceOptions.map((service) => {
          const Icon = service.icon;
          return (
            <div key={service.name} className="rounded-[28px] bg-white p-5 shadow-card sm:p-6">
              <div className="mb-4 inline-flex rounded-3xl bg-cream-100 p-4 text-saffron-700">
                <Icon size={28} />
              </div>
              <h3 className="text-lg font-bold sm:text-xl">{service.name}</h3>
              <p className="mt-3 leading-7 text-cocoa-700">{service.description}</p>
            </div>
          );
        })}
      </div>
    </section>

    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <SectionCard title="Families trust the human touch">
        <div className="grid gap-6 md:grid-cols-3">
          {testimonials.map((item) => (
            <div key={item.name} className="rounded-3xl bg-cream-50 p-6 ring-1 ring-saffron-100">
              <p className="text-base leading-8 text-cocoa-700 sm:text-lg">"{item.quote}"</p>
              <p className="mt-4 font-bold">{item.name}</p>
            </div>
          ))}
        </div>
      </SectionCard>
    </section>
  </Layout>
);

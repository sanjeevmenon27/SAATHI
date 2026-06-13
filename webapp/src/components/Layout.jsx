import { Navbar } from "./Navbar";

export const Layout = ({ children }) => (
  <div className="min-h-screen overflow-x-hidden bg-cream-50 text-cocoa-900">
    <Navbar />
    <main className="pb-24 md:pb-0">{children}</main>
  </div>
);

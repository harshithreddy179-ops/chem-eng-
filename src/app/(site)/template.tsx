/** Plain wrapper: pages appear immediately (no slow fade between routes). */
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="motion-safe:animate-page-in">{children}</div>;
}

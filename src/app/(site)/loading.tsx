export default function Loading() {
  return (
    <div className="frame flex min-h-[70vh] items-center justify-center pt-32" role="status" aria-label="Loading">
      <span className="relative block h-px w-40 overflow-hidden bg-ivory/10">
        <span className="absolute inset-y-0 left-0 w-1/3 animate-[loading_1.6s_cubic-bezier(0.22,1,0.36,1)_infinite] bg-bronze" />
      </span>
      <style>{`@keyframes loading{0%{transform:translateX(-100%)}100%{transform:translateX(300%)}}`}</style>
    </div>
  );
}

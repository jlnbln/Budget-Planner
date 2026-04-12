export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-[#f8f9fa] flex flex-col">
      {children}
    </div>
  )
}

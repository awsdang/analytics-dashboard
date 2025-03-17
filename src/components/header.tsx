export default function Header() {

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between py-4 mx-auto">
            <span className="hidden font-bold sm:inline-block">QiCard Analytics</span>
      </div>
    </header>
  )
}


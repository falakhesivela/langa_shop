import { Truck, RotateCcw, Leaf, ShieldCheck } from "lucide-react"

const values = [
  { icon: Truck, title: "Fast shipping", text: "Across South Africa" },
  { icon: RotateCcw, title: "Easy returns", text: "Hassle-free exchanges" },
  { icon: Leaf, title: "New drops weekly", text: "Fresh fits, always" },
  { icon: ShieldCheck, title: "Secure checkout", text: "Pay with confidence" },
]

export function ValueProps() {
  return (
    <section className="border-y border-border bg-secondary/60">
      <div className="mx-auto flex max-w-7xl gap-8 overflow-x-auto px-5 py-5 lg:grid lg:grid-cols-4 lg:gap-6 lg:px-8">
        {values.map((v) => (
          <div key={v.title} className="flex shrink-0 items-center gap-3 lg:shrink lg:justify-center">
            <v.icon className="size-6 shrink-0 text-accent" strokeWidth={1.25} />
            <div className="whitespace-nowrap lg:whitespace-normal">
              <h3 className="text-sm font-medium">{v.title}</h3>
              <p className="text-xs text-muted-foreground">{v.text}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

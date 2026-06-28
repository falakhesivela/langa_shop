import { Truck, RotateCcw, Leaf, ShieldCheck } from "lucide-react"

const values = [
  { icon: Truck, title: "Complimentary shipping", text: "On all orders over $150, worldwide." },
  { icon: RotateCcw, title: "30-day returns", text: "Free, easy returns within 30 days." },
  { icon: Leaf, title: "Natural materials", text: "Responsibly sourced natural fibres." },
  { icon: ShieldCheck, title: "Made to last", text: "Crafted with a two-year guarantee." },
]

export function ValueProps() {
  return (
    <section className="border-y border-border">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-px px-5 py-12 lg:grid-cols-4 lg:px-8">
        {values.map((v) => (
          <div key={v.title} className="flex flex-col items-center gap-3 px-4 text-center">
            <v.icon className="size-7 text-accent" strokeWidth={1.25} />
            <h3 className="font-medium">{v.title}</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">{v.text}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

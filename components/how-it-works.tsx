import { ShoppingCart, Clock, Truck } from "lucide-react";

const steps = [
  {
    icon: ShoppingCart,
    title: "Browse & Order",
    description:
      "Pick your meals from the weekly menu. Add to cart and check out before Thursday 7 PM.",
  },
  {
    icon: Clock,
    title: "Saumya Cooks",
    description:
      "Every meal is freshly prepared in Saumya's home kitchen using traditional recipes and fresh ingredients.",
  },
  {
    icon: Truck,
    title: "Weekend Delivery",
    description:
      "Your meals are delivered on Saturday or Sunday — hot, fresh, and ready to enjoy.",
  },
];

export function HowItWorks() {
  return (
    <section className="py-16">
      <div className="container">
        <h2 className="text-2xl font-bold tracking-tight text-center mb-12">
          How It Works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="text-center space-y-4">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                <step.icon className="h-7 w-7 text-primary" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

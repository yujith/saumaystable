const steps = [
  {
    icon: "calendar_month",
    title: "1. Reserve Your Batch",
    description:
      "Choose from our rotating weekly menu. We only cook in small batches to ensure quality.",
  },
  {
    icon: "skillet",
    title: "2. Saumya Cooks",
    description:
      "Every meal is prepared by Saumya using family recipes and the morning's freshest market finds.",
  },
  {
    icon: "local_shipping",
    title: "3. Sunday Delivery",
    description:
      "We deliver fresh to your door every Saturday or Sunday afternoon, ready for your week.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 px-6 max-w-screen-xl mx-auto">
      <div className="text-center mb-16">
        <h3 className="font-headline text-3xl font-bold text-on-surface mb-4">
          The Journey to Your Table
        </h3>
        <div className="h-1 w-20 bg-primary mx-auto rounded-full" />
      </div>

      <div className="grid md:grid-cols-3 gap-12">
        {steps.map((step) => (
          <div
            key={step.title}
            className="flex flex-col items-center text-center group"
          >
            <div className="w-20 h-20 bg-secondary-container rounded-full flex items-center justify-center mb-6 group-hover:bg-primary-container transition-colors duration-500">
              <span className="material-symbols-outlined text-primary text-3xl">
                {step.icon}
              </span>
            </div>
            <h4 className="font-headline text-xl font-bold text-on-surface mb-3">
              {step.title}
            </h4>
            <p className="font-body text-on-surface-variant leading-relaxed">
              {step.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

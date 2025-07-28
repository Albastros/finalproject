import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

export default function AboutUsSection() {
  return (
    <section className="container mx-auto py-16 flex flex-col lg:flex-row items-center gap-12">
      <div className="flex-1 flex justify-center">
        <div className="w-full max-w-md aspect-video relative rounded-lg overflow-hidden shadow">
          <Image
            src="https://images.unsplash.com/photo-1569585723140-efb9daaa18f3?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Z2lybCUyMGhvbGRpbmclMjBhJTIwYm9va3N8ZW58MHx8MHx8fDA%3D"
            alt="Person holding books"
            fill
            className="object-cover"
            priority
          />
        </div>
      </div>
      <div className="flex-1 max-w-xl">
        <span className="text-cyan-600 font-semibold uppercase tracking-wide text-sm flex items-center gap-2">
          ABOUT US <span className="w-8 h-0.5 bg-cyan-400 inline-block ml-2" />
        </span>
        <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-4">Welcome to eLEARNING</h2>
        <p className="text-gray-600 mb-2">
          Tempor erat elitr rebun at clita. Diam dolor diam ipsum sit. Aliqu diam amet diam et eos.
          Clita erat ipsum et lorem et sit.
        </p>
        <p className="text-gray-600 mb-4">
          Tempor erat elitr rebun at clita. Diam dolor diam ipsum sit. Aliqu diam amet diam et eos.
          Clita erat ipsum et lorem et sit, sed stet lorem sit clita duo justo magna dolore erat
          amet
        </p>
        <div className="grid grid-cols-2 gap-2 mb-6 text-sm">
          <ul className="space-y-2">
            <li className="flex items-center gap-2 text-cyan-600">
              <span>&#8594;</span> Skilled Instructors
            </li>
            <li className="flex items-center gap-2 text-cyan-600">
              <span>&#8594;</span> International Certificate
            </li>
            <li className="flex items-center gap-2 text-cyan-600">
              <span>&#8594;</span> Online Classes
            </li>
          </ul>
          <ul className="space-y-2">
            <li className="flex items-center gap-2 text-cyan-600">
              <span>&#8594;</span> Online Classes
            </li>
            <li className="flex items-center gap-2 text-cyan-600">
              <span>&#8594;</span> Skilled Instructors
            </li>
            <li className="flex items-center gap-2 text-cyan-600">
              <span>&#8594;</span> International Certificate
            </li>
          </ul>
        </div>
        <Button className="bg-cyan-500 hover:bg-cyan-600 text-white rounded px-8 py-2 text-base font-semibold" asChild>
          <Link href="/about">Read More</Link>
        </Button>
      </div>
    </section>
  );
}

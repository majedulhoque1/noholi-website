import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { images } from "@/lib/data";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Noholi Library" },
      { name: "description", content: "The story, mission and reading culture behind Noholi, a library and literary home in Dhaka." },
      { property: "og:title", content: "About Noholi Library" },
      { property: "og:description", content: "How a neighbourhood shelf became a literary home in Dhaka." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: About,
});

function About() {
  return (
    <>
      <section className="container-page pb-16 pt-16 md:pt-24">
        <div className="eyebrow mb-8">About Noholi · আমাদের কথা</div>
        <h1 className="max-w-5xl text-5xl leading-[0.98] md:text-8xl">It began with one shelf, <em className="text-accent">and a promise to bring it back.</em></h1>
      </section>
      <img src={images.gShelves} alt="Tall wooden shelves at Noholi" className="photo h-[60vh] w-full object-cover" />

      <section className="container-page grid gap-12 py-24 lg:grid-cols-12">
        <div className="eyebrow lg:col-span-3">Our story</div>
        <div className="space-y-6 font-display text-2xl leading-relaxed lg:col-span-8">
          <p>Noholi started in 2016 as a lending shelf in a Pallabi living room — two hundred books, a notebook for signatures, and a rule that whatever you borrowed, you returned with a sentence about why it mattered.</p>
          <p className="text-muted-foreground">Today it is a public library of twelve thousand volumes, a small press, a recording studio and a reading room that is full most afternoons. The notebook is still there. It has run to forty-one volumes.</p>
        </div>
      </section>

      <section className="border-y border-foreground">
        <div className="container-page grid md:grid-cols-2">
          <div className="border-b border-border py-14 md:border-b-0 md:border-r md:pr-14">
            <div className="eyebrow mb-5">Mission</div>
            <p className="text-3xl leading-snug md:text-4xl">To make reading in Bangla and English free to start, easy to continue and joyful to share.</p>
          </div>
          <div className="py-14 md:pl-14">
            <div className="eyebrow mb-5">Vision</div>
            <p className="text-3xl leading-snug md:text-4xl">A Bangladesh where every neighbourhood has a library that feels like it belongs to everyone in it.</p>
          </div>
        </div>
      </section>

      <section className="container-page py-24">
        <h2 className="mb-14 text-4xl md:text-6xl">What Noholi offers</h2>
        <ol className="grid gap-x-12 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
          {[
            ["A lending library", "Twelve thousand printed books across fiction, non-fiction and children's shelves, in Bangla and English."],
            ["Noholi Prokash", "A small press publishing debut novelists, poets and community anthologies."],
            ["A digital shelf", "E-books readable in any browser and audio books recorded in our own studio."],
            ["A reading room", "Forty seats, good light, strong tea and a strict-but-kind silence policy."],
            ["Write Ups", "Blogs, creative writing and reviews by members, librarians and visiting writers."],
            ["A community", "Story hours, reading circles and monsoon poetry evenings, open to everyone."],
          ].map(([t, d], i) => (
            <li key={t} className="border-t border-border pt-5">
              <span className="font-display text-sm text-accent">0{i + 1}</span>
              <h3 className="mt-3 text-2xl">{t}</h3>
              <p className="mt-2 text-muted-foreground">{d}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="container-page grid gap-12 lg:grid-cols-12 lg:items-center">
        <img src={images.gPoetry} alt="A poetry evening at Noholi" loading="lazy" className="photo aspect-[4/3] w-full object-cover lg:col-span-7" />
        <div className="lg:col-span-4 lg:col-start-9">
          <div className="eyebrow mb-5">Philosophy</div>
          <blockquote className="font-display text-3xl italic leading-snug">"A library is the only room in the city where nobody asks you to buy anything."</blockquote>
          <p className="mt-6 text-muted-foreground">We believe reading is a shared act. A book read by forty people is not worn out — it is finished.</p>
        </div>
      </section>

      <section className="container-page mt-24 grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <div className="eyebrow mb-5">Reading culture</div>
          <h2 className="font-bangla text-4xl leading-snug">বই পড়া মানে একা থাকা নয় — অন্যদের সঙ্গে একই নীরবতায় বসে থাকা।</h2>
        </div>
        <div className="space-y-5 text-lg leading-relaxed text-muted-foreground lg:col-span-6 lg:col-start-7">
          <p>Our members range from six-year-olds at Friday story hour to retired professors working through the complete Elias. Around a third read mostly in English, a third mostly in Bangla, and a third refuse to choose.</p>
          <p>Membership is free, and always will be. Donations, Noholi Books and volunteers fund new acquisitions and the children's corner.</p>
        </div>
      </section>

      <section className="container-page mt-24">
        <div className="bg-secondary px-8 py-16 text-center md:py-20">
          <h2 className="text-4xl md:text-6xl">Come and read with us.</h2>
          <p className="mx-auto mt-4 max-w-md text-muted-foreground">Membership is free. Bring your NID and you're in.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button size="lg" variant="accent" asChild><Link to="/join">Become a Member</Link></Button>
            <Button size="lg" variant="outline" asChild><Link to="/contact">Visit the library</Link></Button>
          </div>
        </div>
      </section>
    </>
  );
}

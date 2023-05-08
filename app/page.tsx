import Details from "@/components/main/details"

export default function IndexPage() {
  return (
    <section className="container grid items-center gap-6 pb-8 pt-6 md:py-10">
      <div className="flex max-w-[980px] flex-col items-start gap-2">
        <h1 className="text-3xl font-extrabold leading-tight tracking-tighter sm:text-3xl md:text-5xl lg:text-6xl">
          Check stats for a Battlefield 2042 player
        </h1>
        <p className="text-gray-400 mb-4">
          Enter your username to fetch your stats
        </p>
        <Details />
      </div>
    </section>
  )
}

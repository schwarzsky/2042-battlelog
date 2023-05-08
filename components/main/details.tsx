"use client"

import { useState } from "react"
import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { PlayerStats } from "@/types/player-stats"
import { useCache } from "@/lib/local-cache"
import { usernameSchema } from "@/lib/validations/username"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Button, buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Icons } from "@/components/icons"

const localeNumber = (num: number) => {
  return num.toLocaleString("en-US")
}

type FormData = z.infer<typeof usernameSchema>

export default function Details() {
  const {
    handleSubmit,
    register,
    formState: { errors },
    setError,
  } = useForm<FormData>({
    resolver: zodResolver(usernameSchema),
  })
  const [loading, setLoading] = useState(false)
  const [playerStats, setPlayerStats] = useState<typeof PlayerStats>()
  const { cache, addToCache, removeItem } = useCache()

  async function fetchStats(data: FormData) {
    setLoading(true)
    addToCache(data.username)
    await fetchUsernameStats(data.username)
    setLoading(false)
  }

  async function fetchUsernameStats(username: string) {
    const statsData = await fetch(
      `https://api.gametools.network/bf2042/stats/?raw=false&format_values=true&name=${username}&platform=pc&skip_battlelog=false`
    ).then((res) => res.json())

    if (statsData.errors)
      setError("username", { type: "custom", message: statsData.errors[0] })
    if (!statsData.errors) setPlayerStats(statsData)
  }

  return (
    <div className="flex flex-col gap-2 w-full">
      <form onSubmit={handleSubmit(fetchStats)} className="flex gap-2">
        <Input
          type="text"
          id="username"
          placeholder="Username"
          {...register("username")}
        />
        <Button disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Fetch
        </Button>
      </form>
      {errors?.username && (
        <p className="text-red-400 text-xs mb-4">{errors.username.message}</p>
      )}
      {playerStats && (
        <section className="my-4 flex flex-col gap-2">
          <Accordion type="single" collapsible>
            <AccordionItem value="item-1">
              <AccordionTrigger>Combat</AccordionTrigger>
              <AccordionContent>
                <ul className="flex flex-col gap-1 text-sm">
                  <li>
                    <b>KDA:</b> {playerStats.killDeath}
                  </li>
                  <li>
                    <b>Kills/Deaths:</b> {localeNumber(playerStats.kills)}/
                    {localeNumber(playerStats.deaths)} -&gt;{" "}
                    {localeNumber(playerStats.kills + playerStats.deaths)}
                  </li>
                  <li>
                    <b>Wins/Loses:</b>{" "}
                    {playerStats.wins.toLocaleString("en-US")}/
                    {playerStats.loses.toLocaleString("en-US")} -&gt;{" "}
                    {(playerStats.wins + playerStats.loses).toLocaleString(
                      "en-US"
                    )}
                  </li>
                  <li>
                    <b>Accuracy (shots fired/shots hit):</b>{" "}
                    {playerStats.accuracy} (
                    {localeNumber(playerStats.shotsFired)}/
                    {localeNumber(playerStats.shotsHit)})
                  </li>
                  <li>
                    <b>Headshots:</b> {localeNumber(playerStats.headShots)}{" "}
                    -&gt; {playerStats.headshots}
                  </li>
                  <li>
                    <b>Damage/Kill ᵖᵉʳ ᵐᵃᵗᶜʰ:</b> {playerStats.damagePerMatch}/
                    {playerStats.killsPerMatch}
                  </li>
                  <li>
                    <b>Damage/Kill ᵖᵉʳ ᵐᶤᶰᵘᵗᵉ:</b> {playerStats.damagePerMinute}
                    /{playerStats.killsPerMinute}
                  </li>
                  <li>
                    <b>Total Damage:</b> {localeNumber(playerStats.damage)}
                  </li>
                  <li>
                    <b>Vehicles Destroyed:</b>{" "}
                    {localeNumber(playerStats.vehiclesDestroyed)}
                  </li>
                  <li>
                    <b>Savior Kills:</b> {localeNumber(playerStats.saviorKills)}
                  </li>
                </ul>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>Support</AccordionTrigger>
              <AccordionContent>
                <ul className="flex flex-col gap-1 text-sm">
                  <li>
                    <b>Revives:</b> {localeNumber(playerStats.revives)}
                  </li>
                  <li>
                    <b>Repairs:</b> {localeNumber(playerStats.repairs)}
                  </li>
                  <li>
                    <b>Assists:</b> {localeNumber(playerStats.killAssists)}
                  </li>
                  <li>
                    <b>Enemies Spotted:</b>{" "}
                    {localeNumber(playerStats.enemiesSpotted)}
                  </li>
                  <li>
                    <b>Gadgets Destroyed:</b>{" "}
                    {localeNumber(playerStats.gadgetsDestoyed)}
                  </li>
                </ul>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>General</AccordionTrigger>
              <AccordionContent>
                <ul className="flex flex-col gap-1 text-sm">
                  <li>
                    <b>MVP:</b> {localeNumber(playerStats.mvp)}
                  </li>
                  <li>
                    <b>Best Squad:</b> {localeNumber(playerStats.bestSquad)}
                  </li>
                  <li>
                    <b>Time Played:</b> {playerStats.timePlayed}
                  </li>
                  <li>
                    <b>Best Class:</b> {playerStats.bestClass}
                  </li>
                  <li>
                    <b>Matches Played:</b>{" "}
                    {localeNumber(playerStats.matchesPlayed)}
                  </li>
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
          <Link
            target="_blank"
            rel="noreferrer"
            className={buttonVariants({ variant: "outline", size: "lg" })}
            href={`https://api.gametools.network/bf2042/stats/?raw=false&format_values=true&name=${playerStats.userName}&platform=pc&skip_battlelog=false`}
          >
            Full JSON --&gt;
          </Link>
        </section>
      )}
      <section>
        <h3 className="text-lg mb-2">Recent searches</h3>
        {cache &&
          cache.map((r: string) => {
            return (
              <div
                key={r}
                className="w-full flex justify-between items-center px-2 py-2 text-sm cursor-pointer bg-gray-100 hover:bg-gray-300 dark:bg-gray-800 rounded-md mb-2 dark:hover:bg-gray-900"
              >
                <p>{r}</p>
                <span>
                  <Icons.trash
                    className="w-4 h-4 hover:text-red-400"
                    onClick={() => {
                      removeItem(r)
                    }}
                  />
                </span>
              </div>
            )
          })}
      </section>
    </div>
  )
}

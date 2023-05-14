"use client"

import { useState } from "react"
import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { PlayerStats } from "@/types/player-stats"
import { useCache } from "@/lib/local-cache"
import { getStats, localeNumber } from "@/lib/utils"
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

type FormData = z.infer<typeof usernameSchema>
type RecentSearchesProps = {
  fetchUsernameStats: (username: string) => void
}

function RecentSearches({ fetchUsernameStats }: RecentSearchesProps) {
  const { cache, removeItem } = useCache()

  return (
    <section>
      <h3 className="mb-2 text-lg">Recent searches</h3>
      {cache &&
        cache.map((r: string) => {
          return (
            <div
              key={r}
              className="mb-2 flex w-full cursor-pointer items-center justify-between rounded-md bg-gray-100 px-2 py-2 text-sm hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-900"
              onClick={() => {
                fetchUsernameStats(r)
              }}
            >
              <p>{r}</p>
              <span>
                <Icons.trash
                  className="h-4 w-4 hover:text-red-400"
                  onClick={() => {
                    removeItem(r)
                  }}
                />
              </span>
            </div>
          )
        })}
    </section>
  )
}

type PlayerStatisticsProps = {
  playerStats: typeof PlayerStats
}

function PlayerStatistics({ playerStats }: PlayerStatisticsProps) {
  if (!playerStats) return null
  return (
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
                <b>Wins/Loses:</b> {localeNumber(playerStats.wins)}/
                {localeNumber(playerStats.loses)} -&gt;{" "}
                {localeNumber(playerStats.wins + playerStats.loses)}
              </li>
              <li>
                <b>Accuracy (shots fired/shots hit):</b> {playerStats.accuracy}{" "}
                ({localeNumber(playerStats.shotsFired)}/
                {localeNumber(playerStats.shotsHit)})
              </li>
              <li>
                <b>Headshots:</b> {localeNumber(playerStats.headShots)} -&gt;{" "}
                {playerStats.headshots}
              </li>
              <li>
                <b>Damage/Kill ᵖᵉʳ ᵐᵃᵗᶜʰ:</b> {playerStats.damagePerMatch}/
                {playerStats.killsPerMatch}
              </li>
              <li>
                <b>Damage/Kill ᵖᵉʳ ᵐᶤᶰᵘᵗᵉ:</b> {playerStats.damagePerMinute}/
                {playerStats.killsPerMinute}
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
                <b>Matches Played:</b> {localeNumber(playerStats.matchesPlayed)}
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
  )
}

export default function Details() {
  const {
    handleSubmit,
    register,
    formState: { errors },
    setError,
    setValue,
    clearErrors,
  } = useForm<FormData>({
    resolver: zodResolver(usernameSchema),
  })
  const [loading, setLoading] = useState(false)
  const [playerStats, setPlayerStats] = useState<typeof PlayerStats>()
  const { addToCache } = useCache()

  async function fetchStats(data: FormData) {
    addToCache(data.username)
    await fetchUsernameStats(data.username)
  }

  async function fetchUsernameStats(username: string) {
    clearErrors("username")
    setValue("username", username)
    setLoading(true)
    const statsData = await getStats(username)

    if (statsData.errors)
      setError("username", { type: "custom", message: statsData.errors[0] })
    if (!statsData.errors) setPlayerStats(statsData)
    setLoading(false)
  }

  return (
    <div className="flex w-full flex-col gap-2">
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
        <p className="mb-4 text-xs text-red-400">{errors.username.message}</p>
      )}
      <PlayerStatistics playerStats={playerStats} />
      <RecentSearches fetchUsernameStats={fetchUsernameStats} />
    </div>
  )
}

import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export async function getStats(username: string) {
  return await fetch(
    `https://api.gametools.network/bf2042/stats/?raw=false&format_values=true&name=${username}&platform=pc&skip_battlelog=false`
  ).then((res) => res.json())
}

export function localeNumber(num: number) {
  if (!num) return

  return num.toLocaleString("en-US")
}

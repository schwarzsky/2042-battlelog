import { useEffect, useState } from "react"

function getCache() {
  if (typeof window == "undefined") return
  return JSON.parse(localStorage.getItem("recentSearches") || "[]")
}

export const useCache = () => {
  const [cache, setCache] = useState(getCache || [])

  useEffect(() => {
    window.addEventListener("storage", () => {
      setCache(getCache)
    })
  }, [])

  function addToCache(username: string) {
    if (typeof window == "undefined") return
    const items = getCache()

    if (items) {
      if (!items.includes(username)) {
        localStorage.setItem(
          "recentSearches",
          JSON.stringify([username, ...items])
        )
      }
    } else {
      localStorage.setItem("recentSearches", JSON.stringify([username]))
    }

    window.dispatchEvent(new Event("storage"))
  }

  function removeItem(username: string) {
    if (typeof window == "undefined") return

    const items = getCache()

    localStorage.setItem(
      "recentSearches",
      JSON.stringify(items.filter((u: string) => u !== username))
    )

    window.dispatchEvent(new Event("storage"))
  }

  return {
    cache,
    addToCache,
    removeItem,
  }
}

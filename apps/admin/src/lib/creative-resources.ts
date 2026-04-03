import type { LucideIcon } from "lucide-react"
import {
  Heart,
  Image as ImageIcon,
  Palette,
  Sparkles,
  UserRound,
} from "lucide-react"

export type CreativeResourceType =
  | "icons"
  | "stickers"
  | "authors"
  | "wallpaper"

export type CreativeResource = {
  id: string
  title: string
  href: string
  description: string
  source: string
  type: CreativeResourceType
}

export type CreativeResourceGroup = {
  id: CreativeResourceType
  title: string
  description: string
  icon: LucideIcon
  accentClassName: string
  resources: CreativeResource[]
}

export const creativeResourceGroups: CreativeResourceGroup[] = [
  {
    id: "icons",
    title: "Icon References",
    description:
      "Use these packs for onboarding, empty states, badges, and feature illustrations.",
    icon: Heart,
    accentClassName:
      "from-rose-100 via-pink-50 to-orange-50 text-rose-700 border-rose-200/80",
    resources: [
      {
        id: "valentine-icons",
        title: "Valentine Icons",
        href: "https://www.flaticon.com/free-icons/valentine",
        description:
          "Romantic icon ideas for love, messages, gifts, and seasonal UI moments.",
        source: "Flaticon",
        type: "icons",
      },
      {
        id: "dating-app-icons",
        title: "Dating App Icons",
        href: "https://www.flaticon.com/free-icons/dating-app",
        description:
          "UI-friendly icon concepts for likes, chats, profiles, and matching flows.",
        source: "Flaticon",
        type: "icons",
      },
    ],
  },
  {
    id: "stickers",
    title: "Sticker Picks",
    description:
      "These are strong references for festive promos, launch creatives, and playful empty states.",
    icon: Sparkles,
    accentClassName:
      "from-fuchsia-100 via-rose-50 to-pink-50 text-fuchsia-700 border-fuchsia-200/80",
    resources: [
      {
        id: "valentines-day-stickers",
        title: "Valentine's Day Stickers",
        href: "https://www.flaticon.com/free-stickers/valentines-day",
        description:
          "Sticker collection for campaigns around love notes, gifts, and celebration themes.",
        source: "Flaticon",
        type: "stickers",
      },
      {
        id: "cute-stickers",
        title: "Cute Stickers",
        href: "https://www.flaticon.com/free-stickers/cute",
        description:
          "Soft, friendly sticker inspiration for welcome flows and social-style moments.",
        source: "Flaticon",
        type: "stickers",
      },
      {
        id: "flowers-sticker",
        title: "Flowers Sticker",
        href: "https://www.flaticon.com/free-sticker/flowers_6843706?related_id=6843706",
        description:
          "Single floral sticker reference for banners, highlights, and romantic accents.",
        source: "Flaticon",
        type: "stickers",
      },
    ],
  },
  {
    id: "authors",
    title: "Author Profiles",
    description:
      "Keep these creator pages handy when you want a consistent visual source while building.",
    icon: UserRound,
    accentClassName:
      "from-amber-100 via-rose-50 to-orange-50 text-amber-700 border-amber-200/80",
    resources: [
      {
        id: "reem-alnounou",
        title: "Reem Alnounou",
        href: "https://www.flaticon.com/authors/reem-alnounou",
        description:
          "Author page you can revisit for more matching asset options in the same style family.",
        source: "Flaticon",
        type: "authors",
      },
      {
        id: "mrhamster",
        title: "MrHamster",
        href: "https://www.flaticon.com/authors/mrhamster",
        description:
          "Another creator reference for browsing related stickers and icon sets quickly.",
        source: "Flaticon",
        type: "authors",
      },
    ],
  },
  {
    id: "wallpaper",
    title: "Moodboard Wallpaper",
    description:
      "Use this as a visual direction cue for pink messaging scenes and romantic social promo layouts.",
    icon: ImageIcon,
    accentClassName:
      "from-pink-100 via-rose-50 to-violet-50 text-pink-700 border-pink-200/80",
    resources: [
      {
        id: "pink-message-wallpaper",
        title: "Heart Message Pink Wallpaper",
        href: "https://wallpapers.com/wallpapers/heart-message-pink-instagram-profile-vizwoyoue6ir9qxi.html",
        description:
          "Mood reference for background treatment, profile story cards, and pink gradient scenes.",
        source: "Wallpapers.com",
        type: "wallpaper",
      },
    ],
  },
]

export const creativeResources = creativeResourceGroups.flatMap(
  (group) => group.resources
)

export const creativeResourceCount = creativeResources.length

export const creativeIdeas = [
  "Use icon packs for profile actions, likes, chat shortcuts, and onboarding steps.",
  "Use stickers for launch banners, seasonal promos, and empty states that need more personality.",
  "Use the wallpaper link as a color and composition reference for pink social-style visuals.",
  "Use the author pages when you want more assets without breaking visual consistency.",
]

export const creativePageHighlights = [
  {
    title: "Romantic UI",
    value: "4",
    detail: "curated inspiration groups",
    icon: Heart,
  },
  {
    title: "External Links",
    value: String(creativeResourceCount),
    detail: "ready to open in a new tab",
    icon: Palette,
  },
  {
    title: "Quick Build",
    value: "1",
    detail: "central place for creative references",
    icon: Sparkles,
  },
]

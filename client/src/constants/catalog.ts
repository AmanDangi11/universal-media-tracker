import { MediaItem, SearchResult } from "../types/media";

export const GLOBAL_CATALOG: SearchResult[] = [
  {
    id: "cat-1",
    type: "ANIME",
    title: "Solo Leveling Season 1",
    franchise: "Solo Leveling Franchise",
    coverImage: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=500&auto=format&fit=crop&q=60",
    synopsis: "In a world where hunters must battle deadly monsters, the weakest hunter Jinwoo Sung receives a mysterious system that allows him to level up without limits.",
    totalProgress: 12,
    progressType: "episode"
  },
  {
    id: "cat-2",
    type: "ANIME",
    title: "Chainsaw Man",
    franchise: "Chainsaw Man Franchise",
    coverImage: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=500&auto=format&fit=crop&q=60",
    synopsis: "Denji is a teenage devil hunter who merges with his pet devil Pochita, gaining the ability to transform parts of his body into chainsaws.",
    totalProgress: 12,
    progressType: "episode"
  },
  {
    id: "cat-3",
    type: "MANGA",
    title: "Solo Leveling Webtoon",
    franchise: "Solo Leveling Franchise",
    coverImage: "https://images.unsplash.com/photo-1560942485-b2a11cc13456?w=500&auto=format&fit=crop&q=60",
    synopsis: "The official webtoon adaptation of the hit web novel Solo Leveling, detailing Jinwoo Sung's ascension to the Shadow Monarch.",
    totalProgress: 179,
    progressType: "chapter"
  },
  {
    id: "cat-4",
    type: "MANGA",
    title: "One Piece Manga",
    franchise: "One Piece Franchise",
    coverImage: "https://images.unsplash.com/photo-1563089145-599997674d42?w=500&auto=format&fit=crop&q=60",
    synopsis: "Follow Monkey D. Luffy and his straw hat crew as they traverse the Grand Line in search of the legendary One Piece treasure.",
    totalProgress: 1110,
    progressType: "chapter"
  },
  {
    id: "cat-5",
    type: "TV_SHOW",
    title: "House of the Dragon Season 2",
    franchise: "Game of Thrones Franchise",
    coverImage: "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?w=500&auto=format&fit=crop&q=60",
    synopsis: "The war of succession between Rhaenyra and Aegon Targaryen begins to tear Westeros apart in this epic adaptation of Fire & Blood.",
    totalProgress: 8,
    progressType: "episode"
  },
  {
    id: "cat-6",
    type: "MOVIE",
    title: "Dune: Part Two",
    franchise: "Dune Franchise",
    coverImage: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=500&auto=format&fit=crop&q=60",
    synopsis: "Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.",
    totalProgress: 1,
    progressType: "episode"
  }
];

export const INITIAL_MEDIA_LIST: MediaItem[] = [
  {
    id: "1",
    type: "ANIME",
    title: "Demon Slayer: Hashira Training Arc",
    franchise: "Demon Slayer (Kimetsu no Yaiba)",
    coverImage: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=500&auto=format&fit=crop&q=60",
    status: "Releasing",
    currentProgress: 4,
    totalProgress: 8,
    progressType: "episode",
    lastUpdated: "2 hours ago",
    sourceMaterialProgress: {
      title: "Demon Slayer Manga",
      current: 140,
      total: 205
    }
  },
  {
    id: "2",
    type: "MANGA",
    title: "Jujutsu Kaisen",
    franchise: "Jujutsu Kaisen Franchise",
    coverImage: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=500&auto=format&fit=crop&q=60",
    status: "Releasing",
    currentProgress: 261,
    totalProgress: 271,
    progressType: "chapter",
    lastUpdated: "Yesterday",
    sourceMaterialProgress: {
      title: "Jujutsu Kaisen Anime",
      current: 47,
      total: 47
    }
  }
];

export const LOADERS_DATA = [
  {
    text: "Summoning magical girl sparkles...",
    subtext: "Casting wand spells and loading list data (🪄💖)"
  },
  {
    text: "Shinobi dash in progress...",
    subtext: "Rushing through the database network (🥷💨)"
  },
  {
    text: "Powering up energy reserves...",
    subtext: "Charging cells past 9000! (⚡🔥)"
  },
  {
    text: "Waking up database from its nap...",
    subtext: "Totoro is breathing slowly... (💤🍃)"
  },
  {
    text: "Serving fresh watchlist entries...",
    subtext: "Rolling sushi logs down the conveyor (🍣🥢)"
  }
];

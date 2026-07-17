import { getApiBaseUrl } from "./apiClient";
import { SearchResult, MediaType } from "../types/media";

export const fetchAniListSearch = async (
  query: string,
  mediaType: "ALL" | "ANIME" | "MANGA"
): Promise<SearchResult[]> => {
  const aniListType = mediaType === "ALL" ? null : mediaType;
  const graphQLQuery = `
    query ($search: String, $type: MediaType) {
      Page (page: 1, perPage: 6) {
        media (search: $search, type: $type) {
          id
          type
          title {
            romaji
            english
          }
          description
          coverImage {
            large
          }
          chapters
          episodes
          nextAiringEpisode {
            airingAt
            timeUntilAiring
            episode
          }
        }
      }
    }
  `;

  const variables: any = { search: query };
  if (aniListType) {
    variables.type = aniListType;
  }

  const response = await fetch("https://graphql.anilist.co", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      query: graphQLQuery,
      variables,
    }),
  });

  if (!response.ok) return [];

  const contentType = response.headers.get("content-type");
  if (!contentType || !contentType.includes("application/json")) return [];

  const resData = await response.json();
  const aniListResults = resData?.data?.Page?.media || [];
  return aniListResults.map((item: any) => ({
    id: `anilist-${item.id}`,
    type: item.type === "ANIME" ? "ANIME" : "MANGA",
    title: item.title.english || item.title.romaji || "Unknown Title",
    franchise: `${item.title.romaji || item.title.english} Franchise`,
    coverImage: item.coverImage.large || "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=500&auto=format&fit=crop&q=60",
    synopsis: item.description ? item.description.replace(/<[^>]*>/g, "") : "No synopsis available.",
    totalProgress: item.type === "ANIME" ? (item.episodes || 12) : (item.chapters || 150),
    progressType: item.type === "ANIME" ? "episode" : "chapter",
    nextAiringEpisode: item.nextAiringEpisode,
  }));
};

export const fetchExpressSearch = async (
  query: string,
  mediaType: "ALL" | "TV_SHOW" | "MOVIE"
): Promise<SearchResult[]> => {
  const expressType = mediaType === "ALL" ? "ALL" : mediaType;
  const expressUrl = `${getApiBaseUrl()}/api/search?q=${encodeURIComponent(query)}&type=${expressType}`;
  const response = await fetch(expressUrl);
  if (!response.ok) return [];
  return response.json();
};

export const searchOnlineMedia = async (
  query: string,
  selectedMediaType: "ALL" | "ANIME" | "MANGA" | "TV_SHOW" | "MOVIE"
): Promise<SearchResult[]> => {
  if (!query) return [];

  let results: SearchResult[] = [];

  if (selectedMediaType === "ALL" || selectedMediaType === "ANIME" || selectedMediaType === "MANGA") {
    try {
      const aniListRes = await fetchAniListSearch(
        query,
        selectedMediaType === "ALL" ? "ALL" : (selectedMediaType as "ANIME" | "MANGA")
      );
      results = [...results, ...aniListRes];
    } catch (err) {
      console.warn("Failed to fetch AniList search:", err);
    }
  }

  if (selectedMediaType === "ALL" || selectedMediaType === "TV_SHOW" || selectedMediaType === "MOVIE") {
    try {
      const expressRes = await fetchExpressSearch(
        query,
        selectedMediaType === "ALL" ? "ALL" : (selectedMediaType as "TV_SHOW" | "MOVIE")
      );
      results = [...results, ...expressRes];
    } catch (err) {
      console.warn("Failed to fetch Express search:", err);
    }
  }

  if (selectedMediaType !== "ALL") {
    results = results.filter(item => {
      if (selectedMediaType === "ANIME") return item.type === "ANIME";
      if (selectedMediaType === "MANGA") return item.type === "MANGA";
      if (selectedMediaType === "TV_SHOW") return item.type === "TV_SHOW";
      if (selectedMediaType === "MOVIE") return item.type === "MOVIE";
      return true;
    });
  }

  return results;
};

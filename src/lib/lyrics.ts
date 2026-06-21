export interface LyricLine {
  time: number;
  text: string;
}

/**
 * Parses LRC formatted string into an array of LyricLine objects
 * Example LRC line: [00:12.34] Lyrics text here
 */
export const parseLRC = (lrcString: string): LyricLine[] => {
  if (!lrcString) return [];
  
  const lines = lrcString.split('\n');
  const parsedLyrics: LyricLine[] = [];
  
  // Regex to match [mm:ss.xx]
  const timeRegex = /\[(\d{2}):(\d{2})\.(\d{2,3})\]/;
  
  for (const line of lines) {
    const match = line.match(timeRegex);
    if (match) {
      const minutes = parseInt(match[1], 10);
      const seconds = parseInt(match[2], 10);
      // Some LRC files have 2 or 3 digits for milliseconds
      const milliseconds = parseInt(match[3].padEnd(3, '0'), 10);
      
      const timeInSeconds = (minutes * 60) + seconds + (milliseconds / 1000);
      const text = line.replace(timeRegex, '').trim();
      
      // We still include empty lines because songs have instrumental breaks
      parsedLyrics.push({ time: timeInSeconds, text });
    }
  }
  
  return parsedLyrics;
};

/**
 * Fetches lyrics from LRCLIB for a given track and artist
 */
export const fetchLyrics = async (trackName: string, artistName: string): Promise<LyricLine[] | null> => {
  try {
    const url = `https://lrclib.net/api/search?track_name=${encodeURIComponent(trackName)}&artist_name=${encodeURIComponent(artistName)}`;
    const response = await fetch(url);
    
    if (!response.ok) return null;
    
    const data = await response.json();
    
    if (Array.isArray(data) && data.length > 0) {
      // Find the first result that has syncedLyrics
      const bestMatch = data.find((item: any) => item.syncedLyrics);
      
      if (bestMatch && bestMatch.syncedLyrics) {
        return parseLRC(bestMatch.syncedLyrics);
      }
    }
    
    return null;
  } catch (error) {
    console.error("Error fetching lyrics:", error);
    return null;
  }
};

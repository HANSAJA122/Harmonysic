import { useState, useEffect } from 'react';

interface TriviaData {
  extract: string;
  loading: boolean;
  error: string | null;
}

export function useArtistTrivia(artistName: string): TriviaData {
  const [extract, setExtract] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!artistName) return;

    const fetchTrivia = async () => {
      setLoading(true);
      setError(null);
      try {
        // Use Wikipedia API to fetch a summary
        const url = `https://en.wikipedia.org/w/api.php?action=query&prop=extracts&exsentences=3&exintro=true&explaintext=true&titles=${encodeURIComponent(artistName)}&format=json&origin=*`;
        const res = await fetch(url);
        const data = await res.json();
        
        const pages = data?.query?.pages;
        if (pages) {
          const pageId = Object.keys(pages)[0];
          if (pageId && pageId !== '-1' && pages[pageId].extract) {
            setExtract(pages[pageId].extract);
          } else {
            setError('No trivia found.');
          }
        } else {
          setError('Failed to load trivia.');
        }
      } catch (err) {
        setError('Failed to fetch from Wikipedia.');
      } finally {
        setLoading(false);
      }
    };

    // Debounce slightly to avoid rapid fetches when skipping songs
    const timeout = setTimeout(() => {
      fetchTrivia();
    }, 500);

    return () => clearTimeout(timeout);
  }, [artistName]);

  return { extract, loading, error };
}

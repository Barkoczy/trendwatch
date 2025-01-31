'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import Image from 'next/image'; // Import komponentu Image

export default function Home() {
  interface Video {
    id: string;
    snippet: {
      title: string;
      description: string;
      thumbnails: {
        default: {
          url: string;
        };
      };
    };
  }

  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await axios.get('/api/youtube/videos', {
          params: {
            chart: 'mostPopular', // Get popular videos
            maxResults: 12, // Number of videos to fetch
            includeShorts: 'false', // Exclude Shorts
            regionCode: 'US', // Region filter
            videoCategoryId: '20', // Gaming category
          },
        });
        setVideos(response.data.items);
      } catch (error) {
        console.error('Failed to fetch videos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1>Popular YouTube Videos</h1>
      <ul>
        {videos.map((video) => (
          <li key={video.id}>
            <h2>{video.snippet.title}</h2>
            <p>{video.snippet.description}</p>
            <div
              style={{ position: 'relative', width: '100%', height: '200px' }}
            >
              <Image
                src={video.snippet.thumbnails.default.url}
                alt={video.snippet.title}
                fill // Nastaví obrázok na vyplnenie rodičovského kontajnera
                style={{ objectFit: 'cover' }} // Umožňuje prispôsobenie veľkosti obrázka
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" // Optimalizácia pre rôzne veľkosti obrazoviek
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';

export default function Home() {
  interface Category {
    id: string;
    title: string;
    regionCode: string;
  }

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get('/api/youtube/video/categories', {
          params: {
            regionCode: 'US',
          },
        });
        setCategories(response.data);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1>YouTube Video Categories</h1>
      <ul>
        {categories.map((category) => (
          <li key={category.id}>
            <h2>{category.title}</h2>
            <p>ID: {category.id}</p>
            <p>Region: {category.regionCode}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

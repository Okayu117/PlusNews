'use client'

import { useState, useEffect } from 'react';
import Article from './components/Article';
import axios from 'axios';

interface ArticleType {
  source: { name: string };
  description: string;
  publishedAt: string;
  urlToImage: string;
  url: string;
}

export default function Home() {

  const [articles, setArticles] = useState<ArticleType[]>([]);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const getNews = async () => {
    setRefreshing(true);
    const apiKey = process.env.NEXT_PUBLIC_NEW_API_KEY;
    const url = `https://newsapi.org/v2/everything?q=keyword&apiKey=${apiKey}`;
    try {
      const result = await axios.get(url);
      setArticles(result.data.articles);
      setRefreshing(false);
      console.log(result.data.articles);
    } catch (e) {
      setRefreshing(false);
      console.error(e);
    }
  };

  useEffect(() => {
    getNews();
  }, []);


  return (
    <>
      <div className="container mx-auto px-4">
      {refreshing ? (
        <p>Loading...</p>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {articles.map((article) => (
            <Article key={article.url} article={article} />
          ))}
        </div>
      )}
    </div>
    </>
  );
}

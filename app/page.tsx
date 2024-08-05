'use client'
import React, { useState, useEffect, useRef } from 'react';
import { Flex, Stack, Box, Divider, Spinner } from '@chakra-ui/react';
import Article from './components/Article';
import axios from 'axios';

export interface ArticleType {
  id: string;
  source: { name: string };
  description: string;
  publishedAt: string;
  urlToImage: string;
  url: string;
  title: string;
  sentimentScore?: number;
  sentimentMagnitude?: number;
}

const Home: React.FC = () => {
  const [articles, setArticles] = useState<ArticleType[]>([]);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const observerRef = useRef<HTMLDivElement | null>(null);

  console.log('NEXT_PUBLIC_NEWS_API_KEY:', process.env.NEXT_PUBLIC_NEWS_API_KEY);

  const analyzeSentiment = async (text: string) => {
    try {
      const response = await fetch('/api/analyzeSentiment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text })
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      console.log('Sentiment analysis result:', data);
      return { score: data.score, magnitude: data.magnitude };
    } catch (error) {
      console.error('Error analyzing sentiment:', error);
      return { score: 0, magnitude: 0 };
    }
  };

  const getNews = async (pageNum: number) => {
    setRefreshing(true);
    const apiKey = process.env.NEXT_PUBLIC_NEWS_API_KEY;
    if (!apiKey) {
      console.error("API key is not set.");
      setRefreshing(false);
      return;
    }

    const url = `https://newsapi.org/v2/top-headlines?pageSize=10&page=${pageNum}&apiKey=${apiKey}&country=jp`;

    try {
      const result = await axios.get(url);
      const articlesWithSentiment = await Promise.all(result.data.articles.map(async (article: ArticleType) => {
        const { description, title } = article;
        const combinedText = `${title} ${description}`;
        const { score, magnitude } = await analyzeSentiment(combinedText);
        console.log('Article:', article.title, 'Sentiment Score:', score, 'Magnitude:', magnitude);
        return { ...article, sentimentScore: score, sentimentMagnitude: magnitude };
      }));

      setArticles((prevArticles) => pageNum === 1 ? articlesWithSentiment : [...prevArticles, ...articlesWithSentiment]);

      setRefreshing(false);
    } catch (e) {
      setRefreshing(false);
      console.error("Error fetching news:", e);
    }
  };

  useEffect(() => {
    getNews(1);
  }, []);

  useEffect(() => {
    if (page !== 1) {
      getNews(page);
    }
  }, [page]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setPage((prevPage) => prevPage + 1);
        }
      },
      { threshold: 1.0 }
    );
    if (observerRef.current) {
      observer.observe(observerRef.current);
    }
    return () => {
      if (observerRef.current) {
        observer.unobserve(observerRef.current);
      }
    };
  }, []);

  return (
    <Stack w='100%' alignItems='center'>
      <Box p='40px' w='90%'>
        <Flex flexDirection='column' alignItems='center' gap='5px'>
          {articles.length === 0 && !refreshing && <p>No articles found.</p>}
          {articles.map((article, index) => (
            <React.Fragment key={article.url}>
              <Article article={article} />
              {index < articles.length - 1 && <Divider borderColor='gray.700' />}
            </React.Fragment>
          ))}
          {refreshing && <Spinner />}
          <div ref={observerRef}></div>
        </Flex>
      </Box>
    </Stack>
  );
};

export default Home;

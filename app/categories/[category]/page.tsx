import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import Article from '../../components/Article';
import axios from 'axios';
import { Box, Divider, Flex, Stack, Spinner } from '@chakra-ui/react';

interface ArticleType {
  source: { name: string };
  description: string;
  publishedAt: string;
  urlToImage: string;
  url: string;
}

const CategoryPage: React.FC = () => {
  const params = useParams();
  const category = params.category || 'ALL';
  const [articles, setArticles] = useState<ArticleType[]>([]);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const observerRef = useRef<HTMLDivElement | null>(null);

  const getNews = async (pageNum: number) => {
    setRefreshing(true);
    const apiKey = process.env.NEXT_PUBLIC_NEW_API_KEY;
    let url = `https://newsapi.org/v2/everything?pageSize=10&page=${pageNum}&apiKey=${apiKey}`;
    if (category && category !== 'ALL') {
      url += `&q=${category}`;
    }
    console.log("Fetching news with URL:", url); // デバッグ用
    try {
      const result = await axios.get(url);
      console.log("Fetched articles:", result.data.articles); // デバッグ用
      setArticles((prevArticles) => [...prevArticles, ...result.data.articles]);
      setRefreshing(false);
    } catch (e) {
      setRefreshing(false);
      console.error(e);
    }
  };

  useEffect(() => {
    setArticles([]); // カテゴリ変更時に記事リストをリセット
    setPage(1); // ページ番号をリセット
    getNews(1);
  }, [category]);

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
    <Stack w='100%'>
      <Flex flexDirection='column' alignItems='center'>
        <Box p='40px' w='90%'>
          <Flex flexDirection='column' alignItems='center' gap='5px'>
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
      </Flex>
    </Stack>
  );
};

export default CategoryPage;

'use client'
import React, { useState, useEffect, useRef } from 'react';
import { Flex, Box, Divider, Spinner, Text, useBreakpointValue, useMediaQuery } from '@chakra-ui/react';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import Article from './components/layouts/top/Article';
import axios from 'axios';
import useAuth  from './hooks/useAuth';
import Link from 'next/link';

export interface ArticleType {
  title: string;
  source: string;
  publishedAt: string;
  url: string;
  sentimentScore?: number;
  sentimentMagnitude?: number;
}

const Home: React.FC = () => {
  const { user } = useAuth(); // useAuthフックからユーザー情報を取得
  const [articles, setArticles] = useState<ArticleType[]>([]);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const observerRef = useRef<HTMLDivElement | null>(null);
  const endRef = useRef<HTMLDivElement | null>(null);

  const isMobile = useBreakpointValue({ base: true, md: false });
  const [isCustomBreakpoint] = useMediaQuery('(min-width: 600px) and (max-width: 767px)');


  useEffect(() => {
    const fetchProfileImage = async () => {
      if (user) { // ユーザーがログインしている場合
        const db = getFirestore();
        const userId = user.uid; // 実際のユーザーIDをここに設定してください
        const userRef = doc(db, "users", userId);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
        }
      }
    };

    fetchProfileImage();
  }, [user]);


  const analyzeSentiment = async (text: string) => {
    try {
      const response = await fetch('/api/analyzeSentiment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      return { score: data.score, magnitude: data.magnitude };
    } catch (error) {
      console.error('Error analyzing sentiment:', error);
      return { score: 0, magnitude: 0 };
    }
  };


  const fetchArticles = async (pageNum: number) => {
    if (refreshing) return;
    setRefreshing(true);
    try {
      const result = await axios.get(`/api/fetchNews?page=${pageNum}`);
      console.log('Fetched articles from API:', result.data.length); // APIから取得した記事の数をログ出力

      if (result.data.length === 0) {
        setHasMore(false); // APIから新しい記事が取得されなかった場合、hasMoreをfalseに設定
        setRefreshing(false);
        return;
      }

      const formattedArticles = await Promise.all(
        result.data.map(async (article: any) => {
          const combinedText = `${article.title} ${article.description || ''}`;
          const sentiment = await analyzeSentiment(combinedText);

          console.log(`Article: "${article.title}" - Sentiment Score: ${sentiment.score}, Magnitude: ${sentiment.magnitude}`);

          return {
            title: article.title,
            source: article.source ? article.source : 'Unknown Source',
            publishedAt: article.pubDate,
            url: article.link,
            sentimentScore: sentiment.score,
            sentimentMagnitude: sentiment.magnitude,
            description: article.description || '', // descriptionをフィルタリングで使うため追加
          };
        })
      );

      const forbiddenWords = ['死', '悲', '惜', '殺', '没', '故', '戦', '脅', '滅', '不','罪','争', '亡', '墓', '処分','遺体', 'イスラエル', 'ウクライナ', 'ハマス', 'ロシア'];

      // スコアが0以上で、特定の禁止ワードを含まない記事のみフィルタリング
      const filteredArticles = formattedArticles.filter(article => {
        const isValidScore = article.sentimentScore !== undefined && article.sentimentScore >= -0.1;
        const doesNotContainForbiddenWords = !forbiddenWords.some(word => article.title.includes(word) || article.description.includes(word));
        return isValidScore && doesNotContainForbiddenWords;
      });

      // 重複記事をURLで排除（1回目）
      const uniqueArticles = filteredArticles.filter((article, index, self) =>
        index === self.findIndex((a) => a.url === article.url)
      );

      setArticles((prevArticles) => {
        // 前の状態と新しい記事の両方から、スコアが0以上の記事だけを残す
        const filteredPrevArticles = prevArticles.filter(article => article.sentimentScore !== undefined && article.sentimentScore >= -0.1);
        const combinedArticles = [...filteredPrevArticles, ...uniqueArticles];

        // 再度スコアが0以上かつ重複を排除（2回目のフィルタリング）
        let finalFilteredArticles = combinedArticles.filter((article, index, self) => {
          const isValidScore = article.sentimentScore !== undefined && article.sentimentScore >= 0;
          const isUnique = index === self.findIndex((a) => a.url === article.url);
          return isValidScore && isUnique;
        });


        if (!user && finalFilteredArticles.length >= 5) {
          setHasMore(false); // ログインしていない場合、5つの記事を取得したらそれ以上取得しない
          return finalFilteredArticles.slice(0, 5); // 5つの記事に制限
        }

        if (user && finalFilteredArticles.length === prevArticles.length) {
          // 既に表示された記事数と新しい記事数が同じであれば、これ以上記事がないと判断
          setHasMore(false);
        }

        return finalFilteredArticles;
      });

      setRefreshing(false);
    } catch (e) {
      setRefreshing(false);
      console.error("Error fetching RSS feed:", e);
    }
  };

  useEffect(() => {
    // 初回レンダリング時にfetchArticlesを実行
    fetchArticles(1);//初期ページ1で記事を取得
  }, []);


  useEffect(() => {
    if (hasMore) {
      fetchArticles(page);
    }
  }, [page, hasMore]);


  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prevPage) => prevPage + 1);
        } else if (entries[0].isIntersecting && !hasMore && !refreshing) {
          // スクロールして最後に到達した時点でメッセージ表示
          const endElement = endRef.current;
          if (endElement) {
            endElement.scrollIntoView({ behavior: 'smooth' });
          }
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
  }, [hasMore, refreshing]);


  return (
    <>
      <Box alignItems='center' pt={isCustomBreakpoint ? '260px' : '210px'} maxWidth={isMobile ? 'none' :'900px' } m='auto'>
        <Flex p='40px' justifyContent='center'>
          <Flex flexDirection='column' alignItems='center' gap='5px' w='100%'>
            {articles.map((article, index) => (
              <React.Fragment key={`${article.url}-${index}`}>
                <Article article={article} />
                {index < articles.length - 1 && <Divider border='1px solid #a9a9a9' />}
              </React.Fragment>
            ))}
            {refreshing && <Spinner />}
            {!hasMore && !refreshing && (
              <Box>
                {user ? <Text mt="20px" fontSize="sm" color="gray.500">"次の記事をお楽しみに！"</Text> : (
                  <>
                    <Link href="/pages/signin" passHref>
                      <Text display='inline' color="blue.500">
                        サインイン
                      </Text>
                    </Link>
                    <Text as="span" display='inline'>して続きを見る</Text>
                  </>
                )}
              </Box>
            )}
            <div ref={observerRef}></div>
          </Flex>
        </Flex>
      </Box>
    </>

  );
};

export default Home;

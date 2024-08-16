'use client'
import React, { useState, useEffect, useRef } from 'react';
import { Flex, Stack, Box, Divider, Spinner, Text, Img } from '@chakra-ui/react';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import Article from './components/layouts/top/Article';
import axios from 'axios';
import useAuth  from './hooks/useAuth';

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
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [imagePosition, setImagePosition] = useState<string>('center');

  useEffect(() => {
    const fetchProfileImage = async () => {
      if (user) { // ユーザーがログインしている場合
        const db = getFirestore();
        const userId = user.uid; // 実際のユーザーIDをここに設定してください
        const userRef = doc(db, "users", userId);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          setProfileImage(userData?.profileImage || null);
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

      const forbiddenWords = ['死', '悲', '惜', '殺', '没', '故', '戦', '脅', '滅', '不', '争', '亡', '墓', '処分', 'イスラエル', 'ウクライナ', 'ハマス', 'ロシア'];

      // スコアが0以上で、特定の禁止ワードを含まない記事のみフィルタリング
      const filteredArticles = formattedArticles.filter(article => {
        const isValidScore = article.sentimentScore !== undefined && article.sentimentScore >= 0;
        const doesNotContainForbiddenWords = !forbiddenWords.some(word => article.title.includes(word) || article.description.includes(word));

        console.log(`Filtering article: "${article.title}" with score: ${article.sentimentScore}, isValid: ${isValidScore}, contains forbidden words: ${!doesNotContainForbiddenWords}`);

        return isValidScore && doesNotContainForbiddenWords;
      });

      console.log('Filtered articles count:', filteredArticles.length); // フィルタリングされた記事の数をログ出力

      // 重複記事をURLで排除（1回目）
      const uniqueArticles = filteredArticles.filter((article, index, self) =>
        index === self.findIndex((a) => a.url === article.url)
      );

      setArticles((prevArticles) => {
        // 前の状態と新しい記事の両方から、スコアが0以上の記事だけを残す
        const filteredPrevArticles = prevArticles.filter(article => article.sentimentScore !== undefined && article.sentimentScore >= 0);
        const combinedArticles = [...filteredPrevArticles, ...uniqueArticles];

        // 再度スコアが0以上かつ重複を排除（2回目のフィルタリング）
        const finalFilteredArticles = combinedArticles.filter((article, index, self) => {
          const isValidScore = article.sentimentScore !== undefined && article.sentimentScore >= 0;
          const isUnique = index === self.findIndex((a) => a.url === article.url);
          return isValidScore && isUnique;
        });

        console.log('Final filtered articles count:', finalFilteredArticles.length); // 最終的な記事の数をログ出力


        return finalFilteredArticles;
      });

      setRefreshing(false);
    } catch (e) {
      setRefreshing(false);
      console.error("Error fetching RSS feed:", e);
    }
  };


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

  useEffect(() => {
    const fetchProfileImage = async () => {
      if (user) {
        const db = getFirestore();
        const userRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          setProfileImage(userData?.profileImage || null);
          setImagePosition(userData?.imagePosition || 'center'); // 画像ポジションを設定
        }
      }
    };

    fetchProfileImage();
  }, [user]);



  return (
    <Stack w='100%' mt='30px' alignItems='center'>
      <Box w='80%' h='25vh'>
        <Img
          w='100%' h='100%' bg='gray' objectFit='cover'
          src={profileImage || "/img_logo.png"}
          objectPosition={imagePosition}
        />
      </Box>
      <Box p='40px' w='90%'>
        <Flex flexDirection='column' alignItems='center' gap='5px'>
          {articles.length === 0 && !refreshing && <p>No articles found.</p>}
          {articles.map((article, index) => (
            <React.Fragment key={`${article.url}-${index}`}>
              <Article article={article} />
              {index < articles.length - 1 && <Divider borderColor='gray.700' />}
            </React.Fragment>
          ))}
          {refreshing && <Spinner />}
          {!hasMore && !refreshing && (
            <Text mt="20px" fontSize="lg" color="gray.500">
              次の記事をお楽しみに！
            </Text>
          )}
          <div ref={observerRef}></div>
        </Flex>
      </Box>
    </Stack>
  );
};

export default Home;

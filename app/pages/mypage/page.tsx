'use client'
import React, { useState, useEffect, useRef } from 'react';
import { Flex, Stack, Box, Divider, Spinner, Button, FormControl, Input, Text, useToast } from '@chakra-ui/react';
import Article from '../../components/Article';
import { collection, query, getDocs, addDoc, orderBy, limit, startAfter } from 'firebase/firestore';
import { db } from '../../../utils/firebase/firebaseConfg';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import useAuth from '../../hooks/useAuth';

interface ArticleType {
  id: string;
  source: { name: string };
  description: string;
  publishedAt: string;
  urlToImage: string;
  url: string;
  title: string;
}

interface CommentType {
  id?: string;
  articleId: string;
  text: string;
  userId: string;
  userName: string;
}

const validationSchema = z.object({
  text: z.string().min(1, 'コメントを入力してください').max(200, 'コメントは200文字以内で入力してください'),
});

const Home: React.FC = () => {
  const { user, loading } = useAuth();
  const [articles, setArticles] = useState<ArticleType[]>([]);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [lastVisible, setLastVisible] = useState<any>(null);
  const observerRef = useRef<HTMLDivElement | null>(null);
  const toast = useToast();

  const getNews = async (loadMore = false) => {
    setRefreshing(true);
    try {
      const articlesCollection = collection(db, 'articles');
      let articlesQuery = query(articlesCollection, orderBy('publishedAt', 'desc'), limit(10));
      if (loadMore && lastVisible) {
        articlesQuery = query(articlesCollection, orderBy('publishedAt', 'desc'), startAfter(lastVisible), limit(10));
      }
      const articleDocs = await getDocs(articlesQuery);
      // デバッグ: Firestoreから取得したデータの確認
      console.log('Fetched documents:', articleDocs.docs.map(doc => ({ id: doc.id, ...doc.data() })));


      // デバッグ: Firestoreから取得したデータの確認
      articleDocs.forEach((doc) => {
        console.log('Document ID:', doc.id);
        console.log('Document Data:', doc.data());
      });

      const newArticles = articleDocs.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as ArticleType[];

      // 記事データのコンソール出力
      console.log('Fetched Articles:', newArticles);

      setArticles((prevArticles) => loadMore ? [...prevArticles, ...newArticles] : newArticles);
      setLastVisible(articleDocs.docs[articleDocs.docs.length - 1]);

      setRefreshing(false);
    } catch (e) {
      setRefreshing(false);
      console.error('Error fetching news:', e);
    }
  };

  useEffect(() => {
    if (!loading && user) {
      getNews();
    }
  }, [loading, user]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          getNews(true);
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

  const CommentForm: React.FC<{ articleId: string }> = ({ articleId }) => {
    const { register, handleSubmit, formState: { errors }, reset } = useForm<CommentType>({
      mode: 'onChange',
      resolver: zodResolver(validationSchema),
    });

    const onSubmit = async (data: CommentType) => {
      try {
        await addDoc(collection(db, 'articles', articleId, 'comments'), {
          text: data.text,
          articleId: articleId,
          userId: user.uid,
          userName: user.displayName || 'Anonymous',
          createdAt: new Date(),
        });
        reset();
        toast({
          title: 'コメントを追加しました',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      } catch (e) {
        console.error('Error adding comment:', e);
        toast({
          title: 'コメントの追加に失敗しました',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    };

    return (
      <form onSubmit={handleSubmit(onSubmit)}>
        <FormControl isInvalid={!!errors.text}>
          <Input
            variant='filled'
            mt='5px'
            mb='5px'
            borderRadius='5px'
            placeholder='コメントを入力'
            {...register('text')}
          />
          {errors.text && <Text color='red'>{errors.text.message}</Text>}
          <Button type='submit' colorScheme='teal'>コメントを追加</Button>
        </FormControl>
      </form>
    );
  };

  const CommentList: React.FC<{ articleId: string }> = ({ articleId }) => {
    const [comments, setComments] = useState<CommentType[]>([]);

    useEffect(() => {
      const fetchComments = async () => {
        const commentsCollection = collection(db, 'articles', articleId, 'comments');
        const commentsSnapshot = await getDocs(query(commentsCollection, orderBy('createdAt', 'asc')));
        const commentsData = commentsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as CommentType[];
        setComments(commentsData);
      };
      fetchComments();
    }, [articleId]);

    return (
      <Box>
        {comments.map((comment) => (
          <Box key={comment.id} p='2' bg='gray.100' my='2' borderRadius='md'>
            <Text fontWeight='bold'>{comment.userName}</Text>
            <Text>{comment.text}</Text>
          </Box>
        ))}
      </Box>
    );
  };

  if (loading) {
    return (
      <Flex justifyContent='center' alignItems='center' height='100vh'>
        <Spinner size='xl' />
      </Flex>
    );
  }

  return (
    <Stack w='100%' alignItems='center'>
      <Box p='40px' w='90%'>
        <Flex flexDirection='column' alignItems='center' gap='5px'>
          {articles.length === 0 && !refreshing && <p>No articles found.</p>}
          {articles.map((article, index) => (
            <React.Fragment key={article.id}>
              <Article article={article} />
              <CommentForm articleId={article.id} />
              <CommentList articleId={article.id} />
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

'use client'
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { doc, getDoc, collection, query, getDocs, orderBy, addDoc } from 'firebase/firestore';
import { db } from '@/utils/firebase/firebaseConfg';
import { Box, Text, Spinner, Flex, FormControl, Input, Button, useToast } from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import useAuth from '../../../../hooks/useAuth';

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

const ArticleComments = () => {
  const router = useRouter();
  const { id } = router.query;
  const { user, loading } = useAuth();
  const [article, setArticle] = useState<any>(null);
  const [comments, setComments] = useState<CommentType[]>([]);
  const toast = useToast();

  const { register, handleSubmit, formState: { errors }, reset } = useForm<CommentType>({
    mode: 'onChange',
    resolver: zodResolver(validationSchema),
  });

  useEffect(() => {
    if (id) {
      const fetchArticle = async () => {
        const docRef = doc(db, 'articles', id as string);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setArticle(docSnap.data());
        } else {
          console.error('No such document!');
        }
      };

      const fetchComments = async () => {
        const commentsCollection = collection(db, 'articles', id as string, 'comments');
        const commentsSnapshot = await getDocs(query(commentsCollection, orderBy('createdAt', 'asc')));
        const commentsData = commentsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as CommentType[];
        setComments(commentsData);
      };

      fetchArticle();
      fetchComments();
    }
  }, [id]);

  const onSubmit = async (data: CommentType) => {
    try {
      await addDoc(collection(db, 'articles', id as string, 'comments'), {
        text: data.text,
        articleId: id as string,
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
      // Fetch comments again to update the list
      const commentsCollection = collection(db, 'articles', id as string, 'comments');
      const commentsSnapshot = await getDocs(query(commentsCollection, orderBy('createdAt', 'asc')));
      const commentsData = commentsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as CommentType[];
      setComments(commentsData);
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

  if (loading) {
    return (
      <Flex justifyContent='center' alignItems='center' height='100vh'>
        <Spinner size='xl' />
      </Flex>
    );
  }

  if (!article) {
    return <Text>記事が見つかりませんでした。</Text>;
  }

  const { title, description, source, publishedAt, urlToImage } = article;
  const time = new Date(publishedAt).toLocaleDateString();

  return (
    <Box p="40px">
      {urlToImage && <img src={urlToImage} alt={title} />}
      <Text fontSize="2xl" mt="20px">{title}</Text>
      <Text mt="10px">{description}</Text>
      <Text mt="10px" fontWeight="bold">{source?.name ? source.name.toUpperCase() : 'Unknown Source'}</Text>
      <Text mt="10px">{time}</Text>

      <Box mt="20px">
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
      </Box>

      <Box mt="20px">
        {comments.map((comment) => (
          <Box key={comment.id} p='2' bg='gray.100' my='2' borderRadius='md'>
            <Text fontWeight='bold'>{comment.userName}</Text>
            <Text>{comment.text}</Text>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default ArticleComments;

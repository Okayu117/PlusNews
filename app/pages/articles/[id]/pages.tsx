'use client'
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/utils/firebase/firebaseConfg';
import { Box, Text, Spinner, Flex } from '@chakra-ui/react';

const ArticleDetail = () => {
  const router = useRouter();
  const { id } = router.query;
  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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
        setLoading(false);
      };

      fetchArticle();
    }
  }, [id]);

  if (loading) {
    return (
      <Flex justifyContent="center" alignItems="center" height="100vh">
        <Spinner size="xl" />
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
    </Box>
  );
};

export default ArticleDetail;

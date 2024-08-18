import React, { useState, useEffect } from 'react';
import { Box, Flex, Text, Button, useToast } from '@chakra-ui/react';
import { HiStar } from "react-icons/hi";
import { ArticleType } from '../../../page';
import { db } from '../../../../utils/firebase/firebaseConfg';
import { doc, updateDoc, arrayUnion, getDoc } from 'firebase/firestore';
import  useAuth  from '../../../hooks/useAuth'; // ユーザー認証を管理するカスタムフックを想定

interface ArticleProps {
  article: ArticleType;
}

const Article: React.FC<ArticleProps> = ({ article }) => {
  const { title, publishedAt, source, url } = article;
  const time = new Date(publishedAt).toLocaleString();
  const [isFavorite, setIsFavorite] = useState<boolean>(false);
  const { user } = useAuth(); // 現在ログインしているユーザーを取得
  const toast = useToast();

  useEffect(() => {
    const checkIfFavorite = async () => {
      if (user) {
        const userRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          const data = userDoc.data();
          if (data.favorites && data.favorites.some((fav: any) => fav.url === url)) {
            setIsFavorite(true);
          }
        }
      }
    };

    checkIfFavorite();
  }, [user, url]);

  const handleAddToFavorites = async () => {
    if (!user) {
      toast({
        title: 'エラー',
        description: 'ログインしてください。',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    try {
      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        const data = userDoc.data();
        const favorites = data.favorites || [];

        if (favorites.length >= 5) {
          toast({
            title: 'エラー',
            description: 'お気に入りは5つまでしか保存できません。',
            status: 'error',
            duration: 5000,
            isClosable: true,
          });
          return;
        }

        await updateDoc(userRef, {
          favorites: arrayUnion({ title, source, url, publishedAt })
        });
        setIsFavorite(true);
      }
    } catch (error) {
      console.error('Error adding to favorites: ', error);
      toast({
        title: 'エラー',
        description: 'お気に入りの追加中にエラーが発生しました。',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <>
    <Flex w="100%" alignItems='center' justifyContent='space-between'>
      <Flex p='15px' gap='15px' flexDirection="column">
        <Box>
          <a href={url} target="_blank" rel="noopener noreferrer">
            <Text fontWeight="bold">{title}</Text>
          </a>
          <Text>{source?.toUpperCase() || 'Unknown Source'}</Text>
          <Text>{time}</Text>
        </Box>
      </Flex>
      {/* お気に入りボタン */}
      <Button
        onClick={handleAddToFavorites}
        leftIcon={<HiStar />}
        colorScheme={isFavorite ? "yellow" : "gray"}
        isDisabled={isFavorite}
        mr='15px'
      >
        {isFavorite ? "保存済み" : "お気に入りに保存"}
      </Button>
    </Flex>
  </>
  );
};

export default Article;

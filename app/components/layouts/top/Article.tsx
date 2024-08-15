import React, { useState, useEffect } from 'react';
import { Box, Flex, Text, Button } from '@chakra-ui/react';
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
      alert('ログインしてください。');
      return;
    }

    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        favorites: arrayUnion({ title, source, url, publishedAt })
      });
      setIsFavorite(true);
    } catch (error) {
      console.error('Error adding to favorites: ', error);
    }
  };

  return (
    <Box w="100%">
      <Flex
        p='15px'
        gap='15px'
        flexDirection="column"
      >
        <Box>
          <a href={url} target="_blank" rel="noopener noreferrer">
            <Text fontWeight="bold">{title}</Text>
          </a>
          <Text>{source?.toUpperCase() || 'Unknown Source'}</Text>
          <Text>{time}</Text>
        </Box>

        {/* お気に入りボタン */}
        <Flex mt="10px" alignItems="center">
          <Button
            onClick={handleAddToFavorites}
            leftIcon={<HiStar />}
            colorScheme={isFavorite ? "yellow" : "gray"}
            isDisabled={isFavorite}
          >
            {isFavorite ? "保存済み" : "お気に入りに保存"}
          </Button>
        </Flex>
      </Flex>
    </Box>
  );
};

export default Article;

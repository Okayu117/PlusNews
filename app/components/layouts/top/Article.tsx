import React, { useState, useEffect } from 'react';
import { Box, Flex, Text, Button, useToast, Link, useBreakpointValue } from '@chakra-ui/react';
import { ArticleType } from '../../../page';
import { db } from '../../../../utils/firebase/firebaseConfg';
import { doc, updateDoc, arrayUnion, getDoc } from 'firebase/firestore';
import  useAuth  from '../../../hooks/useAuth'; // ユーザー認証を管理するカスタムフックを想定
import { Icon } from '@chakra-ui/react'
import { MdStar } from 'react-icons/md'


interface ArticleProps {
  article: ArticleType;
}

const Article: React.FC<ArticleProps> = ({ article }) => {
  const { title, publishedAt, source, url } = article;
  const time = new Date(publishedAt).toLocaleString();
  const [isFavorite, setIsFavorite] = useState<boolean>(false);
  const { user } = useAuth(); // 現在ログインしているユーザーを取得
  const toast = useToast();

  const isMobile = useBreakpointValue({ base: true, md: false });


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
      <Flex p='15px' pl={isMobile ? '0' : '15px'} gap='15px' flexDirection="column">
        <Box>
          <Flex flexWrap='wrap' alignItems='center'>
            <Link href={url} target="_blank" rel="noopener noreferrer">
              <Text fontWeight="bold" mr='10px' fontSize={isMobile ? 'sm' : 'md'}>{title}</Text>
            </Link>
            <Text mt={isMobile ? '5px' : '0'} fontSize={isMobile ? 'xs' : 'sm'}>＜{source?.toUpperCase() || 'Unknown Source'}＞</Text>
          </Flex>
          <Text mt='5px' fontSize={isMobile ? 'xs' : 'sm'}>{time}</Text>
        </Box>
      </Flex>
      {/* お気に入りボタン */}
      <Button w='30px' h='30px' minWidth='0' textAlign='center'
        onClick={handleAddToFavorites}
        colorScheme={isFavorite ? "yellow" : "gray"}
        isDisabled={isFavorite}
        mr={isMobile ? '0' : '15px'}
        justifyContent="center"
        alignItems="center"
      >
        <Icon as={MdStar} boxSize={4} />
      </Button>
    </Flex>
  </>
  );
};

export default Article;

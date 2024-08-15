'use client'
import React, { useState, useEffect } from 'react';
import { Flex, Stack, Box, Button, Input, Text, IconButton, useToast, Spinner } from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import { collection, getDoc, doc, updateDoc, arrayRemove } from 'firebase/firestore';
import { db, storage } from '../../../utils/firebase/firebaseConfg';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import useAuth from '../../hooks/useAuth';

interface ArticleType {
  title: string;
  source: string;
  publishedAt: string;
  url: string;
}

const MyPage: React.FC = () => {
  const { user, loading } = useAuth();
  const [editingName, setEditingName] = useState<boolean>(false);
  const [displayName, setDisplayName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [favorites, setFavorites] = useState<ArticleType[]>([]);
  const [profileImageUrl, setProfileImageUrl] = useState<string>('');
  const toast = useToast();
  const router = useRouter(); // useRouterフックを使用

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || ''); // ユーザー名を初期化
      setEmail(user.email || ''); // メールアドレスを初期化

      const fetchFavorites = async () => {
        const userRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          setFavorites(userDoc.data().favorites || []);
        }
      };
      fetchFavorites();
    }
  }, [user]);

  const handleNameEdit = () => {
    setEditingName(true);
  };

  const handleNameSave = async () => {
    if (user) {
      try {
        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, {
          displayName,
        });
        setEditingName(false);
        toast({
          title: 'ユーザー名を更新しました',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      } catch (e) {
        console.error('Error updating display name:', e);
        toast({
          title: 'ユーザー名の更新に失敗しました',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    }
  };

  const handleNameCancel = () => {
    setDisplayName(user?.displayName || '');
    setEditingName(false);
  };

  const handleRemoveFavorite = async (articleUrl: string) => {
    if (!user) return;

    try {
      const userRef = doc(db, 'users', user.uid);
      const updatedFavorites = favorites.filter(fav => fav.url !== articleUrl); // URLで記事を識別して削除
      await updateDoc(userRef, {
        favorites: updatedFavorites
      });
      setFavorites(updatedFavorites);
      toast({
        title: '記事をお気に入りから削除しました',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (e) {
      console.error('Error removing favorite:', e);
      toast({
        title: 'お気に入りから削除できませんでした',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (user && e.target.files && e.target.files[0]) {
      const image = e.target.files[0];
      const storageRef = ref(storage, `profileImages/${user.uid}`);
      await uploadBytes(storageRef, image);
      const url = await getDownloadURL(storageRef);
      setProfileImageUrl(url);

      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, { profileImage: url });
    }
  };

  const handleBack = () => {
    router.push('/');
  };

  if (loading) {
    return (
      <Flex justifyContent='center' alignItems='center' height='100vh'>
        <Spinner size='xl' />
      </Flex>
    );
  }

  return (
    <Stack w='100%' alignItems='center' p="40px">
      <Box w='100%' maxW="600px">
        {/* 一覧に戻るボタン */}
        <Button mb="20px" colorScheme="teal" onClick={handleBack}>一覧に戻る</Button>

        {/* ユーザー情報 */}
        <Box mb="20px">
          <Text fontSize="2xl" mb="10px">マイページ</Text>


          {/* プロフィール画像 */}
          <Box mb="20px">
            <Text fontSize="lg" fontWeight="bold">プロフィール画像:</Text>
            {profileImageUrl && <img src={profileImageUrl} alt="Profile" style={{ width: '150px', borderRadius: '50%' }} />}
            <Input type="file" onChange={handleImageChange} mt="10px" />
          </Box>

          <Flex alignItems="center">
            <Text fontSize="lg" fontWeight="bold" mr="10px">ユーザー名:</Text>
            {editingName ? (
              <Input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="新しいユーザー名を入力"
              />
            ) : (
              <Text>{displayName}</Text>
            )}
            <Button
              aria-label="Edit name"
              ml="10px"
              onClick={handleNameEdit}
              display={editingName ? 'none' : 'inline-flex'}
            />
          </Flex>
          {editingName && (
            <Flex mt="10px">
              <Button colorScheme="teal" mr="5px" onClick={handleNameSave}>保存</Button>
              <Button onClick={handleNameCancel}>キャンセル</Button>
            </Flex>
          )}
        </Box>

        {/* メールアドレス */}
        <Box mb="20px">
          <Text fontSize="lg" fontWeight="bold">メールアドレス:</Text>
          <Text>{email}</Text>
        </Box>

        {/* パスワード */}
        <Box mb="20px">
          <Text fontSize="lg" fontWeight="bold">パスワード:</Text>
          <Text>********</Text>
        </Box>

        {/* お気に入り記事リスト */}
        <Box>
          <Text fontSize="lg" fontWeight="bold" mb="10px">保存した記事:</Text>
          {favorites.length > 0 ? (
            favorites.map((article) => (
              <Flex key={article.url} alignItems="center" mb="10px">
                <Box flex="1">
                  <a href={article.url} target="_blank" rel="noopener noreferrer">
                    <Text fontWeight="bold">{article.title}</Text>
                  </a>
                  <Text>{article.source}</Text>
                </Box>
                <Button colorScheme="red" onClick={() => handleRemoveFavorite(article.url)}>お気に入り解除</Button>
              </Flex>
            ))
          ) : (
            <Text>保存した記事がありません。</Text>
          )}
        </Box>
      </Box>
    </Stack>
  );
};

export default MyPage;

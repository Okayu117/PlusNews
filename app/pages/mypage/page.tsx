'use client'
import React, { useState, useEffect } from 'react';
import { Flex, Stack, Box, Button, Input, Text, useToast, Spinner, Img, Link, useBreakpointValue } from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import { getDoc, doc, updateDoc } from 'firebase/firestore';
import { db, storage } from '../../../utils/firebase/firebaseConfg';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import useAuth from '../../hooks/useAuth';
import "../../globals.css";
import { Darumadrop_One } from 'next/font/google';
import { updateProfile } from "firebase/auth";


const darumadrop = Darumadrop_One({ subsets: ["latin"], weight: '400' });


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
  const [imagePosition, setImagePosition] = useState<string>('center');

  const isMobile = useBreakpointValue({ base: true, md: false });


  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || ''); // ユーザー名を初期化
      setEmail(user.email || ''); // メールアドレスを初期化
      setProfileImageUrl(user.photoURL || ''); // プロフィール画像のURLを初期化
      const fetchUserData = async () => {
        const userRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setFavorites(userData.favorites || []); // お気に入り記事の設定
          setImagePosition(userData.imagePosition || 'center'); // ポジションを取得して状態に設定

          // FirestoreのprofileImageフィールドが存在する場合にのみプロフィール画像を設定
          if (userData.profileImage) {
            setProfileImageUrl(userData.profileImage);
          } else {
            setProfileImageUrl(''); // プロフィール画像がない場合は空に設定
          }
        }
      };
      fetchUserData(); // ユーザーデータを取得する関数を呼び出し
    }
  }, [user]);


  const handleNameEdit = () => {
    setEditingName(true);
  };


  const handleNameSave = async () => {
    if (user) {
      try {
        // Firebase Authentication の displayName を更新
        await updateProfile(user, {
          displayName: displayName,
        });
        // Firestore の displayName と username を同じ値に更新
        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, {
          displayName: displayName,
          username: displayName, // username にも同じ値を設定
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

  useEffect(() => {
    if (user) {
      const storedImageUrl = localStorage.getItem('profileImageUrl');
      if (storedImageUrl) {
        setProfileImageUrl(storedImageUrl);
      } else {
        fetchProfileImage(user.uid);
      }
    }
  }, [user]);

  const fetchProfileImage = async (userId: string) => {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    if (userDoc.exists()) {
      const profileImage = userDoc.data().profileImage || '';
      setProfileImageUrl(profileImage);
    }
    console.log('Profile image fetched');
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
      localStorage.setItem('profileImageUrl', url);// URLを`localStorage`にも保存（リロード後に復元するため）

    }
  };

  const handleBack = () => {
    window.location.href = '/'; // トップページに直接リダイレクト
  }

  if (loading) {
    return (
      <Flex justifyContent='center' alignItems='center' height='100vh'>
        <Spinner size='xl' />
      </Flex>
    );
  }

  const handlePositionChange = async (newPosition: string) => {
    setImagePosition(newPosition);

    if (user) {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, { imagePosition: newPosition }); // Firestoreにポジションを保存
    }
  };


  return (
    <Stack maxWidth='1100px' m='auto' textAlign='center' justifyContent='center' pt='50px' pl='20px' pr='30px' pb='30px' w='100%'>
      <Text fontSize='30px' m='auto' pt='50px' sx={{ fontFamily: darumadrop.style.fontFamily }}>My Page</Text>
      <Flex pt='40px' justifyContent='space-between' gap='30px' flexDirection={isMobile ? 'column' : 'row'}>
        <Box border='solid 2px silver' borderRadius='30px' p='30px' textAlign='left' w={isMobile ? '100%' : '40%'}>
          {/* ユーザー情報 */}
          <Box>
          {/* プロフィール画像 */}
          <Box>
            <Text fontSize="lg" fontWeight="bold" mr='auto'>TOPの画像：</Text>
            {profileImageUrl ? (
              <Img src={profileImageUrl} alt="Profile" w='150px' h='150px' borderRadius='50%' objectFit='cover' mt='10px' ml='auto' mr='auto'
              objectPosition={imagePosition === 'top' ? 'top' : imagePosition === 'bottom' ? 'bottom' : 'center'}
              />
            ) : (
              <Text mt='10px'>画像が設定されていません</Text>
            )}
            <Button as="label" htmlFor="file-upload" colorScheme="teal" size='sm' mt='10px'>ファイルを選択</Button>
            <Input type="file" id="file-upload" border="none" display="none" onChange={handleImageChange} mt="10px" />
          </Box>
          {/* 画像の配置 */}
          <Text mt='20px' fontSize="lg" fontWeight="bold">画像のポジション：</Text>
          <Flex mt='10px' justifyContent='center'>
            <Button
              colorScheme={imagePosition === 'top' ? 'yellow' : 'gray'}
              onClick={() => handlePositionChange('top')}
            >
              上部
            </Button>
            <Button
              colorScheme={imagePosition === 'center' ? 'yellow' : 'gray'}
              onClick={() => handlePositionChange('center')}
              ml="2"
            >
              中央
            </Button>
            <Button
              colorScheme={imagePosition === 'bottom' ? 'yellow' : 'gray'}
              onClick={() => handlePositionChange('bottom')}
              ml="2"
            >
              下部
            </Button>
          </Flex>
          {/* ユーザー名 */}
          <Box alignItems="center">
            <Text mt='20px' fontSize="lg" fontWeight="bold" mr="10px">ユーザー名：</Text>
            <Flex alignItems='center' mt='10px'>
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
                size="sm"
                colorScheme="teal"
                aria-label="Edit name"
                ml="10px"
                onClick={handleNameEdit}
                display={editingName ? 'none' : 'inline-flex'}
              >変更
              </Button>
            </Flex>
          </Box>
          {/* ユーザー名の保存・キャンセルボタン */}
          {editingName && (
          <Flex mt="10px">
            <Button colorScheme="teal" mr="5px" onClick={handleNameSave} size="sm">OK</Button>
            <Button onClick={handleNameCancel} size="sm">キャンセル</Button>
          </Flex>
          )}
          </Box>
          {/* メールアドレス */}
          <Box mt='20px'>
            <Text fontSize="lg" fontWeight="bold">メールアドレス：</Text>
            <Text>{email}</Text>
          </Box>
          {/* パスワード */}
          <Box mt='20px'>
            <Text fontSize="lg" fontWeight="bold">パスワード：</Text>
            <Text>********</Text>
          </Box>
        </Box>
        {/* お気に入り記事リスト */}
        <Box border='solid 2px silver' borderRadius='30px' p='30px' textAlign='left' w={isMobile ? '100%' : '60%'}>
          <Text fontSize="lg" fontWeight="bold" mb="10px">保存した記事：</Text>
          {favorites.length > 0 ? (
            favorites.map((article) => (
              <Flex key={article.url} alignItems="center" mb="15px" gap='5px'>
                <Box flex="1">
                  <Link href={article.url} target="_blank" rel="noopener noreferrer">
                    <Text fontSize='sm' fontWeight="bold">{article.title}</Text>
                  </Link>
                </Box>
                <Button size='sm' colorScheme="red" onClick={() => handleRemoveFavorite(article.url)}>削除</Button>
              </Flex>
            ))
          ) : (
            <Text>保存した記事がありません。</Text>
          )}
        </Box>
      </Flex>
      <Button mt='30px' ml='auto' mr='auto' variant='ghost' size='lg' w='100px' onClick={handleBack} sx={{ fontFamily: darumadrop.style.fontFamily }}>
        Back
      </Button>
    </Stack>
  );
};

export default MyPage;

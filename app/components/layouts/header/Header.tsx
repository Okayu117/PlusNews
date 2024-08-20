'use client'
import { Box, Button, Flex, Img, Link, Stack, Text } from '@chakra-ui/react'
import React, { useEffect, useState } from 'react'
import SignInButton from './SignInButton'
import SignUpButton from './SignUpButton'
import MyPageButton from './MyPageButton'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '@/utils/firebase/firebaseConfg'
import SignOutButton from './SignOutButton'
import { doc, getDoc, getFirestore } from 'firebase/firestore'
import useAuth from '@/app/hooks/useAuth'
import { usePathname } from 'next/navigation'

const Header = () => {

  const { user, loading } = useAuth();
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [username, setUsername] = useState('')
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [imagePosition, setImagePosition] = useState<string>('center');
  const pathname = usePathname();


  useEffect(() => {
    //監視処理の解除する関数
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsLoggedIn(true)
        setUsername(user.displayName || 'ゲスト')
        } else {
          setIsLoggedIn(false)
          setUsername('')
        }
      })
      return () => unsubscribe()
      }, [])

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

        // サインイン・サインアップページではヘッダーの一部を非表示にする
    const isAuthPage = pathname === '/pages/signin' || pathname === '/pages/signup';



  return (
    <>
      <Stack w='100%' position='fixed' bg='white' zIndex='100'>
        <Box pr='30px' pl='30px' pt='5px'>
          <Box>
            <Flex alignItems='center' gap='20px' justifyContent='flex-end'>
            {isLoggedIn ? (
              <>
                <Box>
                  <Text display='inline'>こんにちは！</Text>
                  <Link href='/pages/mypage'>
                    <Text display='inline'>{username}さん</Text>
                  </Link>
                </Box>
                <Flex gap='5px'>
                  <MyPageButton />
                  <SignOutButton />
                </Flex>
              </>
            ) : (
              <>
                <SignInButton />
                <SignUpButton />
              </>
              )}
            </Flex>
          </Box>
        </Box>
        {!isAuthPage && (
        <Box w='100%' position='relative' height='160px'>
          <Box w='150px' h='150px' ml='auto' mr='auto'>
            <Img
              w='100%' h='100%' bg='gray' objectFit='cover' borderRadius='50%'
              src={profileImage || "/img_logo.png"}
              objectPosition={imagePosition}
            />
          </Box>
          <Img src='/title_img.png' alt='title' w='700px' h='auto' position='absolute' bottom='10%' right='5%' left='0' m='auto' />
        </Box>
        )}
      </Stack>
    </>
  )
}

export default Header

'use client'
import { Box, Flex, Img, Link, SkeletonCircle, Stack, Text, useBreakpointValue, IconButton, Menu, MenuButton, MenuList, MenuItem, useMediaQuery, useToast, Button } from '@chakra-ui/react'
import { HamburgerIcon } from '@chakra-ui/icons'
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
import NextLink from 'next/link'
import { Darumadrop_One } from 'next/font/google';
import { useRouter } from 'next/navigation';


const darumadrop = Darumadrop_One({ subsets: ["latin"], weight: '400' });

const Header = () => {
  const [isMobile] = useMediaQuery('(max-width: 768px)', {
    ssr: false, // SSR中は無効化
    fallback: false, // SSR中のデフォルトは「モバイルではない」
  });

  const { user, loading } = useAuth();
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [username, setUsername] = useState('')
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [imagePosition, setImagePosition] = useState<string>('center');
  const pathname = usePathname();
  const router = useRouter();
  const toast = useToast();



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

      const handleSignOut = async () => {
        try {
          await auth.signOut();
          toast({
            title: 'サインアウトしました',
            status: 'success',
            duration: 5000,
            isClosable: true,
          });
          router.push('/');
          window.location.reload();
        } catch (error) {
          toast({
            title: 'サインアウトに失敗しました',
            status: 'error',
            duration: 5000,
            isClosable: true,
          });
        }
      };

        // サインイン・サインアップページではヘッダーの一部を非表示にする
    const isAuthPage = pathname === '/pages/signin' || pathname === '/pages/signup' || pathname === '/pages/mypage';



  return (
    <>
      <Stack w='100%' position='fixed' bg='white' zIndex='100' gap='0' pl='20px' pr='20px'>
        <Box pr={isMobile ? '10px' : '30px'} pl={isMobile ? '10px' : '30px'} pt='10px' pb='10px'>
        <Flex alignItems='right' justifyContent='flex-end' >
          {isLoggedIn ? (
          <Flex alignItems='center' mr='20px'>
          <Text fontSize={isMobile ? 'md' : 'lg'} sx={{ fontFamily: darumadrop.style.fontFamily }}>こんにちは。</Text>
          <Link href='/pages/mypage'>
            <Text fontSize={isMobile ? 'md' : 'lg'} sx={{ fontFamily: darumadrop.style.fontFamily }}>{username}さん</Text>
          </Link>
        </Flex>) : ( null )}
            {isMobile ? (
              <Menu>
                <MenuButton
                  as={IconButton}
                  aria-label='Options'
                  icon={<HamburgerIcon />}
                  variant='outline'
                />
                <MenuList width='110px' minWidth='none'>
                  {isLoggedIn ? (
                    <Flex flexDirection='column' alignItems='flex-start'>
                      <MenuItem>
                        <MyPageButton />
                      </MenuItem>
                      <MenuItem>
                        <SignOutButton />
                      </MenuItem>
                    </Flex>
                  ) : (
                    <>
                      <MenuItem>
                        <SignInButton />
                      </MenuItem>
                      <MenuItem>
                        <SignUpButton />
                      </MenuItem>
                    </>
                  )}
                </MenuList>
              </Menu>
            ) : (
              <Flex alignItems='center' justifyContent='flex-end'>
                {isLoggedIn ? (
                  <Flex alignItems='center' justifyContent='right' gap='30px'>
                    <Flex gap='5px'>
                      <MyPageButton />
                      <SignOutButton />
                    </Flex>
                  </Flex>
                ) : (
                  <Flex>
                    <SignInButton />
                    <SignUpButton />
                  </Flex>
                )}
              </Flex>
            )}
          </Flex>
        </Box>
        {!isAuthPage && (
        <Box pb={isMobile ? '15px' : '30px'}>
          <Flex
            w='100%'
            justifyContent='center'
            alignItems='center'
            direction={isMobile ? 'column' : 'row'} // 画面幅に応じてレイアウトを変更
            textAlign="center"
          >
            <Img src='/title_img1.png' width={isMobile ? '45%' : '280px'} />
            <Box width={isMobile ? '90px' : '150px'} h={isMobile ? '90px' : '150px'}>
            {loading ? (
              <SkeletonCircle w='100%' h='100%'/>
            ) : (
              <Img
                w='100%' h='100%' objectFit='cover' borderRadius='50%'
                src={profileImage || '/cat.png'} // デフォルトの画像を指定
                objectPosition={imagePosition}
              />
            )}
            </Box>
            <Img src='/title_img2.png' width={isMobile ? '45%' : '280px'} />
          </Flex>
        </Box>

        )}
      </Stack>
    </>
  )
}

export default Header

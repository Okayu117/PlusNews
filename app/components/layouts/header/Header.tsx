'use client'
import { Box, Flex, Img, Link, SkeletonCircle, Stack, Text, IconButton, Menu, MenuButton, MenuList, MenuItem, useToast, Spinner } from '@chakra-ui/react'
import { HamburgerIcon } from '@chakra-ui/icons'
import React, { useEffect, useState } from 'react'
import SignInButton from './SignInButton'
import SignUpButton from './SignUpButton'
import MyPageButton from './MyPageButton'
import { auth } from '@/utils/firebase/firebaseConfg'
import SignOutButton from './SignOutButton'
import { doc, getDoc, getFirestore } from 'firebase/firestore'
import useAuth from '@/app/hooks/useAuth'
import { usePathname } from 'next/navigation'
import { Darumadrop_One } from 'next/font/google';
import { useRouter } from 'next/navigation';



const darumadrop = Darumadrop_One({ subsets: ["latin"], weight: '400' });

const Header = () => {


  const { user, loading } = useAuth();
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [username, setUsername] = useState('')
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [imagePosition, setImagePosition] = useState<string>('center');
  const pathname = usePathname();
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);
  const toast = useToast()
  const [imageLoading, setImageLoading] = useState(false);

  // レスポンシブ対応( useMediaQueryを使用しようとした時にSSRエラーが発生したため、window.matchMediaを使用)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mediaQueryList = window.matchMedia('(max-width: 768px)');
      setIsMobile(mediaQueryList.matches);
      const handleMediaChange = (event: MediaQueryListEvent) => setIsMobile(event.matches);
      mediaQueryList.addEventListener('change', handleMediaChange);
      return () => {
        mediaQueryList.removeEventListener('change', handleMediaChange);
      };
    }
  }, []);



  useEffect(() => {
    if (user) {
      console.log("User:", user);
      setIsLoggedIn(true);
      setUsername(user.displayName || 'ゲスト');
      console.log("username:", username);
    } else {
      setIsLoggedIn(false);
      setUsername('');
      setProfileImage(null);
    }
  }, [user]);


      useEffect(() => {
        const fetchProfileImage = async () => {
          if (user) {
            setImageLoading(true); // ロード開始
            const db = getFirestore();
            console.log("User data from Firestore:", db);
            const userRef = doc(db, "users", user.uid);
            console.log("useRef:", userRef);
            const userDoc = await getDoc(userRef);
            console.log("userDoc:", userDoc);
            if (userDoc.exists()) {
              const userData = userDoc.data();
              console.log("User data from Firestore:", userData);
              setProfileImage(userData?.profileImage || null);
              console.log("profileImage:", profileImage);
              setImagePosition(userData?.imagePosition || 'center'); // 画像ポジションを設定
            }
            setImageLoading(false); // ロード終了
          }
        };

        fetchProfileImage();
      }, [user]);


      const handleMyPage = () => {
        router.push('/pages/mypage');
      }

      const handleSignIn = () => {
        router.push('/pages/signin');
      }

      const handleSignUp = () => {
        router.push('/pages/signup');
      }

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
          window.location.reload(); // ページをリロード
        } catch (error) {
          toast({
            title: 'サインアウトに失敗しました',
            status: 'error',
            duration: 5000,
            isClosable: true,
          });
        }
      };

      if (loading) {
        return (
          <Flex justifyContent='center' alignItems='center' height='100vh'>
            <Spinner size='md' />
          </Flex>
        );
      }

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
                      <MenuItem
                        fontSize="lg"
                        sx={{ fontFamily: darumadrop.style.fontFamily }}
                        pl='15px'
                        onClick={handleMyPage}
                        justifyContent='center'
                      >
                        My Page
                      </MenuItem>
                      <MenuItem
                        fontSize="lg"
                        sx={{ fontFamily: darumadrop.style.fontFamily }}
                        pl='15px'
                        onClick={handleSignOut}
                        justifyContent='center'
                      >
                        Sign Out
                      </MenuItem>
                    </Flex>
                  ) : (
                    <>
                      <MenuItem
                        fontSize="lg"
                        sx={{ fontFamily: darumadrop.style.fontFamily }}
                        pl='15px'
                        onClick={handleSignIn}
                        justifyContent='center'
                      >
                        Sign In
                      </MenuItem>
                      <MenuItem
                        fontSize="lg"
                        sx={{ fontFamily: darumadrop.style.fontFamily }}
                        pl='15px'
                        onClick={handleSignUp}
                        justifyContent='center'
                      >
                        Sign Up
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
        <Box pb={isMobile ? '10px' : '30px'}>
          <Flex
            w='100%'
            justifyContent='center'
            alignItems='center'
            direction={isMobile ? 'column' : 'row'} // 画面幅に応じてレイアウトを変更
            textAlign="center"
          >
            <Img src='/title_img1.png' width={isMobile ? '45%' : '280px'} />
            <Box width={isMobile ? '90px' : '150px'} h={isMobile ? '90px' : '150px'}>
            {imageLoading ? (
                  <SkeletonCircle w='100%' h='100%' />
                ) : (
                  <Img
                    w='100%'
                    h='100%'
                    objectFit='cover'
                    borderRadius='50%'
                    src={profileImage || '/cat.png'}
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

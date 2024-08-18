'use client'
import { Box, Button, Flex, Img, Link, Stack, Text } from '@chakra-ui/react'
import React, { useEffect, useState } from 'react'
import SignInButton from './SignInButton'
import SignUpButton from './SignUpButton'
import MyPageButton from './MyPageButton'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '@/utils/firebase/firebaseConfg'
import SignOutButton from './SignOutButton'

const Header = () => {

  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [username, setUsername] = useState('')



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


  return (
    <>
      <Stack w='100%'>
        <Box bg='white' pr='30px' pl='30px' pt='10px' pb='10px'>
          <Box>
            {/* <Link  href='/' maxWidth='200px'>
              <Img src="/img_logo.png" alt="logo" />
            </Link> */}
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
      </Stack>
    </>
  )
}

export default Header

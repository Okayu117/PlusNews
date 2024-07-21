'use client'
import { Box, Button, Flex, Img, Link, Stack } from '@chakra-ui/react'
import React, { useEffect, useState } from 'react'
import SignInButton from './SignInButton'
import SignUpButton from './SignUpButton'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '@/utils/firebase/firebaseConfg'
import SignOutButton from './SignOutButton'

const Header = () => {

  const [isLoggedIn, setIsLoggedIn] = useState(false)


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsLoggedIn(!!user)
    })

    return () => unsubscribe()
  }, [])


  return (
    <>
      <Stack w='100%'>
        <Box bg='white' pr='30px' pl='30px' pt='10px' pb='10px' backgroundColor='rgba(102,205,170,0.7)' boxShadow='0px 1px 20px 1px rgba(0,0,0,0.5)'>
          <Flex alignItems='center' justifyContent='space-between'>
            <Link  href='/' maxWidth='200px'>
              <Img src="/img_logo.png" alt="logo" />
            </Link>
            <Box>
            {isLoggedIn ? (
              <>
                <Link href='/pages/mypage'>
                  <Button>Myページ</Button>
                </Link>
                <SignOutButton />
              </>
            ) : (
              <>
                <SignInButton />
                <SignUpButton />
              </>
              )}
            </Box>
          </Flex>
        </Box>
      </Stack>
    </>
  )
}

export default Header

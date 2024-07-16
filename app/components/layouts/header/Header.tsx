import { Box, Button, Center, Flex, Img, Stack, Text } from '@chakra-ui/react'
import React from 'react'
import SignInButton from './SignInButton'
import SignUpButton from './SignUpButton'

const Header = () => {
  return (
    <>
      <Stack bg='white' pr='30px' pl='30px' pt='10px' pb='10px' backgroundColor='rgba(102,205,170,0.7)' boxShadow='0px 1px 20px 1px rgba(0,0,0,0.5)'>
        <Flex alignItems='center' justifyContent='space-between'>
          <Box maxWidth='200px'>
            <Img src="/img_logo.png" alt="logo" />
          </Box>
          <Box>
            <SignInButton />
            <SignUpButton />
          </Box>
        </Flex>
      </Stack>
    </>
  )
}

export default Header

import { Button } from '@chakra-ui/react'
import React from 'react'
import { Darumadrop_One } from 'next/font/google';

const darumadrop = Darumadrop_One({ subsets: ["latin"], weight: '400' });


const MyPageButton = () => {
  return (
    <Button
      as="a"
      href="/pages/mypage"
      colorScheme="gray"
      variant="ghost"
      size="lg"
      sx={{ fontFamily: darumadrop.style.fontFamily }}
      pl='15px'
    >
      My Page
    </Button>
  )
}

export default MyPageButton

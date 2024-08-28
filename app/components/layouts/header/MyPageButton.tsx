import { Button } from '@chakra-ui/react'
import React from 'react'
import { Darumadrop_One } from 'next/font/google';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const darumadrop = Darumadrop_One({ subsets: ["latin"], weight: '400' });


const MyPageButton = () => {

  const router = useRouter();

  const handleMyPage = () => {
    router.push('/pages/mypage');
  }


  return (
    <Button
      colorScheme="gray"
      variant="ghost"
      size="lg"
      sx={{ fontFamily: darumadrop.style.fontFamily }}
      pl='15px'
      onClick={handleMyPage}
    >
      My Page
    </Button>
  )
}

export default MyPageButton

import { Button } from '@chakra-ui/react'
import Link from 'next/link'
import React from 'react'
import { Darumadrop_One } from 'next/font/google';

const darumadrop = Darumadrop_One({ subsets: ["latin"], weight: '400' });


const MyPageButton = () => {
  return (
    <>
        <Button colorScheme='gray' variant='ghost' size='lg' sx={{ fontFamily: darumadrop.style.fontFamily }}>
          <Link href='/pages/mypage' >
          My Page
          </Link>
        </Button>

    </>
  )
}

export default MyPageButton

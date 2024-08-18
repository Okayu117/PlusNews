import { Button } from '@chakra-ui/react'
import Link from 'next/link'
import React from 'react'

const MyPageButton = () => {
  return (
    <>
      <Link href='/pages/mypage'>
        <Button colorScheme='teal' variant='ghost'>
          Myページ
        </Button>
      </Link>

    </>
  )
}

export default MyPageButton

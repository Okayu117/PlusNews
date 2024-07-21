import { Button } from '@chakra-ui/react'
import Link from 'next/link'
import React from 'react'

const SignInButton = () => {
  return (
    <>
      <Link href='/pages/signin'>
        <Button colorScheme='teal' variant='ghost'>
          Sign In
        </Button>
      </Link>

    </>
  )
}

export default SignInButton

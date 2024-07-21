import { Button } from '@chakra-ui/react'
import Link from 'next/link'
import React from 'react'

const SignInButton = () => {
  return (
    <>
      <Link href='/pages/signup'>
        <Button colorScheme='teal' variant='ghost'>
          Sign Up
        </Button>
      </Link>

    </>
  )
}

export default SignInButton

import { auth } from '@/utils/firebase/firebaseConfg'
import { Button } from '@chakra-ui/react'
import Link from 'next/link'
import React from 'react'

const SignOutButton = () => {
  return (
    <>
        <Button
        colorScheme='teal'
        variant='ghost'
        onClick={() => auth.signOut()}
        >
          Sign Out
        </Button>
    </>
  )
}

export default SignOutButton

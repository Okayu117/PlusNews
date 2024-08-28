import { Button } from '@chakra-ui/react'
import React from 'react'
import { Darumadrop_One } from 'next/font/google';
import { useRouter } from 'next/navigation';

const darumadrop = Darumadrop_One({ subsets: ["latin"], weight: '400' });


const SignUpButton = () => {
  const router = useRouter();

  const handleSignUp = () => {
    router.push('/pages/signup');
  }


  return (
    <Button
      colorScheme="gray"
      variant="ghost"
      size="lg"
      sx={{ fontFamily: darumadrop.style.fontFamily }}
      pl='15px'
      onClick={handleSignUp}
    >
    Sign Up
    </Button>
  )
}

export default SignUpButton

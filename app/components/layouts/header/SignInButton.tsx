import { Button } from '@chakra-ui/react'
import React from 'react'
import { Darumadrop_One } from 'next/font/google';
import { useRouter } from 'next/navigation';

const darumadrop = Darumadrop_One({ subsets: ["latin"], weight: '400' });


const SignInButton = () => {
  const router = useRouter();

  const handleSignIn = () => {
    router.push('/pages/signin');
  };

  return (
    <Button
      colorScheme="gray"
      variant="ghost"
      size="lg"
      sx={{ fontFamily: darumadrop.style.fontFamily }}
      pl='15px'
      onClick={handleSignIn}
    >
      Sign In
    </Button>
  )
}

export default SignInButton

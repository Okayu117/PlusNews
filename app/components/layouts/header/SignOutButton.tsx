import { auth } from '@/utils/firebase/firebaseConfg';
import { Button, useToast } from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import { Darumadrop_One } from 'next/font/google';

const darumadrop = Darumadrop_One({ subsets: ["latin"], weight: '400' });


const SignOutButton = () => {
  const toast = useToast();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await auth.signOut();
      toast({
        title: 'サインアウトしました',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      router.push('/');
      window.location.reload();// ページをリロード
    } catch (error) {
      toast({
        title: 'サインアウトに失敗しました',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <Button colorScheme='gray' variant='ghost' size='lg' onClick={handleSignOut} sx={{ fontFamily: darumadrop.style.fontFamily }}>
      Sign Out
    </Button>
  );
};

export default SignOutButton;

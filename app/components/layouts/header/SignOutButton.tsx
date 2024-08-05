import { auth } from '@/utils/firebase/firebaseConfg';
import { Button, useToast } from '@chakra-ui/react';
import { useRouter } from 'next/navigation';

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
      router.push('/'); // サインアウト後にトップページにリダイレクト
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
    <Button colorScheme='teal' variant='ghost' onClick={handleSignOut}>
      Sign Out
    </Button>
  );
};

export default SignOutButton;

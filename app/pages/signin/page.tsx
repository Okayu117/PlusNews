'use client'
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '@/utils/firebase/firebaseConfg';
import { Box, Button, FormControl, Input, Link, Stack, Text, Flex, useToast } from '@chakra-ui/react'
import { useForm } from "react-hook-form"
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { FirebaseError } from 'firebase/app';
import { doc, getDoc } from 'firebase/firestore';

export const validationSchema = z.object({
  email: z
    .string()
    .email('メールアドレスの形式が正しくありません'),
  password: z
    .string()
    .min(8, 'パスワードは8文字以上で入力してください'),
});

interface User {
  email: string;
  password: string;
}

const SignIn = () => {

  const router = useRouter();
  const toast = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<User>({
    mode: 'onChange',
    resolver: zodResolver(validationSchema),
  });

  const handleSignIn = async (formData: User) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;

      // Firestoreからユーザーデータを取得
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        console.log("User data from Firestore:", userData);
      } else {
        console.error("No such user in Firestore!");
      }

      toast({
        title: 'サインインに成功しました',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      router.push('/');
    } catch (e) {
      if (e instanceof FirebaseError) {
        let errorMessage = 'サインインに失敗しました';
        if (e.code === 'auth/wrong-password') {
          errorMessage = 'パスワードが間違っています';
        } else if (e.code === 'auth/user-not-found') {
          errorMessage = 'ユーザーが見つかりません';
        }

        toast({
          title: errorMessage,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } else {
        toast({
          title: 'サインインに失敗しました',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit(handleSignIn)}>
        <Stack maxWidth='70%' m='auto' textAlign='center' justifyContent='center'>
          <Flex pt='50px' flexDirection='column' alignItems='center'>
            <Text as='samp' fontSize='30px'>Sign In</Text>
            <FormControl maxWidth='400px'>
              <Stack justifyContent='center' flexDirection='column' alignItems='start' pt='20px' pb='20px'>
                <Input
                  variant='filled'
                  mt='5px'
                  mb='5px'
                  borderRadius='5px'
                  type="email"
                  placeholder="メールアドレス"
                  id="email"
                  {...register("email")}
                />
                <Text color='red'>{errors.email?.message as React.ReactNode}</Text>
                <Input
                  variant='filled'
                  mt='5px'
                  mb='5px'
                  borderRadius='5px'
                  type="password"
                  placeholder="パスワード"
                  id="password"
                  {...register("password")}
                />
                <Text color='red'>{errors.password?.message as React.ReactNode}</Text>
              </Stack>
              <Button type="submit" backgroundColor='rgba(102,205,170,0.7)' width='180px' height='45px' borderRadius='30px'>
                <Text color='white'>Sign In</Text>
              </Button>
            </FormControl>
            <Box>
              <Link href='/reset-password'>
                <Text pt='15px' fontSize='12px'>パスワードを忘れた方はこちら</Text>
              </Link>
              <Link href='/signup'>
                <Text pt='15px' fontSize='12px'>アカウントを作成する</Text>
              </Link>
            </Box>
          </Flex>
        </Stack>
      </form>
    </>
  )
}

export default SignIn

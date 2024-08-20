'use client'
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth, db } from '@/utils/firebase/firebaseConfg';
import { Box, Button, FormControl, Input, Link, Stack, Text, Flex, useToast } from '@chakra-ui/react'
import { useForm } from "react-hook-form"
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { FirebaseError } from 'firebase/app';
import { supabase } from '@/utils/supabase/supabaseClient';
import { doc, setDoc } from 'firebase/firestore';



  export const validationSchema = z.object({
    username: z
      .string()
      .min(2, { message: '2文字以上入力してください' })
      .max(20, { message: '20文字以下で入力してください' }),
    email: z
      .string()
      .email('メールアドレスの形式が正しくありません'),
    password: z
      .string()
      .min(8, 'パスワードは8文字以上で入力してください'),
  });

interface User {
  username: string;
  email: string;
  password: string;
}

const SignUp = () => {

  const router = useRouter();
  const toast = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<User>({
    mode: 'onChange',
    resolver: zodResolver(validationSchema),
  });

  const handleSignUp = async (formData: User) => {
    const { email, password, username } = formData;
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // ユーザーのプロファイルを更新
      await updateProfile(user, { displayName: username });

      // Firestoreにユーザーデータを保存
      await setDoc(doc(db, 'users', user.uid), {
        id: user.uid,
        username: username,
        email: email,
      });

      toast({
        title: 'アカウントが作成されました',
        status: 'success',
        duration: 6000,
        isClosable: true,
      });

    router.push('/');
    } catch (error) {
      if (error instanceof FirebaseError) {
        if (error.code === 'auth/email-already-in-use') {
          setError('email', {
            type: 'validate',
            message: 'このメールアドレスは既に使用されています',
          });
        }
      } else {
        toast({
          title: 'サインアップに失敗しました',
          status: 'error',
          duration: 6000,
          isClosable: true,
        });
      }
    }
  };



  return (
    <>
      <form onSubmit={handleSubmit(handleSignUp)}>
        <Stack maxWidth='70%' m='auto' textAlign='center' justifyContent='center' pt='100px'>
          <Flex flexDirection='column' alignItems='center'>
            <Text fontSize='30px'>Sign Up</Text>
              <FormControl maxWidth='400px'>
                <Stack justifyContent='center' flexDirection='column' alignItems='start' pt='20px' pb='20px'>
                  <Input
                    variant='filled'
                    mt='5px'
                    mb='5px'
                    borderRadius='5px'
                    type="text"
                    placeholder="名前"
                    id="username"
                    {...register("username")}
                  />
                  <Text color='red'>{errors.username?.message as React.ReactNode}</Text>
                  <Input
                    variant='filled'
                    mt='5px'
                    mb='5px'
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
                    type="password"
                    placeholder="パスワード"
                    id="password"
                    {...register("password")}
                  />
                  <Text color='red'>{errors.password?.message as React.ReactNode}</Text>
                </Stack>
                  <Button
                  type="submit"
                  bg='rgba(102,205,170,0.7)'
                  width='180px'
                  height='45px'
                  borderRadius='30px'
                  >
                    <Text color='white'>Sign Up</Text>
                  </Button>
              </FormControl>
              <Box>
              <Link href='/signin'>
                <Text pt='15px' fontSize='12px'>サインインはこちら</Text>
              </Link>
            </Box>
          </Flex>
        </Stack>
      </form>
    </>
  )
}

export default SignUp

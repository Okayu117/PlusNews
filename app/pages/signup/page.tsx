'use client'
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '@/utils/firebase/firebaseConfg';
import { Box, Button, FormControl, Input, Link, Stack, Text, Flex, useToast } from '@chakra-ui/react'
import { useForm } from "react-hook-form"
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { FirebaseError } from 'firebase/app';
import { supabase } from '@/utils/supabase/supabaseClient';



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

  const handleSignUp = async(formData: User) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;
      await updateProfile(user, { displayName: formData.username });

      // Supabaseでユーザー名の重複チェック
      const { data: existingUser, error: checkError } = await supabase
        .from("users")
        .select("username")
        .eq("username", formData.username);

      if (checkError) {
        console.error("Error checking username in Supabase:", checkError);
        throw new Error("Error checking username in Supabase");
      }

      if (existingUser && existingUser.length > 0) {
        toast({
          title: 'ユーザー名の重複エラー',
          description: 'このユーザー名は既に使用されています',
          status: 'error',
          duration: 6000,
          isClosable: true,
        });
        return;
      }

     // Supabaseにユーザー情報を保存
      const { data, error } = await supabase
        .from("users")
        .insert({
          username: formData.username,
          email: formData.email,
          password: formData.password // 実際にはハッシュ化されたパスワードを保存することを推奨します
        });

    if (error) {
      console.error("Error inserting user into Supabase:", error);
      throw new Error("Error inserting user into Supabase");
    }

    console.log("User successfully inserted into Supabase:", data);

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
        <Stack maxWidth='70%' m='auto' textAlign='center' justifyContent='center'>
          <Flex pt='50px' flexDirection='column' alignItems='center'>
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

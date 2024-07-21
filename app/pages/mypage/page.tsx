'use client'
import { auth } from '@/utils/firebase/firebaseConfg'
import { Box, Button, FormControl, Input, Stack, Text, Flex, useToast } from '@chakra-ui/react'
import { useForm } from "react-hook-form"
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { supabase } from '@/utils/supabase/supabaseClient'

const validationSchema = z.object({
  username: z
    .string()
    .min(2, { message: '2文字以上入力してください' })
    .max(20, { message: '20文字以下で入力してください' }),
})

interface User {
  id: string
  username: string
  email: string
  password: string
}

const MyPage = () => {
  const [user, setUser] = useState<User | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const toast = useToast()
  const { register, handleSubmit, formState: { errors }, reset } = useForm<User>({
    mode: 'onChange',
    resolver: zodResolver(validationSchema),
  })

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const { data: userData, error } = await supabase
          .from('users')
          .select('*')
          .eq('email', firebaseUser.email)
          .single()

        if (error) {
          console.error('Error fetching user data:', error)
        } else {
          setUser(userData)
          reset(userData)
        }
      } else {
        setUser(null)
      }
    })

    return () => unsubscribe()
  }, [])

  const handleEditClick = () => {
    setIsEditing(true)
  }

  const handleCancelClick = () => {
    setIsEditing(false)
    reset(user ? user : {})
  }

  const handleSaveClick = async (formData: User) => {
    if (user) {
      const updates = { username: formData.username }

      // Supabaseの更新
      const { data, error: supabaseError } = await supabase
        .from('users')
        .update(updates)
        .eq('id', user.id)
        console.log('Supabase update response:', data)
      if (supabaseError) {
        console.error('Error updating Supabase user data:', supabaseError)
        toast({
          title: 'Supabaseのユーザー情報の更新に失敗しました',
          status: 'error',
          duration: 6000,
          isClosable: true,
        })
      } else {
        console.log('Supabase update response:', data)
        setUser({ ...user, ...updates })
        setIsEditing(false)
        toast({
          title: 'ユーザー情報を更新しました',
          status: 'success',
          duration: 6000,
          isClosable: true,
        })
      }
    }
  }

  if (!user) {
    return (
      <>
        <Stack maxWidth='70%' m='auto' textAlign='center' justifyContent='center'>
          <Flex pt='50px' flexDirection='column' alignItems='center'>
            <Text fontSize='30px'>Loading...</Text>
          </Flex>
        </Stack>
      </>
    )
  }

  return (
    <>
      <Stack maxWidth='70%' m='auto' textAlign='center' justifyContent='center'>
        <Flex pt='50px' flexDirection='column' alignItems='center'>
          <Flex alignItems="center">
            <Text fontSize='30px'>Myページ</Text>
          </Flex>
          <form onSubmit={handleSubmit(handleSaveClick)}>
            <Box>
              <Flex alignItems="center">
                <Text fontSize='20px'>ユーザー名</Text>
                {isEditing ? (
                  <FormControl maxWidth='400px'>
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
                  </FormControl>
                ) : (
                  <>
                    <Text>{user.username}</Text>
                    <Button onClick={handleEditClick} ml="10px">編集</Button>
                  </>
                )}
              </Flex>
            </Box>
            <Box>
              <Text fontSize='20px'>メールアドレス</Text>
              <Text>{user.email}</Text>
            </Box>
            <Box>
              <Text fontSize='20px'>パスワード</Text>
              <Text>{user.password}</Text>
            </Box>
            <Box pt='20px'>
              <Button type="submit" isDisabled={!isEditing} mr="10px">保存</Button>
              <Button onClick={handleCancelClick} isDisabled={!isEditing}>キャンセル</Button>
            </Box>
          </form>
        </Flex>
      </Stack>
    </>
  )
}

export default MyPage

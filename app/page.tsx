'use client'
import React from 'react';
import { Flex, Stack } from '@chakra-ui/react';
import CategoryButton from './components/layouts/header/CategoryButton';

const Home: React.FC = () => {
  const categories = [
    'ALL',
    'animal',
    'ビジネス',
    'エンタメ',
    'スポーツ',
    'テクノロジー',
    '科学',
    '健康',
    'ライフハック'
  ];

  return (
    <Stack w='100%'>
      <Flex p='15px' mt='50px' justifyContent='center' wrap='wrap' gap='10px'>
        {categories.map((category) => (
          <CategoryButton key={category} category={category} />
        ))}
      </Flex>
    </Stack>
  );
};

export default Home;

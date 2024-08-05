import React from 'react';
import Link from 'next/link';
import moment from 'moment';
import { Box, Flex, Img, Text } from '@chakra-ui/react';
import { HiAnnotation } from "react-icons/hi";
import { ArticleType } from '../../app/page';

interface ArticleProps {
  article: ArticleType;
}

const Article: React.FC<ArticleProps> = ({ article }) => {
  const { id, description, publishedAt, source, urlToImage, url, title } = article;
  const time = moment(publishedAt || moment.now()).fromNow();
  const defaultImage = 'https://wallpaper.wiki/wp-content/uploads/2017/04/wallpaper.wiki-Images-HD-Diamond-Pattern-PIC-WPB009691.jpg';

    // IDをコンソールに出力
    console.log('Article ID:', id);

  return (
    <Box w="100%">
        <Flex
          p='15px'
          gap='15px'
          h="200px"
          alignItems="center"
        >
          <Box w='30%' h='150px' overflow='hidden' flexShrink={0}>
            <Img w='100%' h='150px' objectFit='cover' src={urlToImage ?? defaultImage} alt="Article Image" />
          </Box>
          <Box flex='1' h='150px' overflow='hidden'>
            <a href={url} target="_blank" rel="noopener noreferrer">
              <Text>{title}</Text>
            </a>
            <Box>{description}</Box>
            <Text>{source?.name ? source.name.toUpperCase() : 'Unknown Source'}</Text>
            <Text>{time}</Text>
            <Link href={`/articles/${id}/comments`} passHref>
              <HiAnnotation />
            </Link>
          </Box>
        </Flex>
    </Box>
  );
};

export default Article;

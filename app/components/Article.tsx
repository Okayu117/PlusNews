import React from 'react';
import Link from 'next/link';
import moment from 'moment';
import { Box, Divider, Flex, Img, Text } from '@chakra-ui/react';

interface ArticleProps {
  article: {
      description: string;
      publishedAt: string;
      source: {
          name: string;
      };
      urlToImage: string;
      url: string;
  };
}

const Article: React.FC<ArticleProps> = ({ article }) => {
  const { description, publishedAt, source, urlToImage, url } = article;
  const time = moment(publishedAt || moment.now()).fromNow();
  const defaultImage = "https://wallpaper.wiki/wp-content/uploads/2017/04/wallpaper.wiki-Images-HD-Diamond-Pattern-PIC-WPB009691.jpg";

  return (
      <>
        <Box w="100%">
          <Link href={url} passHref>
            <Flex
              p='15px'
              gap='15px'
              h="200px"
              alignItems="center"
            >
              <Box w='30%' h='150px' overflow='hidden' flexShrink={0}>
                <Img w='100%' h='150px' objectFit='cover' src={urlToImage || defaultImage} alt="Article Image" />
              </Box>
              <Box flex='1' h='150px' overflow='hidden'>
                <Box>{description || 'Read more...'}</Box>
                <Text>{source.name.toUpperCase()}</Text>
                <Text>{time}</Text>
              </Box>
            </Flex>
          </Link>
        </Box>
      </>
    );
  };
  

export default Article;

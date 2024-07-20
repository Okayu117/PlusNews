import React from 'react';
import Link from 'next/link';
import moment from 'moment';
import { Box } from '@chakra-ui/react';
import Image from 'next/image';

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
        <Link href={url} passHref>
            <Box>
            <Image src="/path/to/image.jpg" alt="description" width={500} height={300} />
              <div className="p-4">
                <p className="mb-2 text-base">{description || 'Read more...'}</p>
                <div className="h-px bg-gray-200 my-2"></div>
                  <div className="flex justify-between text-xs text-gray-600">
										<span>{source.name.toUpperCase()}</span>
										<span>{time}</span>
                  </div>
                </div>
            </Box>
        </Link>
    );
};

export default Article;

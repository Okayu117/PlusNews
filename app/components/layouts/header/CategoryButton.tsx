import { Button } from '@chakra-ui/react';
import Link from 'next/link';

interface CategoryButtonProps {
  category: string;
}

const CategoryButton: React.FC<CategoryButtonProps> = ({ category }) => {
  return (
    <Link href={`/category/${category}`} passHref>
      <Button>{category}</Button>
    </Link>
  );
};

export default CategoryButton;

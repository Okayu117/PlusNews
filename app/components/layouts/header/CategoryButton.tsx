import { Button } from '@chakra-ui/react';
import Link from 'next/link';

interface CategoryButtonProps {
  category: string;
  categoryKey: string;
  isSelected: boolean;
  onClick: () => void;
}

const CategoryButton: React.FC<CategoryButtonProps> = ({ category, categoryKey, isSelected, onClick }) => {
  return (
    <>
      <Link href={{ pathname: '/', query: { category: categoryKey } }} shallow>
        <Button
          bg={isSelected ? 'blue.500' : 'gray.200'}
          color={isSelected ? 'white' : 'black'}
          onClick={onClick}
        >
          {category}
        </Button>
      </Link>

    </>
  );
};

export default CategoryButton;

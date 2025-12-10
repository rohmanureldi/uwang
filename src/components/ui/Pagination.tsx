import Button from './Button';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-700">
      <Button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 0}
        variant="gray"
        size="sm"
      >
        Previous
      </Button>
      
      <span className="text-sm text-gray-400">
        Page {currentPage + 1} of {totalPages}
      </span>
      
      <Button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages - 1}
        variant="gray"
        size="sm"
      >
        Next
      </Button>
    </div>
  );
}
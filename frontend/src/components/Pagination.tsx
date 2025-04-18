import { motion } from "framer-motion";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  pageSize: number;
  onPageSizeChange: (size: number) => void;
}

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  pageSize,
  onPageSizeChange,
}: PaginationProps) => {
  const pageSizes = [5, 10, 20];

  return (
    <div className="flex items-center justify-between mt-4 text-sm text-text">
      <div className="flex items-center">
        <span className="mr-2">Rows per page:</span>
        <select
          title="size"
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          className="p-1 border rounded-md focus:ring-2 focus:ring-secondary border-gray-300"
        >
          {pageSizes.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
      </div>
      <div className="flex items-center space-x-2">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-1 px-2 border rounded-md disabled:opacity-50 border-gray-300"
        >
          Previous
        </motion.button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-1 px-2 border rounded-md disabled:opacity-50 border-gray-300"
        >
          Next
        </motion.button>
      </div>
    </div>
  );
};

export default Pagination;

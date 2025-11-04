type SideBarProps = {
  categories: string[];
  selectedCategories: string[];
  onFilterChange: (category: string) => void; 
};

export default function SideBar({
  categories,
  selectedCategories,
  onFilterChange
}: SideBarProps) {
  return (
    <aside className="w-full lg:w-1/4 lg:pr-8">
      <h2 className="text-lg font-semibold mb-4 border-b pb-2">Categoría</h2>
      
      <ul className="space-y-2">
        <li>
          <input
            type="checkbox"
            id="all-categories"
            checked={selectedCategories.length === 0} 
            onChange={() => onFilterChange(null)}
            className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black"
          />
          <label 
            htmlFor="all-categories"
            className="ml-3 text-sm text-gray-600 cursor-pointer"
          >
            Todas
          </label>
        </li>

        {categories.map((category) => (
          <li key={category} className="flex items-center">
            <input
              type="checkbox"
              id={category}
              value={category}
              checked={selectedCategories.includes(category)}
              onChange={() => onFilterChange(category)}
              className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black"
            />
            <label 
              htmlFor={category}
              className="ml-3 text-sm text-gray-600 cursor-pointer"
            >
              {category}
            </label>
          </li>
        ))}
      </ul>
    </aside>
  );
}
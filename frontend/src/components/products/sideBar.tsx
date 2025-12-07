// src/components/products/sideBar.tsx
"use client";

type SideBarProps = {
  categories: string[];
  selectedCategories: string[];
  onFilterChange: (category: string | null) => void;
};

export default function SideBar({
  categories,
  selectedCategories,
  onFilterChange,
}: SideBarProps) {
  return (
    <aside className="w-full lg:w-1/4 lg:pr-8">
      <h2 className="text-lg font-semibold mb-4 border-b pb-2">Categoría</h2>

      <ul className="space-y-3"> {/* Aumenté un poco el espacio vertical para que respiren mejor */}
        
        {/* Opción "Todas" */}
        <li className="flex items-center group"> {/* 'group' para efectos hover si quieres */}
          <input
            type="checkbox"
            id="all-categories"
            checked={selectedCategories.length === 0}
            onChange={() => onFilterChange(null)}
            // Clases específicas para tamaño fijo y consistencia
            className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black cursor-pointer shrink-0" 
          />
          <label
            htmlFor="all-categories"
            className="ml-3 text-sm text-gray-700 cursor-pointer select-none group-hover:text-black"
          >
            Todas
          </label>
        </li>

        {/* Resto de Categorías */}
        {categories.map((category) => (
          <li key={category} className="flex items-center group">
            <input
              type="checkbox"
              id={category}
              value={category}
              checked={selectedCategories.includes(category)}
              onChange={() => onFilterChange(category)}
              // ¡MISMAS CLASES EXACTAS!
              className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black cursor-pointer shrink-0"
            />
            <label
              htmlFor={category}
              className="ml-3 text-sm text-gray-700 cursor-pointer select-none group-hover:text-black"
            >
              {category}
            </label>
          </li>
        ))}
      </ul>
    </aside>
  );
}
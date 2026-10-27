import { useState, useMemo, type FC } from "react";
import { Search, X, Check } from "lucide-react";
import Modal from "./Modal";
import {
  ICON_CATEGORIES,
  searchCategoryIcons,
  resolveLucideIcon,
  getCategoryIconOption,
  type CuratedIconItem,
} from "../../utils/categoryIcons";

export interface IconPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (iconName: string | null) => void;
  selectedIcon: string | null;
}

export const IconPickerModal: FC<IconPickerModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  selectedIcon,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  // Filtered icons based on search query and category
  const filteredIcons = useMemo(() => {
    return searchCategoryIcons(searchQuery, activeCategory);
  }, [searchQuery, activeCategory]);

  const handleSelect = (name: string | null) => {
    onSelect(name);
    onClose();
  };

  const handleClearSearch = () => {
    setSearchQuery("");
  };

  // Selected icon preview
  const currentOption = selectedIcon ? getCategoryIconOption(selectedIcon) : null;
  const SelectedIconComponent = currentOption?.Icon;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Choose Category Icon"
      titleVariant="header"
      zIndex="z-60"
      className="max-w-2xl w-full"
    >
      <div className="space-y-4">
        {/* Search bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search icons (e.g. food, gym, coffee, uber, rent, tax, game)..."
            className="w-full pl-9 pr-9 py-2 text-sm bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white transition-all placeholder:text-neutral-400"
            autoFocus
          />
          {searchQuery && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-neutral-400 hover:text-neutral-700 rounded-full hover:bg-neutral-200 transition-colors cursor-pointer"
              aria-label="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-thin scrollbar-thumb-neutral-200">
          {ICON_CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer shrink-0 ${
                  isActive
                    ? "bg-neutral-900 text-white shadow-xs"
                    : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 hover:text-neutral-900"
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Icons Grid */}
        <div className="max-h-[360px] overflow-y-auto overscroll-contain pr-1 rounded-xl border border-neutral-100 p-2 bg-neutral-50/50">
          {filteredIcons.length === 0 ? (
            <div className="text-center py-12 px-4 space-y-2">
              <p className="text-sm font-semibold text-neutral-700">No matching icons found</p>
              <p className="text-xs text-neutral-400 max-w-xs mx-auto">
                No icons matched &quot;{searchQuery}&quot;. Try searching for general terms like &quot;money&quot;, &quot;car&quot;, &quot;food&quot;, or &quot;gift&quot;.
              </p>
              <button
                type="button"
                onClick={handleClearSearch}
                className="mt-2 text-xs text-black font-semibold underline underline-offset-2 hover:opacity-80 cursor-pointer"
              >
                Clear search query
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-1.5">
              {filteredIcons.map((item: CuratedIconItem) => {
                const isSelected = selectedIcon === item.name;
                const IconComponent = resolveLucideIcon(item.name);
                if (!IconComponent) return null;

                const iconOption = getCategoryIconOption(item.name);

                return (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() => handleSelect(item.name)}
                    title={item.label}
                    aria-label={item.label}
                    aria-pressed={isSelected}
                    className={`relative group flex flex-col items-center justify-center p-2 h-16 rounded-xl border text-center transition-all cursor-pointer ${
                      isSelected
                        ? "border-neutral-900 bg-white ring-2 ring-neutral-900 shadow-sm"
                        : "border-neutral-200/80 bg-white hover:border-neutral-400 hover:bg-neutral-50/90 hover:shadow-2xs"
                    }`}
                  >
                    {isSelected && (
                      <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-neutral-900 rounded-full flex items-center justify-center text-white">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </span>
                    )}
                    <IconComponent
                      className={`w-5 h-5 transition-transform group-hover:scale-110 ${
                        iconOption?.color ?? "text-neutral-700"
                      }`}
                    />
                    <span className="text-[10px] font-medium text-neutral-600 truncate max-w-full mt-1 leading-tight group-hover:text-neutral-900">
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer info & close */}
        <div className="flex items-center justify-between pt-2 border-t border-neutral-100 text-xs">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-neutral-400">Selected:</span>
            {selectedIcon && SelectedIconComponent ? (
              <span className="inline-flex items-center gap-1.5 font-medium text-neutral-900 bg-neutral-100 px-2 py-0.5 rounded-md truncate">
                <SelectedIconComponent className={`w-3.5 h-3.5 ${currentOption?.color ?? ""}`} />
                <span className="truncate">{currentOption?.label ?? selectedIcon}</span>
              </span>
            ) : (
              <span className="text-neutral-500 italic">None (Default)</span>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="py-1.5 px-4 rounded-lg font-medium border border-neutral-200 text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default IconPickerModal;

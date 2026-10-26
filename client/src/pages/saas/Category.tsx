import { useState, useEffect, useCallback, type FormEvent } from "react";
import toast from "react-hot-toast";
import {
  Pencil,
  Trash2,
  Lock,
  Plus,
  Minus,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import PageHeader from "../../shared/components/saas/PageHeader";
import CustomInput, {
  CustomSelect,
  FieldLabel,
} from "../../shared/components/CustomInput";
import CustomBtn from "../../shared/components/CustomBtn";
import Table, { type TableColumn } from "../../shared/components/saas/Table";
import Modal from "../../shared/components/saas/Modal";
import categoryService, {
  type Category as CategoryItem,
  type CategoryType,
} from "../../shared/services/api/categoryService";
import {
  CATEGORY_ICON_OPTIONS,
  getCategoryIconOption,
} from "../../shared/utils/categoryIcons";
import IconPickerModal from "../../shared/components/saas/IconPickerModal";
import { getApiErrorMessage } from "../../shared/utils/validation";

const CATEGORY_TYPES: CategoryType[] = ["EXPENSE", "INCOME"];
const CATEGORY_ICON_PICKER_OPTIONS = [
  {
    name: null,
    label: "None",
    Icon: Minus,
    color: "text-neutral-600",
    selectedColor:
      "border-black bg-neutral-100 text-neutral-900 ring-black/10",
  },
  ...CATEGORY_ICON_OPTIONS,
];

export const Category = () => {
  // List & Filter State
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>("ALL");

  // Form State
  const [name, setName] = useState("");
  const [type, setType] = useState<CategoryType>("EXPENSE");
  const [icon, setIcon] = useState<string | null>(null);
  const [nameError, setNameError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isIconPickerOpen, setIsIconPickerOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(
    null,
  );

  // Delete State
  const [categoryToDelete, setCategoryToDelete] =
    useState<CategoryItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch Categories from API
  const fetchCategories = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await categoryService.getCategories();
      setCategories(data);
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err, "Failed to load categories"));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Start editing a category
  const handleStartEdit = (cat: CategoryItem) => {
    if (cat.userId === null) {
      toast.error("System categories cannot be modified");
      return;
    }
    setEditingCategory(cat);
    setName(cat.name);
    setType(cat.type);
    setIcon(cat.icon);
    setNameError("");
    setIsCategoryModalOpen(true);
  };

  // Cancel edit mode and reset form
  const handleCancelEdit = () => {
    setIsCategoryModalOpen(false);
    setIsIconPickerOpen(false);
    setEditingCategory(null);
    setName("");
    setType("EXPENSE");
    setIcon(null);
    setNameError("");
  };

  const openCreateModal = () => {
    handleCancelEdit();
    setIsCategoryModalOpen(true);
  };

  // Handle Form Submit (Create or Update)
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const trimmedName = name.trim();
    if (!trimmedName) {
      setNameError("Category name is required");
      return;
    }
    if (trimmedName.length > 100) {
      setNameError("Character limit reached (max 100)");
      return;
    }

    setNameError("");
    setIsSubmitting(true);

    try {
      const payload = { name: trimmedName, type, icon };
      if (editingCategory) {
        await categoryService.updateCategory(editingCategory.id, payload);
      } else {
        await categoryService.createCategory(payload);
      }
      toast.success(
        editingCategory
          ? "Category updated successfully"
          : "Category created successfully",
      );
      handleCancelEdit();
      await fetchCategories();
    } catch (err: unknown) {
      toast.error(
        getApiErrorMessage(
          err,
          editingCategory
            ? "Failed to update category"
            : "Failed to create category",
        ),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Confirm Delete
  const handleConfirmDelete = async () => {
    if (!categoryToDelete) return;
    setIsDeleting(true);

    try {
      await categoryService.deleteCategory(categoryToDelete.id);
      toast.success("Category deleted successfully");

      if (editingCategory?.id === categoryToDelete.id) {
        handleCancelEdit();
      }

      setCategoryToDelete(null);
      await fetchCategories();
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err, "Failed to delete category"));
    } finally {
      setIsDeleting(false);
    }
  };

  // Filter categories by selected pill
  const filteredCategories = categories.filter((cat) => {
    if (selectedTypeFilter === "EXPENSE") return cat.type === "EXPENSE";
    if (selectedTypeFilter === "INCOME") return cat.type === "INCOME";
    return true;
  });

  const expenseCount = categories.filter((c) => c.type === "EXPENSE").length;
  const incomeCount = categories.filter((c) => c.type === "INCOME").length;
  const customCount = categories.filter((c) => c.userId !== null).length;

  const isCustomIconSelected =
    icon !== null && !CATEGORY_ICON_PICKER_OPTIONS.some((opt) => opt.name === icon);
  const customIconOption = isCustomIconSelected ? getCategoryIconOption(icon) : null;
  const CustomSelectedIcon = customIconOption?.Icon;

  const columns: TableColumn<CategoryItem>[] = [
    {
      header: "Category Name",
      accessor: "name",
      render: (cat) => {
        const iconOption = getCategoryIconOption(cat.icon);
        const CategoryIcon = iconOption?.Icon;
        return (
          <div className="flex items-center gap-2.5">
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                iconOption
                  ? `${iconOption.color} bg-neutral-50`
                  : cat.type === "EXPENSE"
                    ? "bg-red-50 text-red-600"
                    : "bg-emerald-50 text-emerald-600"
              }`}
            >
              {CategoryIcon && <CategoryIcon className="w-4 h-4" />}
            </div>
            <div>
              <p className="font-semibold text-neutral-900 leading-tight">
                {cat.name}
              </p>
            </div>
          </div>
        );
      },
    },
    {
      header: "Type",
      accessor: "type",
      render: (cat) => {
        const isExpense = cat.type === "EXPENSE";
        return (
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
              isExpense
                ? "bg-red-50 text-red-700 border-red-200"
                : "bg-emerald-50 text-emerald-700 border-emerald-200"
            }`}
          >
            {isExpense ? (
              <TrendingDown className="w-3 h-3" />
            ) : (
              <TrendingUp className="w-3 h-3" />
            )}
            {isExpense ? "Expense" : "Income"}
          </span>
        );
      },
    },
    {
      header: "Ownership",
      render: (cat) => {
        const isSystem = cat.userId === null;
        return (
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${
              isSystem
                ? "bg-neutral-100 text-neutral-600 border-neutral-200"
                : "bg-blue-50 text-blue-700 border-blue-200"
            }`}
          >
            {isSystem && <Lock className="w-3 h-3 text-neutral-400" />}
            {isSystem ? "System Default" : "Custom"}
          </span>
        );
      },
    },
    {
      header: "Created Date",
      accessor: "createdAt",
      render: (cat) => (
        <span className="text-xs text-neutral-500 tabular-nums">
          {new Date(cat.createdAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </span>
      ),
    },
    {
      header: "Action",
      align: "right",
      render: (cat) => {
        const isSystem = cat.userId === null;

        if (isSystem) {
          return (
            <span
              className="text-xs text-neutral-400 italic px-2 py-1 select-none"
              title="Default system categories are protected"
            >
              Default
            </span>
          );
        }

        return (
          <div className="flex items-center justify-end gap-1">
            <button
              type="button"
              onClick={() => handleStartEdit(cat)}
              className="p-1.5 rounded-lg text-neutral-500 hover:text-amber-600 hover:bg-amber-50 active:text-amber-700 transition-colors cursor-pointer"
              title="Edit category"
              aria-label="Edit category"
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setCategoryToDelete(cat)}
              className="p-1.5 rounded-lg text-neutral-500 hover:text-red-600 hover:bg-red-50 active:text-red-700 transition-colors cursor-pointer"
              title="Delete category"
              aria-label="Delete category"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="min-h-screen bg-neutral-50/50 text-black py-8 px-4 sm:px-8 max-w-7xl mx-auto space-y-8">
      {/* Page Header */}
      <PageHeader
        title="Categories"
        subtitle="Organize your expenses and income with custom and system categories."
        btn={
          <CustomBtn
            variant="primary"
            size="md"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={openCreateModal}
          >
            Create Category
          </CustomBtn>
        }
      />

      {/* Filter Tabs & Stats Bar */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="inline-flex p-1 bg-neutral-100 rounded-xl border border-neutral-200">
          <button
            type="button"
            onClick={() => setSelectedTypeFilter("ALL")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              selectedTypeFilter === "ALL"
                ? "bg-white text-black shadow-xs"
                : "text-neutral-600 hover:text-black"
            }`}
          >
            All Categories ({categories.length})
          </button>
          <button
            type="button"
            onClick={() => setSelectedTypeFilter("EXPENSE")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              selectedTypeFilter === "EXPENSE"
                ? "bg-white text-red-600 shadow-xs"
                : "text-neutral-600 hover:text-red-600"
            }`}
          >
            Expenses ({expenseCount})
          </button>
          <button
            type="button"
            onClick={() => setSelectedTypeFilter("INCOME")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              selectedTypeFilter === "INCOME"
                ? "bg-white text-emerald-600 shadow-xs"
                : "text-neutral-600 hover:text-emerald-600"
            }`}
          >
            Income ({incomeCount})
          </button>
        </div>

        <span className="text-xs font-medium text-neutral-500">
          {customCount} custom · {categories.length - customCount} system default
        </span>
      </div>

      {/* Categories Table */}
      <div className="space-y-4">
        <Table
          columns={columns}
          data={filteredCategories}
          isLoading={isLoading}
          emptyMessage="No categories found. Click 'Create Category' to add one."
        />
      </div>

      {/* Create / Update Category Modal */}
      <Modal
        isOpen={isCategoryModalOpen}
        onClose={handleCancelEdit}
        title={editingCategory ? "Update Category" : "Create Category"}
        titleVariant="header"
        className="max-w-lg w-full"
      >
        <form noValidate onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <CustomInput
              label="Category Name"
              placeholder="e.g. Groceries, Freelance, Health"
              maxLength={100}
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (nameError) setNameError("");
              }}
              error={nameError}
              required
            />

            <CustomSelect
              label="Category Type"
              value={type}
              onChange={(e) => setType(e.target.value as CategoryType)}
              options={CATEGORY_TYPES}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <FieldLabel label="Category Icon" className="block" />
              <button
                type="button"
                onClick={() => setIsIconPickerOpen(true)}
                className="inline-flex items-center gap-1 text-xs font-semibold text-neutral-600 hover:text-black transition-colors cursor-pointer group"
              >
                <Plus className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                <span>Browse all icons</span>
              </button>
            </div>

            <div className="grid grid-cols-5 sm:grid-cols-6 gap-1.5">
              {CATEGORY_ICON_PICKER_OPTIONS.map(
                ({ name: iconName, label, Icon: OptionIcon, color, selectedColor }) => (
                  <button
                    key={iconName ?? "none"}
                    type="button"
                    onClick={() => setIcon(iconName)}
                    aria-label={iconName ? label : "No icon"}
                    title={label}
                    aria-pressed={icon === iconName}
                    className={`flex flex-col items-center justify-center gap-0.5 h-12 rounded-lg border text-[10px] transition-colors cursor-pointer ${
                      icon === iconName
                        ? `${selectedColor} ring-2`
                        : "border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50"
                    }`}
                  >
                    <OptionIcon className={`w-4 h-4 ${color}`} />
                    <span className="truncate max-w-full px-0.5">{label}</span>
                  </button>
                ),
              )}

              {/* Custom icon tile if user picked an icon from the library */}
              {isCustomIconSelected && customIconOption && CustomSelectedIcon && (
                <button
                  type="button"
                  onClick={() => setIsIconPickerOpen(true)}
                  aria-label={customIconOption.label}
                  title={`${customIconOption.label} (Custom icon - click to change)`}
                  aria-pressed={true}
                  className={`flex flex-col items-center justify-center gap-0.5 h-12 rounded-lg border text-[10px] transition-colors cursor-pointer ${customIconOption.selectedColor} ring-2`}
                >
                  <CustomSelectedIcon className={`w-4 h-4 ${customIconOption.color}`} />
                  <span className="truncate max-w-full px-0.5 font-medium">{customIconOption.label}</span>
                </button>
              )}

              {/* Plus icon option: Choose icon of user's choice */}
              <button
                type="button"
                onClick={() => setIsIconPickerOpen(true)}
                aria-label="Choose icon of your choice"
                title="Browse & select icon of your choice"
                className="flex flex-col items-center justify-center gap-0.5 h-12 rounded-lg border border-dashed border-neutral-300 bg-neutral-50/70 hover:bg-neutral-100 hover:border-neutral-900 text-neutral-700 transition-all cursor-pointer group"
              >
                <div className="w-5 h-5 rounded-full bg-white border border-neutral-300 flex items-center justify-center group-hover:border-black group-hover:bg-black group-hover:text-white transition-all shadow-2xs">
                  <Plus className="w-3.5 h-3.5" />
                </div>
                <span className="truncate max-w-full px-0.5 font-medium text-[10px] text-neutral-700 group-hover:text-black">
                  More...
                </span>
              </button>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-neutral-100">
            <CustomBtn
              type="button"
              variant="secondary"
              size="md"
              onClick={handleCancelEdit}
              disabled={isSubmitting}
            >
              Cancel
            </CustomBtn>
            <CustomBtn
              type="submit"
              variant="primary"
              size="md"
              isLoading={isSubmitting}
              className="px-6"
            >
              {editingCategory ? "Save Changes" : "Create Category"}
            </CustomBtn>
          </div>
        </form>
      </Modal>

      {/* Icon Picker Modal */}
      <IconPickerModal
        isOpen={isIconPickerOpen}
        onClose={() => setIsIconPickerOpen(false)}
        selectedIcon={icon}
        onSelect={(selectedIconName) => setIcon(selectedIconName)}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!categoryToDelete}
        onClose={() => setCategoryToDelete(null)}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
        type="danger"
        title="Delete Category"
        message={`Are you sure you want to permanently delete "${categoryToDelete?.name}"? Any transactions using this category will safely have their category set to unassigned.`}
        confirmText="Delete"
      />
    </div>
  );
};

export default Category;

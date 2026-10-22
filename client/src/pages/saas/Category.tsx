import { useState, useEffect, useCallback, type FormEvent } from "react";
import toast from "react-hot-toast";
import {
  Tag,
  Pencil,
  Trash2,
  Lock,
  Plus,
  TrendingDown,
  TrendingUp,
  X,
} from "lucide-react";
import PageHeader from "../../shared/components/saas/PageHeader";
import CustomInput, {
  CustomSelect,
} from "../../shared/components/CustomInput";
import CustomBtn from "../../shared/components/CustomBtn";
import Table, { type TableColumn } from "../../shared/components/saas/Table";
import Modal from "../../shared/components/saas/Modal";
import categoryService, {
  type Category as CategoryItem,
  type CategoryType,
} from "../../shared/services/api/categoryService";
import { getApiErrorMessage } from "../../shared/utils/validation";

const CATEGORY_TYPES: CategoryType[] = ["EXPENSE", "INCOME"];

export const Category = () => {
  // List & Filter State
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>("ALL");

  // Form State
  const [name, setName] = useState("");
  const [type, setType] = useState<CategoryType>("EXPENSE");
  const [nameError, setNameError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
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
    setNameError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Cancel edit mode and reset form
  const handleCancelEdit = () => {
    setEditingCategory(null);
    setName("");
    setType("EXPENSE");
    setNameError("");
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
      if (editingCategory) {
        await categoryService.updateCategory(editingCategory.id, {
          name: trimmedName,
          type,
        });
        toast.success("Category updated successfully");
        handleCancelEdit();
      } else {
        await categoryService.createCategory({
          name: trimmedName,
          type,
        });
        toast.success("Category created successfully");
        setName("");
        setType("EXPENSE");
      }
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

  const columns: TableColumn<CategoryItem>[] = [
    {
      header: "Category Name",
      accessor: "name",
      render: (cat) => (
        <div className="flex items-center gap-2.5">
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
              cat.type === "EXPENSE"
                ? "bg-red-50 text-red-600"
                : "bg-emerald-50 text-emerald-600"
            }`}
          >
            <Tag className="w-4 h-4" />
          </div>
          <div>
            <p className="font-semibold text-neutral-900 leading-tight">
              {cat.name}
            </p>
          </div>
        </div>
      ),
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
      />

      {/* Create / Update Category Card */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-5 sm:p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center">
              {editingCategory ? (
                <Pencil className="w-4 h-4" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
            </div>
            <h2 className="text-base font-bold text-neutral-900">
              {editingCategory ? "Update Category" : "Create New Category"}
            </h2>
          </div>
          {editingCategory && (
            <button
              type="button"
              onClick={handleCancelEdit}
              className="inline-flex items-center gap-1 text-xs text-neutral-500 hover:text-neutral-900 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              Cancel Edit
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Category Name */}
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

            {/* Category Type */}
            <CustomSelect
              label="Category Type"
              value={type}
              onChange={(e) => setType(e.target.value as CategoryType)}
              options={CATEGORY_TYPES}
            />

            {/* Actions */}
            <div className="flex items-end gap-2.5">
              <CustomBtn
                type="submit"
                variant="primary"
                size="md"
                isLoading={isSubmitting}
                className="flex-1"
                leftIcon={
                  editingCategory ? (
                    <Pencil className="w-4 h-4" />
                  ) : (
                    <Plus className="w-4 h-4" />
                  )
                }
              >
                {editingCategory ? "Save Changes" : "Create Category"}
              </CustomBtn>

              {editingCategory && (
                <CustomBtn
                  type="button"
                  variant="secondary"
                  size="md"
                  onClick={handleCancelEdit}
                >
                  Cancel
                </CustomBtn>
              )}
            </div>
          </div>
        </form>
      </div>

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
          emptyMessage="No categories found. Create a new category above."
        />
      </div>

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

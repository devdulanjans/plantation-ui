import { useState, useEffect } from "react";
import ComponentCard from "../common/ComponentCard";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Textarea from "../form/input/TextArea";
import { callApi } from "../../utils/api";
import Swal from "sweetalert2";


type Category = {
  name: string;
  description: string;
};

export default function FirtilizationCategoryComponent() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState<Category>({
    name: "",
    description: "",
  });

  const handleAddCategory = async () => {
    if (!formData.name) {
      Swal.fire({
        icon: "warning",
        title: "Missing Fields",
        text: "Category name is required.",
      });
      return;
    }

    const payload = {
      name: formData.name,
      description: formData.description,
    };

    try {
      const response = await callApi<typeof payload>("/api/fertilizer-category", {
        method: "POST",
        body: payload,
      });
      if (response) {
        Swal.fire({
          icon: "success",
          title: "Saved",
          text: "Fertilizer category has been successfully saved!",
        });
        setCategories([...categories, payload]);
        setFormData({ name: "", description: "" });
      } else {
        Swal.fire({
          icon: "error",
          title: "Failed",
          text: "Category could not be saved.",
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to save category: " + error,
      });
    }
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await callApi<any>("/api/fertilizer-category", { method: "GET" });
        const categoryArray = Array.isArray(response.content) ? response.content : [];
        const mappedCategories = categoryArray.map((item: any) => ({
          name: item.name || "",
          description: item.description || "",
        }));
        setCategories(mappedCategories);
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to load fertilizer categories: " + error,
        });
      }
    };
    fetchCategories();
  }, []);

  return (
    <ComponentCard title="Fertilizer Category Management">
      {/* Form */}
      <div className="border rounded p-4 mb-6 dark:border-gray-700">
        <h2 className="text-lg font-semibold mb-4">Add New Category</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Category Name</Label>
            <Input
              placeholder="e.g. Organic"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div>
            <Label>Description (optional)</Label>
            <Textarea
              placeholder="Description of the category"
              value={formData.description}
              onChange={(value: string) => setFormData({ ...formData, description: value })}
            />
          </div>
        </div>
        <div className="mt-4">
          <button
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            onClick={handleAddCategory}
          >
            Save Category
          </button>
        </div>
      </div>

      {/* Category List Table */}
      <div className="overflow-x-auto mt-6">
        <h3 className="font-semibold mb-2">Fertilizer Categories</h3>
        <table className="min-w-full text-sm text-left border border-gray-200 dark:border-gray-700">
          <thead className="bg-gray-100 dark:bg-dark-800">
            <tr className="text-xs font-semibold text-gray-600 uppercase dark:text-gray-300">
              <th className="px-4 py-2 border-r">Category</th>
              <th className="px-4 py-2">Description</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y dark:divide-gray-700 dark:bg-dark-900">
            {categories.map((category, index) => (
              <tr key={index} className="hover:bg-gray-50 dark:hover:bg-dark-700">
                <td className="px-4 py-2 border-r">{category.name}</td>
                <td className="px-4 py-2">{category.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {categories.length === 0 && (
          <div className="p-4 text-sm text-gray-500 dark:text-gray-400">
            No fertilizer categories found.
          </div>
        )}
      </div>
    </ComponentCard>
  );
}

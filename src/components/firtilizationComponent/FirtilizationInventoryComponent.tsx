import { useState, useEffect } from "react";
import ComponentCard from "../common/ComponentCard";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Select from "../form/Select";
import Textarea from "../form/input/TextArea";
import DatePicker from "../form/date-picker";
import { callApi } from "../../utils/api";
import Swal from "sweetalert2";

type FertilizerItem = {
  name: string;
  category: string;
  quantity: string;
  unit: string;
  supplier?: string;
  expiry?: string;
  notes?: string;
};

export default function FirtilizationInventoryComponent() {
  const [items, setItems] = useState<FertilizerItem[]>([]);
  const [formData, setFormData] = useState<FertilizerItem>({
    name: "",
    category: "",
    quantity: "",
    unit: "kg",
    supplier: "",
    expiry: "",
    notes: "",
  });

  const categories = [
    { value: "Organic", label: "Organic" },
    { value: "Chemical", label: "Chemical" },
    { value: "Bio", label: "Bio Fertilizer" },
  ];

  const units = [
    { value: "kg", label: "Kilogram (kg)" },
    { value: "L", label: "Liter (L)" },
    { value: "bags", label: "Bags" },
  ];

  const handleAdd = async () => {
    if (!formData.name || !formData.category || !formData.quantity || !formData.unit) {
      Swal.fire({
        icon: "warning",
        title: "Missing Fields",
        text: "Please fill all required fields.",
      });
      return;
    }

    const payload = {
      name: formData.name,
      category: formData.category,
      quantity: formData.quantity,
      unit: formData.unit,
      supplier: formData.supplier,
      expiry: formData.expiry,
      notes: formData.notes,
    };

    try {
      const response = await callApi<typeof payload>("/api/fertilizer-inventory", {
        method: "POST",
        body: payload,
      });
      if (response) {
        Swal.fire({
          icon: "success",
          title: "Saved",
          text: "Fertilizer item has been successfully added!",
        });
        setItems([...items, payload]);
        setFormData({
          name: "",
          category: "",
          quantity: "",
          unit: "kg",
          supplier: "",
          expiry: "",
          notes: "",
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Failed",
          text: "Fertilizer item could not be saved.",
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to save fertilizer item: " + error,
      });
    }
  };

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await callApi<any>("/api/fertilizer-inventory", { method: "GET" });
        const itemArray = Array.isArray(response.content) ? response.content : [];
        const mappedItems = itemArray.map((item: any) => ({
          name: item.name || "",
          category: item.category || "",
          quantity: item.quantity || "",
          unit: item.unit || "",
          supplier: item.supplier || "",
          expiry: item.expiry || "",
          notes: item.notes || "",
        }));
        setItems(mappedItems);
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to load fertilizer inventory: " + error,
        });
      }
    };
    fetchItems();
  }, []);

  return (
    <ComponentCard title="Fertilizer Inventory">
      {/* Form */}
      <div className="border rounded p-4 mb-6 dark:border-gray-700">
        <h2 className="text-lg font-semibold mb-4">Add Fertilizer</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label>Fertilizer Name</Label>
            <Input
              placeholder="e.g. NPK 15-15-15"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div>
            <Label>Category</Label>
            <Select
              options={categories}
              placeholder="Select category"
              onChange={(value) => setFormData({ ...formData, category: value })}
            />
          </div>
          <div>
            <Label>Quantity in Stock</Label>
            <Input
              placeholder="e.g. 100"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
            />
          </div>
          <div>
            <Label>Unit</Label>
            <Select
              options={units}
              placeholder="Select unit"
              onChange={(value) => setFormData({ ...formData, unit: value })}
              defaultValue={formData.unit}
            />
          </div>
          <div>
            <Label>Supplier</Label>
            <Input
              placeholder="e.g. Agro Supplier Co."
              value={formData.supplier}
              onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
            />
          </div>
          <div>
            <Label>Expiry Date</Label>
            <DatePicker
              id="expiry-date"
              defaultDate={formData.expiry}
              onChange={(value) => {
                // value is Date[]; take the first date and convert to string
                const dateStr = Array.isArray(value) && value.length > 0
                  ? value[0].toISOString().split("T")[0]
                  : "";
                setFormData({ ...formData, expiry: dateStr });
              }}
              placeholder="Select date"
            />
          </div>
          <div className="md:col-span-3">
            <Label>Notes</Label>
            <Textarea
              placeholder="Any additional notes or storage instructions"
              value={formData.notes}
              onChange={(value: string) => setFormData({ ...formData, notes: value })}
            />
          </div>
        </div>
        <div className="mt-4">
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            onClick={handleAdd}
          >
            Add to Inventory
          </button>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="overflow-x-auto mt-6">
        <h3 className="font-semibold mb-2">Available Fertilizers</h3>
        <table className="min-w-full text-sm text-left border border-gray-200 dark:border-gray-700">
          <thead className="bg-gray-100 dark:bg-dark-800">
            <tr className="text-xs font-semibold text-gray-600 uppercase dark:text-gray-300">
              <th className="px-4 py-2 border-r">Name</th>
              <th className="px-4 py-2 border-r">Category</th>
              <th className="px-4 py-2 border-r">Qty</th>
              <th className="px-4 py-2 border-r">Unit</th>
              <th className="px-4 py-2 border-r">Supplier</th>
              <th className="px-4 py-2 border-r">Expiry</th>
              <th className="px-4 py-2">Notes</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y dark:divide-gray-700 dark:bg-dark-900">
            {items.map((item, index) => (
              <tr key={index} className="hover:bg-gray-50 dark:hover:bg-dark-700">
                <td className="px-4 py-2 border-r">{item.name}</td>
                <td className="px-4 py-2 border-r">{item.category}</td>
                <td className="px-4 py-2 border-r">{item.quantity}</td>
                <td className="px-4 py-2 border-r">{item.unit}</td>
                <td className="px-4 py-2 border-r">{item.supplier}</td>
                <td className="px-4 py-2 border-r">{item.expiry}</td>
                <td className="px-4 py-2">{item.notes}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {items.length === 0 && (
          <div className="p-4 text-sm text-gray-500 dark:text-gray-400">
            No fertilizers in inventory.
          </div>
        )}
      </div>
    </ComponentCard>
  );
}

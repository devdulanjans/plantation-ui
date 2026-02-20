import { useState, useEffect } from "react";
import ComponentCard from "../common/ComponentCard";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Select from "../form/Select";
import Textarea from "../form/input/TextArea";
import DatePicker from "../form/date-picker";
import { callApi } from "../../utils/api";
import Swal from "sweetalert2";


type Pesticide = {
  name: string;
  category: string;
  quantity: string;
  unit: string;
  supplier: string;
  expiry: string;
  notes: string;
};

export default function PestControlActivityComponent() {
  const [items, setItems] = useState<Pesticide[]>([]);
  const [formData, setFormData] = useState<Pesticide>({
    name: "",
    category: "",
    quantity: "",
    unit: "Liters",
    supplier: "",
    expiry: "",
    notes: "",
  });

  const categoryOptions = [
    { value: "Organic", label: "Organic" },
    { value: "Chemical", label: "Chemical" },
    { value: "Biological", label: "Biological" },
  ];

  const unitOptions = [
    { value: "Liters", label: "Liters" },
    { value: "ml", label: "Milliliters" },
    { value: "Bottles", label: "Bottles" },
  ];

  const handleAdd = async () => {
    const { name, category, quantity, unit, supplier, expiry, notes } = formData;
    if (!name || !category || !quantity || !unit) {
      Swal.fire({
        icon: "warning",
        title: "Missing Fields",
        text: "Please fill all required fields.",
      });
      return;
    }

    const payload = {
      name,
      category,
      quantity,
      unit,
      supplier,
      expiry,
      notes,
    };

    try {
      const response = await callApi<typeof payload>("/api/pesticide-inventory", {
        method: "POST",
        body: payload,
      });
      if (response) {
        Swal.fire({
          icon: "success",
          title: "Saved",
          text: "Pesticide item has been successfully added!",
        });
        setItems([...items, payload]);
        setFormData({
          name: "",
          category: "",
          quantity: "",
          unit: "Liters",
          supplier: "",
          expiry: "",
          notes: "",
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Failed",
          text: "Pesticide item could not be saved.",
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to save pesticide item: " + error,
      });
    }
  };

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await callApi<any>("/api/pesticide-inventory", { method: "GET" });
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
          text: "Failed to load pesticide inventory: " + error,
        });
      }
    };
    fetchItems();
  }, []);

  return (
    <ComponentCard title="Pesticide Inventory">
      {/* Form */}
      <div className="border rounded p-4 mb-6 dark:border-gray-700">
        <h2 className="text-lg font-semibold mb-4">Add New Pesticide</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label>Pesticide Name</Label>
            <Input
              placeholder="e.g. Neem Oil"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div>
            <Label>Category</Label>
            <Select
              options={categoryOptions}
              placeholder="Select category"
              onChange={(value) => setFormData({ ...formData, category: value })}
            />
          </div>
          <div>
            <Label>Quantity</Label>
            <Input
              placeholder="e.g. 10"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
            />
          </div>
          <div>
            <Label>Unit</Label>
            <Select
              options={unitOptions}
              placeholder="Select unit"
              defaultValue={formData.unit}
              onChange={(value) => setFormData({ ...formData, unit: value })}
            />
          </div>
          <div>
            <Label>Supplier</Label>
            <Input
              placeholder="e.g. AgriChem Ltd."
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
                // If value is an array (Date[]), pick the first and convert to ISO string
                let expiryStr = "";
                if (Array.isArray(value) && value.length > 0 && value[0] instanceof Date) {
                  expiryStr = value[0].toISOString();
                } else if (value instanceof Date) {
                  expiryStr = value.toISOString();
                } else if (typeof value === "string") {
                  expiryStr = value;
                }
                setFormData({ ...formData, expiry: expiryStr });
              }}
              placeholder="Select date"
            />
          </div>
          <div className="md:col-span-3">
            <Label>Notes</Label>
            <Textarea
              placeholder="Storage notes or warnings"
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

      {/* Table */}
      <div className="overflow-x-auto mt-6">
        <h3 className="font-semibold mb-2">Available Pesticides</h3>
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
            No pesticide inventory records found.
          </div>
        )}
      </div>
    </ComponentCard>
  );
}

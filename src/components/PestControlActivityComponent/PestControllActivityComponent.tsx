import { useState, useEffect } from "react";
import ComponentCard from "../common/ComponentCard";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Select from "../form/Select";
import Textarea from "../form/input/TextArea";
import DatePicker from "../form/date-picker";
import { callApi } from "../../utils/api";
import Swal from "sweetalert2";


type PestControl = {
  location: string;
  pest: string;
  pesticide: string;
  quantity: string;
  method: string;
  date: string;
  performedBy: string;
  notes: string;
};

export default function PestControlActivityComponent() {
  const [records, setRecords] = useState<PestControl[]>([]);
  const [formData, setFormData] = useState<PestControl>({
    location: "",
    pest: "",
    pesticide: "",
    quantity: "",
    method: "Spray",
    date: "",
    performedBy: "",
    notes: "",
  });

  const methods = [
    { value: "Spray", label: "Spray" },
    { value: "Fogging", label: "Fogging" },
    { value: "Drip", label: "Drip Irrigation" },
    { value: "Soil", label: "Soil Injection" },
  ];

  const handleAdd = async () => {
    const { location, pest, pesticide, quantity, method, date, performedBy, notes } = formData;
    if (!location || !pest || !pesticide || !quantity || !method || !date || !performedBy) {
      Swal.fire({
        icon: "warning",
        title: "Missing Fields",
        text: "Please fill all required fields.",
      });
      return;
    }

    const payload = {
      location,
      pest,
      pesticide,
      quantity,
      method,
      date,
      performedBy,
      notes,
    };

    try {
      const response = await callApi<typeof payload>("/api/pest-control", {
        method: "POST",
        body: payload,
      });
      if (response) {
        Swal.fire({
          icon: "success",
          title: "Saved",
          text: "Pest control record has been successfully saved!",
        });
        setRecords([...records, payload]);
        setFormData({
          location: "",
          pest: "",
          pesticide: "",
          quantity: "",
          method: "Spray",
          date: "",
          performedBy: "",
          notes: "",
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Failed",
          text: "Pest control record could not be saved.",
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to save pest control record: " + error,
      });
    }
  };

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const response = await callApi<any>("/api/pest-control", { method: "GET" });
        const recordArray = Array.isArray(response.content) ? response.content : [];
        const mappedRecords = recordArray.map((item: any) => ({
          location: item.location || "",
          pest: item.pest || "",
          pesticide: item.pesticide || "",
          quantity: item.quantity || "",
          method: item.method || "",
          date: item.date || "",
          performedBy: item.performedBy || item.performed_by || "",
          notes: item.notes || "",
        }));
        setRecords(mappedRecords);
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to load pest control records: " + error,
        });
      }
    };
    fetchRecords();
  }, []);

  return (
    <ComponentCard title="Pest Control Activity">
      {/* Form */}
      <div className="border rounded p-4 mb-6 dark:border-gray-700">
        <h2 className="text-lg font-semibold mb-4">Log Pest Control</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label>Location / Asset</Label>
            <Input
              placeholder="e.g. Tree A7, Zone 3"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            />
          </div>
          <div>
            <Label>Pest Name</Label>
            <Input
              placeholder="e.g. Aphids"
              value={formData.pest}
              onChange={(e) => setFormData({ ...formData, pest: e.target.value })}
            />
          </div>
          <div>
            <Label>Pesticide Name</Label>
            <Input
              placeholder="e.g. Neem Oil"
              value={formData.pesticide}
              onChange={(e) => setFormData({ ...formData, pesticide: e.target.value })}
            />
          </div>
          <div>
            <Label>Quantity Applied</Label>
            <Input
              placeholder="e.g. 2 liters"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
            />
          </div>
          <div>
            <Label>Application Method</Label>
            <Select
              options={methods}
              placeholder="Select method"
              className={formData.method}
              onChange={(value) => setFormData({ ...formData, method: value })}
            />
          </div>
          <div>
            <Label>Application Date</Label>
            <DatePicker
              id="application-date"
              defaultDate={formData.date}
              onChange={(value) => {
                // If value is an array (Date[]), take the first date and convert to ISO string
                if (Array.isArray(value) && value.length > 0 && value[0] instanceof Date) {
                  setFormData({ ...formData, date: value[0].toISOString().split("T")[0] });
                } else if (value instanceof Date) {
                  setFormData({ ...formData, date: value.toISOString().split("T")[0] });
                } else if (typeof value === "string") {
                  setFormData({ ...formData, date: value });
                } else {
                  setFormData({ ...formData, date: "" });
                }
              }}
              placeholder="Select date"
            />
          </div>
          <div>
            <Label>Performed By</Label>
            <Input
              placeholder="e.g. Worker A"
              value={formData.performedBy}
              onChange={(e) => setFormData({ ...formData, performedBy: e.target.value })}
            />
          </div>
          <div className="md:col-span-3">
            <Label>Effectiveness / Notes</Label>
            <Textarea
              placeholder="Observed results or comments"
              value={formData.notes}
              onChange={(value: string) => setFormData({ ...formData, notes: value })}
            />
          </div>
        </div>
        <div className="mt-4">
          <button
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            onClick={handleAdd}
          >
            Save Record
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto mt-6">
        <h3 className="font-semibold mb-2">Pest Control Records</h3>
        <table className="min-w-full text-sm text-left border border-gray-200 dark:border-gray-700">
          <thead className="bg-gray-100 dark:bg-dark-800">
            <tr className="text-xs font-semibold text-gray-600 uppercase dark:text-gray-300">
              <th className="px-4 py-2 border-r">Location</th>
              <th className="px-4 py-2 border-r">Pest</th>
              <th className="px-4 py-2 border-r">Pesticide</th>
              <th className="px-4 py-2 border-r">Qty</th>
              <th className="px-4 py-2 border-r">Method</th>
              <th className="px-4 py-2 border-r">Date</th>
              <th className="px-4 py-2 border-r">By</th>
              <th className="px-4 py-2">Notes</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y dark:divide-gray-700 dark:bg-dark-900">
            {records.map((item, index) => (
              <tr key={index} className="hover:bg-gray-50 dark:hover:bg-dark-700">
                <td className="px-4 py-2 border-r">{item.location}</td>
                <td className="px-4 py-2 border-r">{item.pest}</td>
                <td className="px-4 py-2 border-r">{item.pesticide}</td>
                <td className="px-4 py-2 border-r">{item.quantity}</td>
                <td className="px-4 py-2 border-r">{item.method}</td>
                <td className="px-4 py-2 border-r">{item.date}</td>
                <td className="px-4 py-2 border-r">{item.performedBy}</td>
                <td className="px-4 py-2">{item.notes}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {records.length === 0 && (
          <div className="p-4 text-sm text-gray-500 dark:text-gray-400">
            No pest control records found.
          </div>
        )}
      </div>
    </ComponentCard>
  );
}

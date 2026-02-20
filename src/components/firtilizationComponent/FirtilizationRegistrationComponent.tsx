import { useState, useEffect } from "react";
import ComponentCard from "../common/ComponentCard";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Select from "../form/Select";
import Textarea from "../form/input/TextArea";
import DatePicker from "../form/date-picker";
import { callApi } from "../../utils/api";
import Swal from "sweetalert2";


type Fertilization = {
  location: string;
  fertilizerName: string;
  fertilizerType: string;
  quantity: string;
  method: string;
  date: string;
  performedBy: string;
  reason: string;
};

export default function FertilizationRegistrationComponent() {
  const [records, setRecords] = useState<Fertilization[]>([]);
  const [formData, setFormData] = useState<Fertilization>({
    location: "",
    fertilizerName: "",
    fertilizerType: "",
    quantity: "",
    method: "Manual",
    date: "",
    performedBy: "",
    reason: "",
  });

  const fertilizerTypes = [
    { value: "Organic", label: "Organic" },
    { value: "Chemical", label: "Chemical" },
    { value: "Bio", label: "Bio Fertilizer" },
  ];

  const methods = [
    { value: "Manual", label: "Manual" },
    { value: "Sprayed", label: "Sprayed" },
    { value: "Drip", label: "Drip Irrigation" },
    { value: "Foliar", label: "Foliar Application" },
  ];

  const handleAdd = async () => {
    const { location, fertilizerName, fertilizerType, quantity, method, date, performedBy, reason } = formData;
    if (!location || !fertilizerName || !fertilizerType || !quantity || !date || !performedBy) {
      Swal.fire({
        icon: "warning",
        title: "Missing Fields",
        text: "Please fill all required fields.",
      });
      return;
    }

    const payload = {
      location,
      fertilizerName,
      fertilizerType,
      quantity,
      method,
      date,
      performedBy,
      reason,
    };

    try {
      const response = await callApi<typeof payload>("/api/fertilization", {
        method: "POST",
        body: payload,
      });
      if (response) {
        Swal.fire({
          icon: "success",
          title: "Saved",
          text: "Fertilization record has been successfully saved!",
        });
        setRecords([...records, payload]);
        setFormData({
          location: "",
          fertilizerName: "",
          fertilizerType: "",
          quantity: "",
          method: "Manual",
          date: "",
          performedBy: "",
          reason: "",
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Failed",
          text: "Fertilization record could not be saved.",
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to save fertilization record: " + error,
      });
    }
  };

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const response = await callApi<any>("/api/fertilization", { method: "GET" });
        const recordArray = Array.isArray(response.content) ? response.content : [];
        const mappedRecords = recordArray.map((item: any) => ({
          location: item.location || "",
          fertilizerName: item.fertilizerName || item.fertilizer_name || "",
          fertilizerType: item.fertilizerType || item.fertilizer_type || "",
          quantity: item.quantity || "",
          method: item.method || "",
          date: item.date || "",
          performedBy: item.performedBy || item.performed_by || "",
          reason: item.reason || "",
        }));
        setRecords(mappedRecords);
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to load fertilization records: " + error,
        });
      }
    };
    fetchRecords();
  }, []);

  return (
    <ComponentCard title="Fertilization Registration">
      {/* Form */}
      <div className="border rounded p-4 mb-6 dark:border-gray-700">
        <h2 className="text-lg font-semibold mb-4">New Fertilizer Application</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label>Location / Asset</Label>
            <Input
              placeholder="e.g. Mango Tree A12 / Row 4"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            />
          </div>
          <div>
            <Label>Fertilizer Name</Label>
            <Input
              placeholder="e.g. NPK 15-15-15"
              value={formData.fertilizerName}
              onChange={(e) => setFormData({ ...formData, fertilizerName: e.target.value })}
            />
          </div>
          <div>
            <Label>Fertilizer Type</Label>
            <Select
              options={fertilizerTypes}
              placeholder="Select type"
              onChange={(value) => setFormData({ ...formData, fertilizerType: value })}
            />
          </div>
          <div>
            <Label>Quantity (kg/L)</Label>
            <Input
              placeholder="e.g. 5"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
            />
          </div>
          <div>
            <Label>Method</Label>
            <Select
              options={methods}
              placeholder="Select method"
              onChange={(value) => setFormData({ ...formData, method: value })}
              defaultValue={formData.method}
            />
          </div>
          <div>
            <Label>Application Date</Label>
            <DatePicker
              id="application-date"
              defaultDate={formData.date}
              onChange={(value: Date | Date[] | null) => setFormData({ 
                ...formData, 
                date: Array.isArray(value) 
                  ? (value[0] ? value[0].toISOString().slice(0, 10) : "") 
                  : (value instanceof Date ? value.toISOString().slice(0, 10) : "") 
              })}
              placeholder="Select date"
            />
          </div>
          <div>
            <Label>Performed By</Label>
            <Input
              placeholder="e.g. Worker B"
              value={formData.performedBy}
              onChange={(e) => setFormData({ ...formData, performedBy: e.target.value })}
            />
          </div>
          <div className="md:col-span-3">
            <Label>Reason / Notes</Label>
            <Textarea
              placeholder="e.g. Potassium deficiency observed"
              value={formData.reason}
              onChange={(value: string) => setFormData({ ...formData, reason: value })}
            />
          </div>
        </div>
        <div className="mt-4">
          <button
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            onClick={handleAdd}
          >
            Save Fertilization
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto mt-6">
        <h3 className="font-semibold mb-2">Fertilizer Applications</h3>
        <table className="min-w-full text-sm text-left border border-gray-200 dark:border-gray-700">
          <thead className="bg-gray-100 dark:bg-dark-800">
            <tr className="text-xs font-semibold text-gray-600 uppercase dark:text-gray-300">
              <th className="px-4 py-2 border-r">Location</th>
              <th className="px-4 py-2 border-r">Fertilizer</th>
              <th className="px-4 py-2 border-r">Type</th>
              <th className="px-4 py-2 border-r">Qty</th>
              <th className="px-4 py-2 border-r">Method</th>
              <th className="px-4 py-2 border-r">Date</th>
              <th className="px-4 py-2 border-r">By</th>
              <th className="px-4 py-2">Remarks</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y dark:divide-gray-700 dark:bg-dark-900">
            {records.map((item, index) => (
              <tr key={index} className="hover:bg-gray-50 dark:hover:bg-dark-700">
                <td className="px-4 py-2 border-r">{item.location}</td>
                <td className="px-4 py-2 border-r">{item.fertilizerName}</td>
                <td className="px-4 py-2 border-r">{item.fertilizerType}</td>
                <td className="px-4 py-2 border-r">{item.quantity}</td>
                <td className="px-4 py-2 border-r">{item.method}</td>
                <td className="px-4 py-2 border-r">{item.date}</td>
                <td className="px-4 py-2 border-r">{item.performedBy}</td>
                <td className="px-4 py-2">{item.reason}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {records.length === 0 && (
          <div className="p-4 text-sm text-gray-500 dark:text-gray-400">
            No fertilization records found.
          </div>
        )}
      </div>
    </ComponentCard>
  );
}

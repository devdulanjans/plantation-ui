import { useEffect, useState } from "react";
import ComponentCard from "../common/ComponentCard";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Select from "../form/Select";
import Textarea from "../form/input/TextArea";
import DatePicker from "../form/date-picker";
import { callApi } from "../../utils/api";
import Swal from "sweetalert2";

type Amendment = {
  location: string;
  material: string;
  quantity: string;
  method: string;
  date: string;
  performedBy: string;
  reason: string;
  remarks: string;
};

export default function SoilAmendmentComponent() {
  const [amendments, setAmendments] = useState<Amendment[]>([]);
  const [formData, setFormData] = useState<Amendment>({
    location: "",
    material: "",
    quantity: "",
    method: "Manual",
    date: "",
    performedBy: "",
    reason: "",
    remarks: "",
  });

  const materialOptions = [
    { value: "Compost", label: "Compost" },
    { value: "Lime", label: "Lime" },
    { value: "Gypsum", label: "Gypsum" },
    { value: "Organic Manure", label: "Organic Manure" },
    { value: "Other", label: "Other" },
  ];

  const methodOptions = [
    { value: "Manual", label: "Manual" },
    { value: "Sprayed", label: "Sprayed" },
    { value: "Mixed", label: "Mixed into soil" },
  ];

  // GET: Fetch amendment records on mount
  useEffect(() => {
    const fetchAmendments = async () => {
      try {
        const response = await callApi<any>("/api/soil-amendments", { method: "GET" });
        const amendmentArray = Array.isArray(response) ? response : [];
        const mappedAmendments = amendmentArray.map((item: any) => ({
          location: item.location || "",
          material: item.material || "",
          quantity: item.quantity || "",
          method: item.method || "",
          date: item.date || "",
          performedBy: item.performedBy || item.performed_by || "",
          reason: item.reason || "",
          remarks: item.remarks || "",
        }));
        setAmendments(mappedAmendments);
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to load amendment records: " + error,
        });
      }
    };
    fetchAmendments();
  }, []);

  // POST: Save new amendment record
  const handleAddAmendment = async () => {
    const { location, material, quantity, method, date, performedBy, reason, remarks } = formData;
    if (!location || !material || !quantity || !date || !performedBy) {
      Swal.fire({
        icon: "warning",
        title: "Missing Fields",
        text: "Please fill all required fields.",
      });
      return;
    }

    const payload = {
      location,
      material,
      quantity,
      method,
      date,
      performedBy,
      reason,
      remarks,
    };

    try {
      const response = await callApi<typeof payload>("/api/soil-amendments", {
        method: "POST",
        body: payload,
      });
      if (response) {
        Swal.fire({
          icon: "success",
          title: "Amendment Saved",
          text: "Soil amendment record has been successfully saved!",
        });
        setAmendments([...amendments, payload]);
        setFormData({
          location: "",
          material: "",
          quantity: "",
          method: "Manual",
          date: "",
          performedBy: "",
          reason: "",
          remarks: "",
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Failed",
          text: "Amendment record could not be saved.",
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to save amendment record: " + error,
      });
    }
  };

  return (
    <ComponentCard title="Soil Amendment">
      {/* Soil Amendment Form */}
      <div className="border rounded p-4 mb-6 dark:border-gray-700">
        <h2 className="text-lg font-semibold mb-4">New Soil Amendment</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label>Location / Row</Label>
            <Input
              placeholder="e.g. Block B - Row 6"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            />
          </div>
          <div>
            <Label>Material</Label>
            <Select
              options={materialOptions}
              placeholder="Select material"
              onChange={(value) => setFormData({ ...formData, material: value })}
            />
          </div>
          <div>
            <Label>Quantity (kg/L)</Label>
            <Input
              placeholder="e.g. 25"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
            />
          </div>
          <div>
            <Label>Method</Label>
            <Select
              options={methodOptions}
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
              onChange={(value) => {
                // If value is an array (Date[]), take the first date and format as string
                const dateStr = Array.isArray(value) && value.length > 0
                  ? value[0].toISOString().slice(0, 10)
                  : typeof value === "string"
                  ? value
                  : "";
                setFormData({ ...formData, date: dateStr });
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
            <Label>Reason / Notes</Label>
            <Textarea
              placeholder="Optional (e.g. pH imbalance)"
              value={formData.reason}
              onChange={(value: string) => setFormData({ ...formData, reason: value })}
            />
          </div>
        </div>

        <div className="mt-4">
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            onClick={handleAddAmendment}
          >
            Save Amendment
          </button>
        </div>
      </div>

      {/* Table View */}
      <div className="overflow-x-auto mt-6">
        <h3 className="font-semibold mb-2">Amendment Records</h3>
        <table className="min-w-full text-sm text-left border border-gray-200 dark:border-gray-700">
          <thead className="bg-gray-100 dark:bg-dark-800">
            <tr className="text-xs font-semibold text-gray-600 uppercase dark:text-gray-300">
              <th className="px-4 py-2 border-r">Location</th>
              <th className="px-4 py-2 border-r">Material</th>
              <th className="px-4 py-2 border-r">Qty</th>
              <th className="px-4 py-2 border-r">Method</th>
              <th className="px-4 py-2 border-r">Date</th>
              <th className="px-4 py-2 border-r">By</th>
              <th className="px-4 py-2">Reason</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y dark:divide-gray-700 dark:bg-dark-900">
            {amendments.map((item, index) => (
              <tr key={index} className="hover:bg-gray-50 dark:hover:bg-dark-700">
                <td className="px-4 py-2 border-r">{item.location}</td>
                <td className="px-4 py-2 border-r">{item.material}</td>
                <td className="px-4 py-2 border-r">{item.quantity}</td>
                <td className="px-4 py-2 border-r">{item.method}</td>
                <td className="px-4 py-2 border-r">{item.date}</td>
                <td className="px-4 py-2 border-r">{item.performedBy}</td>
                <td className="px-4 py-2">{item.reason}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {amendments.length === 0 && (
          <div className="p-4 text-sm text-gray-500 dark:text-gray-400">
            No amendment records found.
          </div>
        )}
      </div>
    </ComponentCard>
  );
}

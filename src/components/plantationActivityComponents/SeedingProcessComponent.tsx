import { useEffect, useState } from "react";
import ComponentCard from "../common/ComponentCard";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Select from "../form/Select";
import Textarea from "../form/input/TextArea";
import DatePicker from "../form/date-picker";
import { callApi } from "../../utils/api";
import Swal from "sweetalert2";

type Seeding = {
  seedType: string;
  quantity: string;
  field: string;
  seedingDate: string;
  performedBy: string;
  status: string;
  notes: string;
};

export default function SeedingProcessComponent() {
  const [seedings, setSeedings] = useState<Seeding[]>([]);
  const [formData, setFormData] = useState<Seeding>({
    seedType: "",
    quantity: "",
    field: "",
    seedingDate: "",
    performedBy: "",
    status: "Pending",
    notes: "",
  });

  const seedTypes = [
    { value: "Rice", label: "Rice" },
    { value: "Corn", label: "Corn" },
    { value: "Tomato", label: "Tomato" },
    { value: "Custom", label: "Other" },
  ];

  const statusOptions = [
    { value: "Pending", label: "Pending" },
    { value: "Germinated", label: "Germinated" },
    { value: "Failed", label: "Failed" },
  ];

  // GET: Fetch seeding records on mount
  useEffect(() => {
    const fetchSeedings = async () => {
      try {
        const response = await callApi<any>("/api/seeding-process", { method: "GET" });
        const seedingArray = Array.isArray(response) ? response : [];
        const mappedSeedings = seedingArray.map((item: any) => ({
          seedType: item.seedType || item.seed_type || "",
          quantity: item.quantity || "",
          field: item.field || "",
          seedingDate: item.seedingDate || item.seeding_date || "",
          performedBy: item.performedBy || item.performed_by || "",
          status: item.status || "",
          notes: item.notes || "",
        }));
        setSeedings(mappedSeedings);
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to load seeding records: " + error,
        });
      }
    };
    fetchSeedings();
  }, []);

  // POST: Save new seeding record
  const handleAddSeeding = async () => {
    const { seedType, quantity, field, seedingDate, performedBy, status, notes } = formData;
    if (!seedType || !quantity || !field || !seedingDate || !performedBy) {
      Swal.fire({
        icon: "warning",
        title: "Missing Fields",
        text: "Please fill all required fields",
      });
      return;
    }

    const payload = {
      seedType,
      quantity,
      field,
      seedingDate,
      performedBy,
      status,
      notes,
    };

    try {
      const response = await callApi<typeof payload>("/api/seeding-process", {
        method: "POST",
        body: payload,
      });
      if (response) {
        Swal.fire({
          icon: "success",
          title: "Seeding Saved",
          text: "Seeding record has been successfully saved!",
        });
        setSeedings([...seedings, payload]);
        setFormData({
          seedType: "",
          quantity: "",
          field: "",
          seedingDate: "",
          performedBy: "",
          status: "Pending",
          notes: "",
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Failed",
          text: "Seeding record could not be saved.",
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to save seeding record: " + error,
      });
    }
  };

  return (
    <ComponentCard title="Seeding Process">
      {/* Seeding Form */}
      <div className="border rounded p-4 mb-6 dark:border-gray-700">
        <h2 className="text-lg font-semibold mb-4">New Seeding Entry</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label>Seed Type</Label>
            <Select
              options={seedTypes}
              placeholder="Select seed type"
              onChange={(value) => setFormData({ ...formData, seedType: value })}
            />
          </div>
          <div>
            <Label>Quantity (kg/units)</Label>
            <Input
              placeholder="e.g. 20"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
            />
          </div>
          <div>
            <Label>Field / Block</Label>
            <Input
              placeholder="e.g. Block A - Row 3"
              value={formData.field}
              onChange={(e) => setFormData({ ...formData, field: e.target.value })}
            />
          </div>
          <div>
            <Label>Seeding Date</Label>
            <DatePicker
              id="seeding-date"
              defaultDate={formData.seedingDate ? new Date(formData.seedingDate) : undefined}
              onChange={(value) => {
                // If value is an array, take the first date
                const dateObj = Array.isArray(value) ? value[0] : value;
                setFormData({
                  ...formData,
                  seedingDate: dateObj ? dateObj.toISOString().split("T")[0] : "",
                });
              }}
              placeholder="Select Date"
            />
          </div>
          <div>
            <Label>Performed By</Label>
            <Input
              placeholder="e.g. Farmer A"
              value={formData.performedBy}
              onChange={(e) => setFormData({ ...formData, performedBy: e.target.value })}
            />
          </div>
          <div>
            <Label>Status</Label>
            <Select
              options={statusOptions}
              defaultValue={formData.status}
              onChange={(value) => setFormData({ ...formData, status: value })}
            />
          </div>
          <div className="md:col-span-3">
            <Label>Notes / Remarks</Label>
            <Textarea
              placeholder="Optional notes or instructions..."
              value={formData.notes}
              onChange={(value: string) => setFormData({ ...formData, notes: value })}
            />
          </div>
        </div>
        <div className="mt-4">
          <button
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            onClick={handleAddSeeding}
          >
            Save Seeding
          </button>
        </div>
      </div>

      {/* Table View */}
      <div className="overflow-x-auto mt-6">
        <h3 className="font-semibold mb-2">Seeding History</h3>
        <table className="min-w-full text-sm text-left border border-gray-200 dark:border-gray-700">
          <thead className="bg-gray-100 dark:bg-dark-800">
            <tr className="text-xs font-semibold text-gray-600 uppercase dark:text-gray-300">
              <th className="px-4 py-2 border-r">Seed Type</th>
              <th className="px-4 py-2 border-r">Quantity</th>
              <th className="px-4 py-2 border-r">Field</th>
              <th className="px-4 py-2 border-r">Date</th>
              <th className="px-4 py-2 border-r">By</th>
              <th className="px-4 py-2 border-r">Status</th>
              <th className="px-4 py-2">Notes</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y dark:divide-gray-700 dark:bg-dark-900">
            {seedings.map((item, index) => (
              <tr key={index} className="hover:bg-gray-50 dark:hover:bg-dark-700">
                <td className="px-4 py-2 border-r">{item.seedType}</td>
                <td className="px-4 py-2 border-r">{item.quantity}</td>
                <td className="px-4 py-2 border-r">{item.field}</td>
                <td className="px-4 py-2 border-r">{item.seedingDate}</td>
                <td className="px-4 py-2 border-r">{item.performedBy}</td>
                <td className="px-4 py-2 border-r">{item.status}</td>
                <td className="px-4 py-2">{item.notes}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {seedings.length === 0 && (
          <div className="p-4 text-sm text-gray-500 dark:text-gray-400">
            No seeding records found.
          </div>
        )}
      </div>
    </ComponentCard>
  );
}

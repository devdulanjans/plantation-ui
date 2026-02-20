import { useState, useEffect } from "react";
import ComponentCard from "../common/ComponentCard";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Select from "../form/Select";
import DatePicker from "../form/date-picker";
import TextArea from "../form/input/TextArea";
import { callApi } from "../../utils/api";
import Swal from "sweetalert2";


type MonitoringRecord = {
  date: string;
  location: string;
  pest: string;
  level: string;
  count: string;
  staff: string;
  notes: string;
};

export default function PestMonitoringRecordsComponent() {
  const [records, setRecords] = useState<MonitoringRecord[]>([]);
  const [formData, setFormData] = useState<MonitoringRecord>({
    date: "",
    location: "",
    pest: "",
    level: "Low",
    count: "",
    staff: "",
    notes: "",
  });

  const levelOptions = [
    { value: "Low", label: "Low" },
    { value: "Moderate", label: "Moderate" },
    { value: "High", label: "High" },
  ];

  const handleAdd = async () => {
    const { date, location, pest, level, count, staff, notes } = formData;
    if (!date || !location || !pest || !level || !count || !staff) {
      Swal.fire({
        icon: "warning",
        title: "Missing Fields",
        text: "Please fill all required fields.",
      });
      return;
    }

    const payload = {
      date,
      location,
      pest,
      level,
      count,
      staff,
      notes,
    };

    try {
      const response = await callApi<typeof payload>("/api/pest-monitoring", {
        method: "POST",
        body: payload,
      });
      if (response) {
        Swal.fire({
          icon: "success",
          title: "Saved",
          text: "Pest monitoring record has been successfully saved!",
        });
        setRecords([...records, payload]);
        setFormData({
          date: "",
          location: "",
          pest: "",
          level: "Low",
          count: "",
          staff: "",
          notes: "",
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Failed",
          text: "Record could not be saved.",
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to save record: " + error,
      });
    }
  };

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const response = await callApi<any>("/api/pest-monitoring", { method: "GET" });
        const recordArray = Array.isArray(response.content) ? response.content : [];
        const mappedRecords = recordArray.map((item: any) => ({
          date: item.date || "",
          location: item.location || "",
          pest: item.pest || "",
          level: item.level || "",
          count: item.count || "",
          staff: item.staff || "",
          notes: item.notes || "",
        }));
        setRecords(mappedRecords);
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to load pest monitoring records: " + error,
        });
      }
    };
    fetchRecords();
  }, []);

  return (
    <ComponentCard title="Pest Monitoring Records">
      {/* Form Section */}
      <div className="border rounded p-4 mb-6 dark:border-gray-700">
        <h2 className="text-lg font-semibold mb-4">Log Monitoring Observation</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label>Monitoring Date</Label>
            <DatePicker
              id="monitoring-date"
              defaultDate={formData.date}
              onChange={(value) => {
                // If value is a Date object, convert to string
                let dateString = "";
                if (value instanceof Date) {
                  dateString = value.toISOString().split("T")[0];
                } else if (Array.isArray(value) && value[0] instanceof Date) {
                  dateString = value[0].toISOString().split("T")[0];
                } else if (typeof value === "string") {
                  dateString = value;
                }
                setFormData({ ...formData, date: dateString });
              }}
              placeholder="Select date"
            />
          </div>
          <div>
            <Label>Location / Asset</Label>
            <Input
              placeholder="e.g. Tree A3, Zone 1"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            />
          </div>
          <div>
            <Label>Pest Observed</Label>
            <Input
              placeholder="e.g. Mites"
              value={formData.pest}
              onChange={(e) => setFormData({ ...formData, pest: e.target.value })}
            />
          </div>
          <div>
            <Label>Infestation Level</Label>
            <Select
              options={levelOptions}
              defaultValue={formData.level}
              onChange={(value) => setFormData({ ...formData, level: value })}
            />
          </div>
          <div>
            <Label>Number of Affected Plants</Label>
            <Input
              placeholder="e.g. 8"
              value={formData.count}
              onChange={(e) => setFormData({ ...formData, count: e.target.value })}
            />
          </div>
          <div>
            <Label>Inspector / Staff</Label>
            <Input
              placeholder="e.g. Ruwan"
              value={formData.staff}
              onChange={(e) => setFormData({ ...formData, staff: e.target.value })}
            />
          </div>
          <div className="md:col-span-3">
            <Label>Notes / Recommendations</Label>
            <TextArea
              placeholder="Optional notes or suggestions"
              value={formData.notes}
              onChange={(value) => setFormData({ ...formData, notes: typeof value === "string" ? value : "" })}
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

      {/* Table Section */}
      <div className="overflow-x-auto mt-6">
        <h3 className="font-semibold mb-2">Monitoring Records</h3>
        <table className="min-w-full text-sm text-left border border-gray-200 dark:border-gray-700">
          <thead className="bg-gray-100 dark:bg-dark-800">
            <tr className="text-xs font-semibold text-gray-600 uppercase dark:text-gray-300">
              <th className="px-4 py-2 border-r">Date</th>
              <th className="px-4 py-2 border-r">Location</th>
              <th className="px-4 py-2 border-r">Pest</th>
              <th className="px-4 py-2 border-r">Level</th>
              <th className="px-4 py-2 border-r">Affected</th>
              <th className="px-4 py-2 border-r">Staff</th>
              <th className="px-4 py-2">Notes</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y dark:divide-gray-700 dark:bg-dark-900">
            {records.map((item, index) => (
              <tr key={index} className="hover:bg-gray-50 dark:hover:bg-dark-700">
                <td className="px-4 py-2 border-r">{item.date}</td>
                <td className="px-4 py-2 border-r">{item.location}</td>
                <td className="px-4 py-2 border-r">{item.pest}</td>
                <td className="px-4 py-2 border-r">{item.level}</td>
                <td className="px-4 py-2 border-r">{item.count}</td>
                <td className="px-4 py-2 border-r">{item.staff}</td>
                <td className="px-4 py-2">{item.notes}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {records.length === 0 && (
          <div className="p-4 text-sm text-gray-500 dark:text-gray-400">
            No pest monitoring records found.
          </div>
        )}
      </div>
    </ComponentCard>
  );
}

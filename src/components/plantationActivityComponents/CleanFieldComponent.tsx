import { useState, useEffect } from "react";
import ComponentCard from "../common/ComponentCard";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Select from "../form/Select";
import Textarea from "../form/input/TextArea";
import DatePicker from "../form/date-picker";
import { callApi } from "../../utils/api";
import Swal from "sweetalert2";


type CleanTask = {
  location: string;
  cleaningType: string;
  assignedTo: string;
  scheduledDate: string;
  status: string;
  remarks: string;
};

export default function CleanFieldComponent() {
  const [tasks, setTasks] = useState<CleanTask[]>([]);
  const [formData, setFormData] = useState<CleanTask>({
    location: "",
    cleaningType: "",
    assignedTo: "",
    scheduledDate: "",
    status: "New",
    remarks: "",
  });

  // GET: Fetch cleaning tasks on mount
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await callApi<any>("/api/cleaning", { method: "GET" });
        console.log("Fetched cleaning tasks:", response);
        const taskArray = Array.isArray(response.content) ? response.content : [];
        const mappedTasks = taskArray.map((item: any) => ({
          location: item.location || "",
          cleaningType: item.cleaningType || item.cleaning_type || "",
          assignedTo: item.assignedTo || item.assigned_to || "",
          scheduledDate: item.scheduledDate || item.scheduled_date || "",
          status: item.status || "",
          remarks: item.remarks || "",
        }));
        setTasks(mappedTasks);
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to load cleaning tasks: " + error,
        });
      }
    };
    fetchTasks();
  }, []);

  // POST: Save new cleaning task
  const handleAddTask = async () => {
    const { location, cleaningType, assignedTo, scheduledDate, status, remarks } = formData;
    if (!location || !cleaningType || !assignedTo || !scheduledDate) {
      Swal.fire({
        icon: "warning",
        title: "Missing Fields",
        text: "Please fill all required fields.",
      });
      return;
    }

    const payload = {
      location,
      cleaningType,
      assignedTo,
      scheduledDate,
      status,
      remarks,
    };

    try {
      const response = await callApi<typeof payload>("/api/cleaning", {
        method: "POST",
        body: payload,
      });
      if (response) {
        Swal.fire({
          icon: "success",
          title: "Task Saved",
          text: "Cleaning task has been successfully saved!",
        });
        setTasks([...tasks, payload]);
        setFormData({
          location: "",
          cleaningType: "",
          assignedTo: "",
          scheduledDate: "",
          status: "New",
          remarks: "",
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Failed",
          text: "Cleaning task could not be saved.",
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to save cleaning task: " + error,
      });
    }
  };

  const cleaningTypes = [
    { value: "Waste Removal", label: "Waste Removal" },
    { value: "Irrigation Line Clean", label: "Irrigation Line Clean" },
    { value: "Post-Harvest Clean", label: "Post-Harvest Clean" },
    { value: "Tool Sanitization", label: "Tool Sanitization" },
  ];

  const statusOptions = [
    { value: "New", label: "New" },
    { value: "In Progress", label: "In Progress" },
    { value: "Completed", label: "Completed" },
  ];

  return (
    <ComponentCard title="Cleaning Activities">
      {/* Form */}
      <div className="border rounded p-4 mb-6 dark:border-gray-700">
        <h2 className="text-lg font-semibold mb-4">New Clean Task</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label>Location / Area</Label>
            <Input
              placeholder="e.g. Row 3, Section B"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            />
          </div>
          <div>
            <Label>Cleaning Type</Label>
            <Select
              options={cleaningTypes}
              placeholder="Select type"
              onChange={(value) => setFormData({ ...formData, cleaningType: value })}
            />
          </div>
          <div>
            <Label>Assigned To</Label>
            <Input
              placeholder="e.g. Worker X"
              value={formData.assignedTo}
              onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
            />
          </div>
          <div>
            <Label>Scheduled Date</Label>
            <DatePicker
              id="scheduled-date"
              defaultDate={formData.scheduledDate}
              onChange={(value) => {
                // If value is an array (Date[]), pick the first date and format as string
                let dateStr = "";
                if (Array.isArray(value)) {
                  dateStr = value[0] ? value[0].toISOString().split("T")[0] : "";
                } else if (value && (value as any) instanceof Date) {
                  dateStr = (value as Date).toISOString().split("T")[0];
                } else if (typeof value === "string") {
                  dateStr = value;
                }
                setFormData({ ...formData, scheduledDate: dateStr });
              }}
              placeholder="Select date"
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
            <Label>Remarks</Label>
            <Textarea
              placeholder="e.g. Remove dry leaves, check for drainage clog"
              value={formData.remarks}
              onChange={(value: string) => setFormData({ ...formData, remarks: value })}
            />
          </div>
        </div>
        <div className="mt-4">
          <button
            className="px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700"
            onClick={handleAddTask}
          >
            Save Clean Task
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto mt-6">
        <h3 className="font-semibold mb-2">Clean Task Records</h3>
        <table className="min-w-full text-sm text-left border border-gray-200 dark:border-gray-700">
          <thead className="bg-gray-100 dark:bg-dark-800">
            <tr className="text-xs font-semibold text-gray-600 uppercase dark:text-gray-300">
              <th className="px-4 py-2 border-r">Location</th>
              <th className="px-4 py-2 border-r">Type</th>
              <th className="px-4 py-2 border-r">Assigned To</th>
              <th className="px-4 py-2 border-r">Date</th>
              <th className="px-4 py-2 border-r">Status</th>
              <th className="px-4 py-2">Remarks</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y dark:divide-gray-700 dark:bg-dark-900">
            {tasks.map((task, index) => (
              <tr key={index} className="hover:bg-gray-50 dark:hover:bg-dark-700">
                <td className="px-4 py-2 border-r">{task.location}</td>
                <td className="px-4 py-2 border-r">{task.cleaningType}</td>
                <td className="px-4 py-2 border-r">{task.assignedTo}</td>
                <td className="px-4 py-2 border-r">{task.scheduledDate}</td>
                <td className="px-4 py-2 border-r">{task.status}</td>
                <td className="px-4 py-2">{task.remarks}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {tasks.length === 0 && (
          <div className="p-4 text-sm text-gray-500 dark:text-gray-400">
            No cleaning tasks found.
          </div>
        )}
      </div>
    </ComponentCard>
  );
}


import { useState, useEffect } from "react";
import ComponentCard from "../common/ComponentCard";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Select from "../form/Select";
import Textarea from "../form/input/TextArea";
import DatePicker from "../form/date-picker";
import Swal from "sweetalert2";
import { callApi } from "../../utils/api"; // Adjust the import based on your project structure


type FieldWork = {
  taskType: string;
  location: string;
  assignedTo: string;
  scheduledDate: string;
  status: string;
  remarks: string;
};

export default function FieldWorkComponent() {
  const [fieldWorks, setFieldWorks] = useState<FieldWork[]>([]);
  const [fieldWorkForm, setFieldWorkForm] = useState<FieldWork>({
    taskType: "",
    location: "",
    assignedTo: "",
    scheduledDate: "",
    status: "Pending",
    remarks: "",
  });

  const taskTypes = [
    { value: "Irrigation", label: "Irrigation" },
    { value: "Weeding", label: "Weeding" },
    { value: "Plowing", label: "Plowing" },
    { value: "Fertilizing", label: "Fertilizing" },
    { value: "Spraying", label: "Pesticide Spraying" },
  ];

  const statusOptions = [
    { value: "New", label: "New" },
    { value: "In Progress", label: "In Progress" },
    { value: "Completed", label: "Completed" },
  ];

  const handleAddFieldWork = async () => {
    const { taskType, location, assignedTo, scheduledDate, status, remarks } = fieldWorkForm;
    if (!taskType || !location || !assignedTo || !scheduledDate) {
      Swal.fire({
        icon: "warning",
        title: "Missing Fields",
        text: "Please fill all required fields.",
      });
      return;
    }

    const payload = {
      taskType,
      location,
      assignedTo,
      scheduledDate,
      status,
      remarks,
    };

    try {
      const response = await callApi<typeof payload>("/api/field-work", {
        method: "POST",
        body: payload,
      });
      if (response) {
        Swal.fire({
          icon: "success",
          title: "Field Work Saved",
          text: "Field work record has been successfully saved!",
        });
        setFieldWorks([...fieldWorks, payload]);
        setFieldWorkForm({
          taskType: "",
          location: "",
          assignedTo: "",
          scheduledDate: "",
          status: "Pending",
          remarks: "",
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Failed",
          text: "Field work record could not be saved.",
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to save field work record: " + error,
      });
    }
  };

  useEffect(() => {
    const fetchFieldWorks = async () => {
      try {
        const response = await callApi<any>("/api/field-work", { method: "GET" });
        console.log("Fetched Field Works:", response);
        const fieldWorkArray = Array.isArray(response.content) ? response.content : [];
        const mappedFieldWorks = fieldWorkArray.map((item: any) => ({
          taskType: item.taskType || item.task_type || "",
          location: item.location || "",
          assignedTo: item.assignedTo || item.assigned_to || "",
          scheduledDate: item.scheduledDate || item.scheduled_date || "",
          status: item.status || "",
          remarks: item.remarks || "",
        }));
        setFieldWorks(mappedFieldWorks);
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to load field work records: " + error,
        });
      }
    };
    fetchFieldWorks();
  }, []);

  return (
    <ComponentCard title="Field Work">
      {/* Task Entry Form */}
      <div className="border rounded p-4 mb-6 dark:border-gray-700">
        <h2 className="text-lg font-semibold mb-4">New Field Work Task</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label>Task Type</Label>
            <Select
              options={taskTypes}
              placeholder="Select task"
              onChange={(value) => setFieldWorkForm({ ...fieldWorkForm, taskType: value })}
            />
          </div>
          <div>
            <Label>Location / Row</Label>
            <Input
              placeholder="e.g. Block A - Row 2"
              value={fieldWorkForm.location}
              onChange={(e) => setFieldWorkForm({ ...fieldWorkForm, location: e.target.value })}
            />
          </div>
          <div>
            <Label>Assigned To</Label>
            <Input
              placeholder="e.g. Worker B"
              value={fieldWorkForm.assignedTo}
              onChange={(e) => setFieldWorkForm({ ...fieldWorkForm, assignedTo: e.target.value })}
            />
          </div>
          <div>
            <Label>Scheduled Date</Label>
            <DatePicker
              id="scheduled-date"
              defaultDate={fieldWorkForm.scheduledDate}
              onChange={(value) => {
                // If value is an array, take the first date, else use value directly
                let dateValue: string = "";
                if (Array.isArray(value) && value.length > 0 && value[0] instanceof Date) {
                  dateValue = value[0].toISOString().split("T")[0];
                } else if (value instanceof Date) {
                  dateValue = value.toISOString().split("T")[0];
                } else if (typeof value === "string") {
                  dateValue = value;
                }
                setFieldWorkForm({ ...fieldWorkForm, scheduledDate: dateValue });
              }}
              placeholder="Select date"
            />
          </div>
          <div>
            <Label>Status</Label>
            <Select
              options={statusOptions}
              defaultValue={fieldWorkForm.status}
              onChange={(value) => setFieldWorkForm({ ...fieldWorkForm, status: value })}
            />
          </div>
          <div className="md:col-span-3">
            <Label>Remarks</Label>
            <Textarea
              placeholder="e.g. Use new sprayer, start early morning"
              value={fieldWorkForm.remarks}
              onChange={(value: string) => setFieldWorkForm({ ...fieldWorkForm, remarks: value })}
            />
          </div>
        </div>
        <div className="mt-4">
          <button
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
            onClick={handleAddFieldWork}
          >
            Save Task
          </button>
        </div>
      </div>

      {/* Task List Table */}
      <div className="overflow-x-auto mt-6">
        <h3 className="font-semibold mb-2">All Field Work Tasks</h3>
        <table className="min-w-full text-sm text-left border border-gray-200 dark:border-gray-700">
          <thead>
            <tr>
              <th className="px-4 py-2 border-r">Task Type</th>
              <th className="px-4 py-2 border-r">Location</th>
              <th className="px-4 py-2 border-r">Assigned To</th>
              <th className="px-4 py-2 border-r">Scheduled Date</th>
              <th className="px-4 py-2 border-r">Status</th>
              <th className="px-4 py-2">Remarks</th>
            </tr>
          </thead>
          <tbody>
            {fieldWorks.map((item, idx) => (
              <tr key={idx}>
                <td className="px-4 py-2 border-r">{item.taskType}</td>
                <td className="px-4 py-2 border-r">{item.location}</td>
                <td className="px-4 py-2 border-r">{item.assignedTo}</td>
                <td className="px-4 py-2 border-r">{item.scheduledDate}</td>
                <td className="px-4 py-2 border-r">{item.status}</td>
                <td className="px-4 py-2">{item.remarks}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {fieldWorks.length === 0 && (
          <div className="p-4 text-sm text-gray-500 dark:text-gray-400">
            No tasks found.
          </div>
        )}
      </div>
    </ComponentCard>
  );
}

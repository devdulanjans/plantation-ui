import { useState, useEffect } from "react";
import ComponentCard from "../common/ComponentCard";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Select from "../form/Select";
import DatePicker from "../form/date-picker";
import TextArea from "../form/input/TextArea";
import { callApi } from "../../utils/api";
import Swal from "sweetalert2";

type PruningRecord = {
  assetCode: string;
  pruningDate: string;
  performedBy: string;
  remarks: string;
  nextPruningDate: string;
  status: string;
  createdAt?: string;
};

export default function PruningAllocationComponent() {
  const [prunings, setPrunings] = useState<PruningRecord[]>([]);
  const [formData, setFormData] = useState<PruningRecord>({
    assetCode: "",
    pruningDate: "",
    performedBy: "",
    remarks: "",
    nextPruningDate: "",
    status: "Completed",
  });

  const [searchTerm, setSearchTerm] = useState("");

  const assetOptions = [
    { value: "TREE-001", label: "Mango Tree - TREE-001" },
    { value: "TREE-002", label: "Banana Tree - TREE-002" },
  ];

  const statusOptions = [
    { value: "Completed", label: "Completed" },
    { value: "Pending", label: "Pending" },
  ];

  useEffect(() => {
    const fetchPrunings = async () => {
      try {
        const response = await callApi<any>("/api/pruning-allocation", { method: "GET" });
        // If response.data is the array
        const pruneArray = Array.isArray(response) ? response : [];
        const mappedPrunings = pruneArray.map((item: any) => ({
          assetCode: item.assetCode || item.asset_code || "",
          pruningDate: item.pruningDate || item.pruning_date || "",
          performedBy: item.performedBy || item.performed_by || "",
          remarks: item.remarks || "",
          nextPruningDate: item.nextPruningDate || item.next_pruning_date || "",
          status: item.status || "",
          createdAt: item.createdAt || item.created_at || "",
        }));
        setPrunings(mappedPrunings);
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to load pruning records: " + error,
        });
      }
    };
    fetchPrunings();
  }, []);

  const handleAllocatePruning = async () => {
    if (!formData.assetCode || !formData.pruningDate || !formData.performedBy) {
      Swal.fire({
        icon: "warning",
        title: "Missing Fields",
        text: "Please fill required fields",
      });
      return;
    }

    const payload = {
      assetCode: formData.assetCode,
      pruningDate: formData.pruningDate,
      performedBy: formData.performedBy,
      remarks: formData.remarks,
      nextPruningDate: formData.nextPruningDate,
      status: formData.status,
    };

    try {
      const response = await callApi<typeof payload>("/api/pruning-allocation", {
        method: "POST",
        body: payload,
      });
      if (response) {
        Swal.fire({
          icon: "success",
          title: "Pruning Record Saved",
          text: "Pruning record has been successfully saved!",
        });
        setPrunings([...prunings, formData]);
        setFormData({
          assetCode: "",
          pruningDate: "",
          performedBy: "",
          remarks: "",
          nextPruningDate: "",
          status: "Completed",
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Failed",
          text: "Pruning record could not be saved.",
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to save pruning record: " + error,
      });
    }
  };

  const filteredPrunings = prunings.filter((p) =>
    p.assetCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <ComponentCard title="Pruning Allocation">
      {/* Form Section */}
      <div className="border rounded p-4 mb-6 dark:border-gray-700">
        <h2 className="text-lg font-semibold mb-4">New Pruning Record</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label>Asset Code</Label>
            <Select
              options={assetOptions}
              placeholder="Select Tree"
              onChange={(value) => setFormData({ ...formData, assetCode: value })}
            />
          </div>
          <div>
            <Label>Pruning Date</Label>
            <DatePicker
              id="pruning-date"
              defaultDate={formData.pruningDate}
              onChange={(value) => {
                // If value is an array, take the first date; otherwise, use value directly
                const date =
                  Array.isArray(value) ? value[0] : value;
                setFormData({
                  ...formData,
                  pruningDate: date
                    ? (date instanceof Date
                        ? date.toISOString().slice(0, 10)
                        : date)
                    : "",
                });
              }}
              placeholder="Select Date"
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
          <div className="md:col-span-2">
            <Label>Remarks</Label>
            <TextArea
              placeholder="Optional pruning details..."
              value={formData.remarks}
              onChange={(value: string) => setFormData({ ...formData, remarks: value })}
            />
          </div>
          <div>
            <Label>Next Pruning Date</Label>
            <DatePicker
              id="next-pruning-date"
              defaultDate={formData.nextPruningDate}
              onChange={(value) => {
                const date =
                  Array.isArray(value) ? value[0] : value;
                setFormData({
                  ...formData,
                  nextPruningDate: date
                    ? (date instanceof Date
                        ? date.toISOString().slice(0, 10)
                        : date)
                    : "",
                });
              }}
              placeholder="Select Date"
            />
          </div>
          <div>
            <Label>Status</Label>
            <Select
              options={statusOptions}
              onChange={(value) => setFormData({ ...formData, status: value })}
              defaultValue={formData.status}
            />
          </div>
        </div>
        <div className="mt-4">
          <button
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            onClick={handleAllocatePruning}
          >
            Save Pruning Record
          </button>
        </div>
      </div>

      {/* Search Filter */}
      <div className="mb-4">
        <Label>Search by Asset Code</Label>
        <Input
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Table View */}
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-left border border-gray-200 dark:border-gray-700">
          <thead className="bg-gray-100 dark:bg-dark-800">
            <tr className="text-xs font-semibold text-gray-600 uppercase dark:text-gray-300">
              <th className="px-4 py-2 border-r">Asset Code</th>
              <th className="px-4 py-2 border-r">Pruning Date</th>
              <th className="px-4 py-2 border-r">Performed By</th>
              <th className="px-4 py-2 border-r">Next Pruning</th>
              <th className="px-4 py-2 border-r">Status</th>
              <th className="px-4 py-2 border-r">Remarks</th>
              <th className="px-4 py-2">Created At</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y dark:divide-gray-700 dark:bg-dark-900">
            {filteredPrunings.map((prune, index) => (
              <tr key={index} className="hover:bg-gray-50 dark:hover:bg-dark-700">
                <td className="px-4 py-2 border-r">{prune.assetCode}</td>
                <td className="px-4 py-2 border-r">{prune.pruningDate}</td>
                <td className="px-4 py-2 border-r">{prune.performedBy}</td>
                <td className="px-4 py-2 border-r">{prune.nextPruningDate}</td>
                <td className="px-4 py-2 border-r">{prune.status}</td>
                <td className="px-4 py-2 border-r">{prune.remarks}</td>
                <td className="px-4 py-2">{prune.createdAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredPrunings.length === 0 && (
          <div className="p-4 text-sm text-gray-500 dark:text-gray-400">
            No pruning records found.
          </div>
        )}
      </div>
    </ComponentCard>
  );
}

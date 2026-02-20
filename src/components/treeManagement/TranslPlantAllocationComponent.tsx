import { useState, useEffect } from "react";
import ComponentCard from "../common/ComponentCard";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Textarea from "../form/input/TextArea";
import Select from "../form/Select";
import DatePicker from "../form/date-picker";
import { callApi } from "../../utils/api";
import Swal from "sweetalert2";

type Transplant = {
  assetCode: string;
  sourceLocation: string;
  targetLocation: string;
  transplantDate: string;
  performedBy: string;
  reason: string;
  status: string;
};

export default function TranslPlantAllocationComponent() {
  const [transplants, setTransplants] = useState<Transplant[]>([]);
  const [formData, setFormData] = useState<Transplant>({
    assetCode: "",
    sourceLocation: "",
    targetLocation: "",
    transplantDate: "",
    performedBy: "",
    reason: "",
    status: "Completed",
  });

  const [searchTerm, setSearchTerm] = useState("");

  const assetOptions = [
    { value: "TREE-001", label: "Mango Tree - TREE-001" },
    { value: "PLANT-005", label: "Tomato Plant - PLANT-005" },
  ];

  const statusOptions = [
    { value: "Completed", label: "Completed" },
    { value: "Pending", label: "Pending" },
  ];

  // GET: Fetch transplant records on mount
  useEffect(() => {
    const fetchTransplants = async () => {
      try {
        const response = await callApi<any>("/api/transplant-allocation", { method: "GET" });
        const transplantArray = Array.isArray(response) ? response : [];
        const mappedTransplants = transplantArray.map((item: any) => ({
          assetCode: item.assetCode || item.asset_code || "",
          sourceLocation: item.sourceLocation || item.source_location || "",
          targetLocation: item.targetLocation || item.target_location || "",
          transplantDate: item.transplantDate || item.transplant_date || "",
          performedBy: item.performedBy || item.performed_by || "",
          reason: item.reason || "",
          status: item.status || "",
        }));
        setTransplants(mappedTransplants);
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to load transplant records: " + error,
        });
      }
    };
    fetchTransplants();
  }, []);

  // POST: Save new transplant record
  const handleAllocateTransplant = async () => {
    const { assetCode, sourceLocation, targetLocation, transplantDate, performedBy, status, reason } = formData;
    if (!assetCode || !sourceLocation || !targetLocation || !transplantDate || !performedBy) {
      Swal.fire({
        icon: "warning",
        title: "Missing Fields",
        text: "Please fill all required fields",
      });
      return;
    }

    const payload = {
      assetCode,
      sourceLocation,
      targetLocation,
      transplantDate,
      performedBy,
      status,
      reason,
    };

    try {
      const response = await callApi<typeof payload>("/api/transplant-allocation", {
        method: "POST",
        body: payload,
      });
      if (response) {
        Swal.fire({
          icon: "success",
          title: "Transplant Saved",
          text: "Transplant record has been successfully saved!",
        });
        setTransplants([...transplants, payload]);
        setFormData({
          assetCode: "",
          sourceLocation: "",
          targetLocation: "",
          transplantDate: "",
          performedBy: "",
          reason: "",
          status: "Completed",
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Failed",
          text: "Transplant record could not be saved.",
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to save transplant record: " + error,
      });
    }
  };

  const filteredTransplants = transplants.filter((item) =>
    item.assetCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <ComponentCard title="Transplant Allocation">
      {/* Form */}
      <div className="border rounded p-4 mb-6 dark:border-gray-700">
        <h2 className="text-lg font-semibold mb-4">New Transplant Entry</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label>Asset Code</Label>
            <Select
              options={assetOptions}
              placeholder="Select Asset"
              onChange={(value) => setFormData({ ...formData, assetCode: value })}
            />
          </div>
          <div>
            <Label>Source Location</Label>
            <Input
              placeholder="e.g. Block A - Row 2"
              value={formData.sourceLocation}
              onChange={(e) => setFormData({ ...formData, sourceLocation: e.target.value })}
            />
          </div>
          <div>
            <Label>Target Location</Label>
            <Input
              placeholder="e.g. Block C - Row 5"
              value={formData.targetLocation}
              onChange={(e) => setFormData({ ...formData, targetLocation: e.target.value })}
            />
          </div>
          <div>
            <Label>Transplant Date</Label>
            <DatePicker
              id="transplant-date"
              defaultDate={formData.transplantDate}
              onChange={(value) => {
                // If value is an array, take the first date; otherwise, use value directly
                let dateStr = "";
                if (Array.isArray(value)) {
                  dateStr = value[0] && typeof value[0] === "object" && value[0] !== null && "toISOString" in value[0]
                    ? (value[0] as Date).toISOString().slice(0, 10)
                    : "";
                } else if (typeof value === "object" && value !== null && "toISOString" in value) {
                  dateStr = (value as Date).toISOString().slice(0, 10);
                } else if (typeof value === "string") {
                  dateStr = value;
                }
                setFormData({ ...formData, transplantDate: dateStr });
              }}
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
          <div>
            <Label>Status</Label>
            <Select
              options={statusOptions}
              onChange={(value) => setFormData({ ...formData, status: value })}
              defaultValue={formData.status}
            />
          </div>
          <div className="md:col-span-3">
            <Label>Reason (Optional)</Label>
            <Textarea
              placeholder="e.g. Moved to improve growth conditions"
              value={formData.reason}
              onChange={(value: string) => setFormData({ ...formData, reason: value })}
            />
          </div>
        </div>

        <div className="mt-4">
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            onClick={handleAllocateTransplant}
          >
            Save Transplant
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="mb-4">
        <Label>Search by Asset Code</Label>
        <Input
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-left border border-gray-200 dark:border-gray-700">
          <thead className="bg-gray-100 dark:bg-dark-800">
            <tr className="text-xs font-semibold text-gray-600 uppercase dark:text-gray-300">
              <th className="px-4 py-2 border-r">Asset Code</th>
              <th className="px-4 py-2 border-r">Source</th>
              <th className="px-4 py-2 border-r">Target</th>
              <th className="px-4 py-2 border-r">Date</th>
              <th className="px-4 py-2 border-r">By</th>
              <th className="px-4 py-2 border-r">Status</th>
              <th className="px-4 py-2">Reason</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y dark:divide-gray-700 dark:bg-dark-900">
            {filteredTransplants.map((trans, index) => (
              <tr key={index} className="hover:bg-gray-50 dark:hover:bg-dark-700">
                <td className="px-4 py-2 border-r">{trans.assetCode}</td>
                <td className="px-4 py-2 border-r">{trans.sourceLocation}</td>
                <td className="px-4 py-2 border-r">{trans.targetLocation}</td>
                <td className="px-4 py-2 border-r">{trans.transplantDate}</td>
                <td className="px-4 py-2 border-r">{trans.performedBy}</td>
                <td className="px-4 py-2 border-r">{trans.status}</td>
                <td className="px-4 py-2">{trans.reason}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredTransplants.length === 0 && (
          <div className="p-4 text-sm text-gray-500 dark:text-gray-400">No transplant records found.</div>
        )}
      </div>
    </ComponentCard>
  );
}

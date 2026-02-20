import { useState, useEffect } from "react";
import ComponentCard from "../common/ComponentCard";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Select from "../form/Select";
// import DatePicker from "react-datepicker";

import DatePicker from "../form/date-picker";
import { v4 as uuidv4 } from "uuid";
import { callApi } from "../../utils/api"; // Adjust path as needed
import Swal from "sweetalert2"; // For alerts

type QrAllocation = {
  assetCode: string;
  qrCode: string;
  allocationDate: string;
  assignedBy: string;
  status: string;
};

type QrStatusRecord = {
  assetCode: string;
  qrCode: string;
  allocationDate: string;
  assignedBy: string;
  status: string;
};

export default function QRAllocationComponent() {
  const [qrAllocations, setQrAllocations] = useState<QrAllocation[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [formData, setFormData] = useState({
    assetCode: "",
    qrCode: "",
    allocationDate: "",
    assignedBy: "",
    status: "active",
  });

  // Add state for status records
  const [qrStatusRecords, setQrStatusRecords] = useState<QrStatusRecord[]>([]);

  // You can dynamically fetch this from your DB
  const assetOptions = [
    { value: "TREE-001", label: "Mango Tree - TREE-001" },
    { value: "TREE-002", label: "Banana Tree - TREE-002" },
  ];

  const statusOptions = [
    { value: "active", label: "Active" },
    { value: "cancelled", label: "Cancelled" },
  ];

  const handleGenerateQR = () => {
    const generatedQR = uuidv4();
    setFormData({ ...formData, qrCode: generatedQR });
  };

  // Fetch allocations from API on mount
  useEffect(() => {
    fetchAllocations();
  }, []);

  // Fetch status records on mount
  useEffect(() => {
    const fetchStatusRecords = async () => {
      try {
        const response = await callApi<any>("/api/qr-allocations/status/all", { method: "GET" });
        const statusArray = Array.isArray(response) ? response : [];
        const mappedStatus = statusArray.map((item: any) => ({
          assetCode: item.assetCode || item.asset_code || "",
          qrCode: item.qrCode || item.qr_code || "",
          allocationDate: item.allocationDate || item.allocation_date || "",
          assignedBy: item.assignedBy || item.assigned_by || "",
          status: item.status || "",
        }));
        setQrStatusRecords(mappedStatus);
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to load QR status records: " + error,
        });
      }
    };
    fetchStatusRecords();
  }, []);

  const fetchAllocations = async () => {
    try {
      const response = await callApi<any>("/api/qr-allocations", { method: "GET" });
      const allocationArray = Array.isArray(response) ? response : [];
      const mappedAllocations = allocationArray.map((item: any) => ({
        assetCode: item.assetCode || item.asset_code || "",
        qrCode: item.qrCode || item.qr_code || "",
        allocationDate: item.allocationDate || item.allocation_date || "",
        assignedBy: item.assignedBy || item.assigned_by || "",
        status: item.status || "",
      }));
      setQrAllocations(mappedAllocations);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to load QR allocations: " + error,
      });
    }
  };

  // POST: Allocate QR
  const handleAllocateQR = async () => {
    if (!formData.assetCode || !formData.qrCode || !formData.allocationDate || !formData.assignedBy) {
      Swal.fire({
        icon: "warning",
        title: "Missing Fields",
        text: "Please fill all required fields",
      });
      return;
    }

    const payload = {
      entityType: "tree",
      entityCode: formData.assetCode,
      qrCode: formData.qrCode,
      allocationDate: formData.allocationDate,
      assignedBy: formData.assignedBy,
      status: formData.status,
    };

    try {
      const response = await callApi<typeof payload>("/api/qr-allocations", {
        method: "POST",
        body: payload,
      });
      if (response) {
        Swal.fire({
          icon: "success",
          title: "QR Allocated",
          text: "QR has been successfully allocated!",
        });
        fetchAllocations(); // <-- Refresh table data
        setFormData({
          assetCode: "",
          qrCode: "",
          allocationDate: "",
          assignedBy: "",
          status: "active",
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Failed",
          text: "QR could not be allocated.",
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to allocate QR: " + error,
      });
    }
  };

  const filteredAllocations = qrAllocations.filter((item) =>
    item.assetCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <ComponentCard title="QR Allocation">
      {/* Form */}
      <div className="mb-8 border rounded p-4 dark:border-gray-700">
        <h2 className="text-lg font-semibold mb-4">Assign QR to Tree</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <Label>Asset Code</Label>
            <Select
              options={assetOptions}
              placeholder="Select Asset"
              onChange={(value) => setFormData({ ...formData, assetCode: value })}
            />
          </div>
          <div>
            <Label>QR Code</Label>
            <div className="flex gap-2">
              <Input value={formData.qrCode} disabled />
              <button
                className="px-2 py-1 text-xs bg-blue-600 text-white rounded"
                onClick={handleGenerateQR}
              >
                Generate
              </button>
            </div>
          </div>
          <div>
            <Label>Allocation Date</Label>
            <DatePicker
              id="allocation-date"
              defaultDate={
                formData.allocationDate
              }
              onChange={(value) => {
                // If value is an array, take the first date and convert to ISO string
                let dateStr = "";
                if (Array.isArray(value) && value.length > 0 && value[0] instanceof Date) {
                  dateStr = value[0].toISOString().split("T")[0];
                } else if (value instanceof Date) {
                  dateStr = value.toISOString().split("T")[0];
                } else if (typeof value === "string") {
                  dateStr = value;
                }
                setFormData({ ...formData, allocationDate: dateStr });
              }}
              placeholder="Select Date"
            />
          </div>
          <div>
            <Label>Assigned By</Label>
            <Input
              placeholder="e.g. Farmer John"
              value={formData.assignedBy}
              onChange={(e) => setFormData({ ...formData, assignedBy: e.target.value })}
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
        </div>
        <div className="mt-4">
          <button
            className="px-4 py-2 text-white bg-green-600 rounded hover:bg-green-700"
            onClick={handleAllocateQR}
          >
            Allocate QR
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
              <th className="px-4 py-2 border-r">QR Code</th>
              <th className="px-4 py-2 border-r">Date</th>
              <th className="px-4 py-2 border-r">Assigned By</th>
              <th className="px-4 py-2 border-r">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y dark:divide-gray-700 dark:bg-dark-900">
            {filteredAllocations.map((alloc, index) => (
              <tr key={index} className="hover:bg-gray-50 dark:hover:bg-dark-700">
                <td className="px-4 py-2 border-r">{alloc.assetCode}</td>
                <td className="px-4 py-2 border-r">{alloc.qrCode}</td>
                <td className="px-4 py-2 border-r">{alloc.allocationDate}</td>
                <td className="px-4 py-2 border-r">{alloc.assignedBy}</td>
                <td className="px-4 py-2 border-r">{alloc.status}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredAllocations.length === 0 && (
          <div className="p-4 text-sm text-gray-500 dark:text-gray-400">No allocations found.</div>
        )}
      </div>

      {/* QR Status Table */}
      <div className="mt-8">
        <h3 className="font-semibold mb-2">All QR Status Records</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left border border-gray-200 dark:border-gray-700">
            <thead className="bg-gray-100 dark:bg-dark-800">
              <tr className="text-xs font-semibold text-gray-600 uppercase dark:text-gray-300">
                <th className="px-4 py-2 border-r">Asset Code</th>
                <th className="px-4 py-2 border-r">QR Code</th>
                <th className="px-4 py-2 border-r">Date</th>
                <th className="px-4 py-2 border-r">Assigned By</th>
                <th className="px-4 py-2 border-r">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y dark:divide-gray-700 dark:bg-dark-900">
              {qrStatusRecords.map((record, idx) => (
                <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-dark-700">
                  <td className="px-4 py-2 border-r">{record.assetCode}</td>
                  <td className="px-4 py-2 border-r">{record.qrCode}</td>
                  <td className="px-4 py-2 border-r">{record.allocationDate}</td>
                  <td className="px-4 py-2 border-r">{record.assignedBy}</td>
                  <td className="px-4 py-2 border-r">{record.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {qrStatusRecords.length === 0 && (
            <div className="p-4 text-sm text-gray-500 dark:text-gray-400">No QR status records found.</div>
          )}
        </div>
      </div>
    </ComponentCard>
  );
}

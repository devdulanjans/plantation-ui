import { useState, useEffect } from "react";
import { callApi } from "../../utils/api";
import ComponentCard from "../common/ComponentCard";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Select from "../form/Select";
import { preventDefault } from "@fullcalendar/core/internal";
import Swal from "sweetalert2"; 

type Row = {
  rowName: string;
  farmType: string;
  soilType: string;
  irrigationType: string;
  latitude: string;
  longitude: string;
  status: string;
};

export default function AddRowManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [newRow, setNewRow] = useState<Row>({
    rowName: "",
    farmType: "",
    soilType: "",
    irrigationType: "",
    latitude: "",
    longitude: "",
    status: "",
  });

  const [rows, setRows] = useState<Row[]>([]);

  const statusOptions = [
    { value: "all", label: "All Statuses" },
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
  ];

  // Removed duplicate farmTypeOptions declaration

  const soilTypeOptions = [
    { value: "loamy", label: "Loam" },
    { value: "sandy", label: "Sand" },
    { value: "clay", label: "Cla" },
    { value: "silt", label: "Silt" },
    { value: "peat", label: "Peat" },
    { value: "chalk", label: "Chalk" },
  ];

  const irrigationOptions = [
    { value: "surface", label: "Surface Irrigation" },
    { value: "localized", label: "Localized Irrigation" },
    { value: "sprinkler", label: "Sprinkler Irrigation" },
    { value: "drip", label: "Drip Irrigation" },
    { value: "centre-pivot", label: "Centre Pivot Irrigation" },
    { value: "sub-irrigation", label: "Sub Irrigation" },
    { value: "manual", label: "Manual Irrigation" },
  ];

  const filteredRows = rows.filter((item) => {
    const matchesSearch =
      item.rowName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "" || statusFilter === "all"
        ? true
        : item.status.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });
  

  const handleAddRow = async (event: React.FormEvent) => {
    preventDefault(event);
    if (!newRow.rowName || !newRow.farmType || !newRow.status) {
      Swal.fire({
        icon: "warning",
        title: "Missing Fields",
        text: "Please fill in required fields",
      });
      return;
    }

    // Prepare payload matching your API
    const payload = {
      rowName: newRow.rowName,
      farmType: newRow.farmType,
      soilType: newRow.soilType,
      irrigationType: newRow.irrigationType,
      latitude: parseFloat(newRow.latitude), // convert to number
      longitude: parseFloat(newRow.longitude), // convert to number
      status: newRow.status,
    };

    try {
      // Send to API
      const response = await callApi<typeof payload>("/api/rows", {
        method: "POST",
        body: payload,
      });
      if (response != null) {
        Swal.fire({
          icon: "success",
          title: "Row Added",
          text: "Row has been successfully added!",
        });
        // Optionally add to local state
        setNewRow({
          rowName: "",
          farmType: "",
          soilType: "",
          irrigationType: "",
          latitude: "",
          longitude: "",
          status: "",
        });
        fetchRows();
      } else {
        Swal.fire({
          icon: "error",
          title: "Failed",
          text: "Row could not be added.",
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to add row: " + error,
      });
    }
  };

  const fetchRows = async () => {
      try {
        // Fetch raw data from API
        const data = await callApi<any[]>("/api/rows", { method: "GET" });
        // Map API fields to your Row type
        const mappedRows: Row[] = data.map(item => ({
          rowName: item.row_name,
          farmType: item.farm_type,
          soilType: item.soil_type,
          irrigationType: item.irrigation_type,
          latitude: item.latitude,
          longitude: item.longitude,
          status: item.status,
        }));
        setRows(mappedRows);

      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to load rows: " + error,
        });
      }
    };

  // Fetch rows from API on component mount
  useEffect(() => { 
    fetchRows();
  }, []);

  useEffect(() => {
    const fetchFarmTypes = async () => {
      try {
        const data = await callApi<any[]>("/api/farms", { method: "GET" });
        // Map API response to dropdown options
        const options = data.map(item => ({
          value: item.value || item.id || item.type_name, // adapt to your API response
          label: item.label || item.name || item.type_name,
        }));
        setFarmTypeOptions(options);
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to load farm types: " + error,
        });
      }
    };
    fetchFarmTypes();
  }, []);

  // State for farm type options
  const [farmTypeOptions, setFarmTypeOptions] = useState<{ value: string; label: string }[]>([
    // { value: "fruit", label: "Fruit Farm" },
    // { value: "meat", label: "Meat Farm" },
    // { value: "seed", label: "Seed Farm" },
  ]);

  return (
    <ComponentCard title="Row Management">
      {/* Add Row Form */}
      <div className="mb-8 border rounded p-4 dark:border-gray-700">
        <h2 className="text-lg font-semibold mb-4">Add New Row</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <Label htmlFor="rowName">Row Name</Label>
            <Input
              id="rowName"
              placeholder="e.g. Row A1"
              value={newRow.rowName}
              onChange={(e) =>
                setNewRow({ ...newRow, rowName: e.target.value })
              }
            />
          </div>
          <div>
            <Label htmlFor="farmType">Farm Type</Label>
            <Select
              options={farmTypeOptions}
              placeholder="Select Farm Type"
              onChange={(value) => setNewRow({ ...newRow, farmType: value })}
            />
          </div>
          <div>
            <Label htmlFor="soilType">Soil Type</Label>
            <Select
              options={soilTypeOptions}
              placeholder="Select Soil Type"
              onChange={(value) => setNewRow({ ...newRow, soilType: value })}
            />
          </div>
          <div>
            <Label htmlFor="irrigationType">Irrigation Type</Label>
            <Select
              options={irrigationOptions}
              placeholder="Select Irrigation"
              onChange={(value) =>
                setNewRow({ ...newRow, irrigationType: value })
              }
            />
          </div>
          <div>
            <Label htmlFor="latitude">Latitude</Label>
            <Input
              id="latitude"
              placeholder="e.g. 7.8731"
              value={newRow.latitude}
              onChange={(e) =>
                setNewRow({ ...newRow, latitude: e.target.value })
              }
            />
          </div>
          <div>
            <Label htmlFor="longitude">Longitude</Label>
            <Input
              id="longitude"
              placeholder="e.g. 80.7718"
              value={newRow.longitude}
              onChange={(e) =>
                setNewRow({ ...newRow, longitude: e.target.value })
              }
            />
          </div>
          <div>
            <Label htmlFor="status">Status</Label>
            <Select
              options={[
                { value: "active", label: "Active" },
                { value: "inactive", label: "Inactive" },
              ]}
              placeholder="Select Status"
              onChange={(value) => setNewRow({ ...newRow, status: value })}
            />
          </div>
        </div>

        <div className="mt-4">
          <button
            className="px-4 py-2 text-white bg-green-600 rounded hover:bg-green-700"
            onClick={handleAddRow}
          >
            Add Row
          </button>
        </div>
      </div>

      {/* Filter Section */}
      <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-2">
        <div>
          <Label htmlFor="search">Search by Row Name</Label>
          <Input
            id="search"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div>
          <Label>Status</Label>
          <Select
            options={statusOptions}
            placeholder="Filter by status"
            onChange={(value) => setStatusFilter(value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-left border border-gray-200 dark:border-gray-700">
          <thead className="bg-gray-100 dark:bg-dark-800">
            <tr className="text-xs font-semibold text-gray-600 uppercase dark:text-gray-300">
              <th className="px-4 py-2 border-r">Row Name</th>
              <th className="px-4 py-2 border-r">Farm Type</th>
              <th className="px-4 py-2 border-r">Soil Type</th>
              <th className="px-4 py-2 border-r">Irrigation</th>
              <th className="px-4 py-2 border-r">Latitude</th>
              <th className="px-4 py-2 border-r">Longitude</th>
              <th className="px-4 py-2 border-r">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y dark:divide-gray-700 dark:bg-dark-900">
            {filteredRows.map((row, index) => (
              <tr key={index} className="hover:bg-gray-50 dark:hover:bg-dark-700">
                <td className="px-4 py-2 border-r">{row.rowName}</td>
                <td className="px-4 py-2 border-r">{row.farmType}</td>
                <td className="px-4 py-2 border-r">{row.soilType}</td>
                <td className="px-4 py-2 border-r">{row.irrigationType}</td>
                <td className="px-4 py-2 border-r">{row.latitude}</td>
                <td className="px-4 py-2 border-r">{row.longitude}</td>
                <td className="px-4 py-2 border-r">{row.status}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredRows.length === 0 && (
          <div className="p-4 text-sm text-gray-500 dark:text-gray-400">
            No rows found.
          </div>
        )}
      </div>
    </ComponentCard>
  );
}

import { useState, useEffect } from "react";
import ComponentCard from "../common/ComponentCard";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Select from "../form/Select";
import DatePicker from "../form/date-picker";
import { callApi } from "../../utils/api"; // Add this import
import Swal from "sweetalert2"; // Add this import

type Asset = {
  assetType: string;
  farmType: string;
  category: string;
  assetCode: string;
  location: string;
  row: string;
  createdDate: string;
  healthStatus: string;
  status: string;
  description: string;
};

export default function AssetProfileComponent() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [formData, setFormData] = useState({
    assetType: "",
    farmType: "",
    category: "",
    assetCode: "",
    location: "",
    row: "",
    createdDate: "2023-09-01",
    healthStatus: "",
    status: "",
    description: "",
  });

  const [farmTypeOptions, setFarmTypeOptions] = useState<{ value: string; label: string }[]>([]);

  const assetTypeOptions = [
    { value: "tree", label: "Tree" },
    { value: "animal", label: "Animal" },
    { value: "plant", label: "Plant Batch" },
  ];

  const categoryOptions = {
    TEST1: [
      { value: "mango", label: "Mango" },
      { value: "banana", label: "Banana" },
    ],
    meat: [
      { value: "cow", label: "Cow" },
      { value: "goat", label: "Goat" },
    ],
    seed: [
      { value: "paddy", label: "Paddy" },
      { value: "wheat", label: "Wheat" },
    ],
  };

  // Update locationOptions to include lat/long as value
  const locationOptions = [
    { value: "6.9271,79.8612", label: "Plot 1" },
    { value: "7.0000,80.0000", label: "Plot 2" },
  ];

  // Update rowOptions to use row ID
  const rowOptions = [
    { value: "ROW-123", label: "Row A" },
    { value: "ROW-456", label: "Row B" },
  ];

  const statusOptions = [
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
  ];

  const healthStatusOptions = [
    { value: "healthy", label: "Healthy" },
    { value: "sick", label: "Sick" },
    { value: "dead", label: "Dead" },
  ];

  const filteredAssets = assets.filter((asset) => {
    const matchesSearch = asset.assetCode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "" || statusFilter === "all"
        ? true
        : asset.status.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  const handleAddAsset = async () => {
    const requiredFields = [
      { key: "assetType", label: "Asset Type" },
      { key: "category", label: "Category" },
      { key: "assetCode", label: "Asset Code" },
      { key: "row", label: "Row" },
      { key: "location", label: "Location" },
      { key: "createdDate", label: "Planted / Born On" },
      { key: "healthStatus", label: "Health Status" },
      { key: "status", label: "Status" },
    ];

    const missingFields = requiredFields
      .filter((field) => !formData[field.key as keyof typeof formData])
      .map((field) => field.label);

    if (missingFields.length > 0) {
      Swal.fire({
        icon: "warning",
        title: "Missing Fields",
        html: `Please fill in required fields:<br><b>${missingFields.join(", ")}</b>`,
      });
      return;
    }

    const payload = {
      treeCode: formData.assetCode,
      treeType: formData.category,
      rowId: formData.row,
      location: {
        latitude: parseFloat(formData.location.split(",")[0]),
        longitude: parseFloat(formData.location.split(",")[1]),
      },
      plantingDate: formData.createdDate,
      healthStatus: formData.healthStatus,
      status: formData.status,
      notes: formData.description,
    };

    try {
      const response = await callApi<typeof payload>("/api/assets", {
        method: "POST",
        body: payload,
      });
      if (response) {
        Swal.fire({
          icon: "success",
          title: "Asset Added",
          text: "Asset added successfully!",
        });
        setAssets([...assets, formData]);
        setFormData({
          assetType: "",
          farmType: "",
          category: "",
          assetCode: "",
          location: "",
          row: "",
          createdDate: "",
          healthStatus: "",
          status: "",
          description: "",
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Failed",
          text: "Failed to add asset.",
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Error adding asset: " + error,
      });
    }
  };

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const response = await callApi<any>("/api/assets", { method: "GET" });
        // Get the array from response.data
        const assetArray = Array.isArray(response.data) ? response.data : [];
        const mappedAssets: Asset[] = assetArray.map((item: any) => ({
          assetType: item.tree_type || "",
          farmType: "", // Not present in payload
          category: item.tree_type || "",
          assetCode: item.tree_code || "",
          location:
            item.latitude && item.longitude
              ? `${item.latitude},${item.longitude}`
              : "",
          row: item.row_id || "",
          createdDate: item.planting_date
            ? new Date(item.planting_date).toISOString().split("T")[0]
            : "",
          healthStatus: item.health_status || "",
          status: item.status || "",
          description: item.notes || "",
        }));
        setAssets(mappedAssets);
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to load assets: " + error,
        });
      }
    };
    fetchAssets();
  }, []);

  useEffect(() => {
    const fetchFarmTypes = async () => {
      try {
        const response = await callApi<any>("/api/farms", { method: "GET" });
        const farmArray = Array.isArray(response) ? response : [];
        const mappedFarmTypeOptions = farmArray.map((item: any) => ({
          value: item.typeName || item.type_name || "",
          label: item.typeName || item.type_name || "",
        }));
        setFarmTypeOptions(mappedFarmTypeOptions);
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

  return (
    <ComponentCard title="Asset Profile">
      {/* Form Section */}
      <div className="mb-8 border rounded p-4 dark:border-gray-700">
        <h2 className="text-lg font-semibold mb-4">Register New Asset</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <Label>Asset Type</Label>
            <Select
              options={assetTypeOptions}
              placeholder="Select Asset Type"
              onChange={(value) => setFormData({ ...formData, assetType: value })}
            />
          </div>
          <div>
            <Label>Farm Type</Label>
            <Select
              options={farmTypeOptions}
              placeholder="Select Farm Type"
              onChange={(value) => {
                setFormData({ ...formData, farmType: value, category: "" });
              }}
            />
          </div>
          <div>
            <Label>Category</Label>
            <Select
              options={categoryOptions[formData.farmType as keyof typeof categoryOptions] || []}
              placeholder="Select Category"
              onChange={(value) => setFormData({ ...formData, category: value })}
            />
          </div>
          <div>
            <Label>Asset Code</Label>
            <Input
              placeholder="e.g. TREE-001"
              value={formData.assetCode}
              onChange={(e) => setFormData({ ...formData, assetCode: e.target.value })}
            />
          </div>
          <div>
            <Label>Location</Label>
            <Select
              options={locationOptions}
              placeholder="Select Location"
              onChange={(value) => setFormData({ ...formData, location: value })}
            />
          </div>
          {formData.assetType === "tree" && (
            <div>
              <Label>Row</Label>
              <Select
                options={rowOptions}
                placeholder="Select Row"
                onChange={(value) => setFormData({ ...formData, row: value })}
              />
            </div>
          )}
          <div>
            <Label>Planted / Born On</Label>
            <DatePicker
              id="createdDate"
              defaultDate={formData.createdDate ? new Date(formData.createdDate) : undefined}
              onChange={(value: Date | Date[] | null) =>
                setFormData({
                  ...formData,
                  createdDate: Array.isArray(value)
                    ? value[0] instanceof Date
                      ? value[0].toISOString()
                      : ""
                    : value instanceof Date
                    ? value.toISOString()
                    : "",
                })
              }
              placeholder="Select Date"
            />
          </div>
          <div>
            <Label>Health Status</Label>
            <Select
              options={healthStatusOptions}
              placeholder="Select Health"
              onChange={(value) => setFormData({ ...formData, healthStatus: value })}
            />
          </div>
          <div>
            <Label>Status</Label>
            <Select
              options={statusOptions}
              placeholder="Select Status"
              onChange={(value) => setFormData({ ...formData, status: value })}
            />
          </div>
          <div className="md:col-span-3">
            <Label>Description</Label>
            <Input
              placeholder="Optional notes"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
        </div>
        <div className="mt-4">
          <button
            className="px-4 py-2 text-white bg-green-600 rounded hover:bg-green-700"
            onClick={handleAddAsset}
          >
            Add Asset
          </button>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-2">
        <div>
          <Label>Search by Asset Code</Label>
          <Input
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div>
          <Label>Status</Label>
          <Select
            options={[{ value: "all", label: "All Statuses" }, ...statusOptions]}
            placeholder="Filter by Status"
            onChange={(value) => setStatusFilter(value)}
          />
        </div>
      </div>

      {/* Table View */}
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-left border border-gray-200 dark:border-gray-700">
          <thead className="bg-gray-100 dark:bg-dark-800">
            <tr className="text-xs font-semibold text-gray-600 uppercase dark:text-gray-300">
              <th className="px-4 py-2 border-r">Asset Code</th>
              <th className="px-4 py-2 border-r">Type</th>
              <th className="px-4 py-2 border-r">Category</th>
              <th className="px-4 py-2 border-r">Location</th>
              <th className="px-4 py-2 border-r">Health</th>
              <th className="px-4 py-2 border-r">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y dark:divide-gray-700 dark:bg-dark-900">
            {filteredAssets.map((asset, index) => (
              <tr key={index} className="hover:bg-gray-50 dark:hover:bg-dark-700">
                <td className="px-4 py-2 border-r">{asset.assetCode}</td>
                <td className="px-4 py-2 border-r">{asset.assetType}</td>
                <td className="px-4 py-2 border-r">{asset.category}</td>
                <td className="px-4 py-2 border-r">{asset.location}</td>
                <td className="px-4 py-2 border-r">{asset.healthStatus}</td>
                <td className="px-4 py-2 border-r">{asset.status}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredAssets.length === 0 && (
          <div className="p-4 text-sm text-gray-500 dark:text-gray-400">
            No assets found.
          </div>
        )}
      </div>
    </ComponentCard>
  );
}

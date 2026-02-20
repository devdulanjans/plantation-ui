import { useState, useEffect } from "react";
import ComponentCard from "../common/ComponentCard";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Select from "../form/Select";
import { callApi } from "../../utils/api"; // Add this import at the top
import Swal from "sweetalert2"; // Add this import at the top

export default function LocationRegistration() {
  type Location = {
    locationName: string;
    row: string;
    latitude: string;
    longitude: string;
    description: string;
    status: string;
  };

  const [locations, setLocations] = useState<Location[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [locationForm, setLocationForm] = useState({
    locationName: "",
    row: "",
    latitude: "",
    longitude: "",
    description: "",
    status: "",
  });

  const rowOptions = [
    { value: "row-a1", label: "Row A1" },
    { value: "row-b2", label: "Row B2" },
    { value: "row-c3", label: "Row C3" },
  ];

  const statusOptions = [
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
  ];

  const filteredLocations = locations.filter((loc) => {
    const matchesSearch = loc.locationName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "" || statusFilter === "all"
        ? true
        : loc.status.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  const handleAddLocation = async () => {
    if (!locationForm.locationName || !locationForm.row || !locationForm.status) {
      Swal.fire({
        icon: "warning",
        title: "Missing Fields",
        text: "Please fill all required fields",
      });
      return;
    }

    const rowIdMap: Record<string, number> = {
      "row-a1": 1,
      "row-b2": 2,
      "row-c3": 3,
    };

    const payload = {
      locationName: locationForm.locationName,
      rowId: rowIdMap[locationForm.row] || 0,
      latitude: parseFloat(locationForm.latitude),
      longitude: parseFloat(locationForm.longitude),
      description: locationForm.description,
      status: locationForm.status,
    };

    try {
      const response = await callApi<typeof payload>("/api/locations", {
        method: "POST",
        body: payload,
      });

      if (response != null) {
        Swal.fire({
          icon: "success",
          title: "Location Added",
          text: "Location has been successfully added!",
        });
        fetchLocations();
        setLocations((prev) => [...prev, locationForm]);
        setLocationForm({
          locationName: "",
          row: "",
          latitude: "",
          longitude: "",
          description: "",
          status: "",
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Failed",
          text: "Location could not be added.",
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to add location: " + error,
      });
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
      try {
        const data = await callApi<any[]>("/api/locations", { method: "GET" });
        // Map API fields to your Location type
        const mappedLocations: Location[] = data.map((item) => ({
          locationName: item.locationName || item.location_name,
          row: item.row || item.rowId?.toString() || "",
          latitude: item.latitude?.toString() || "",
          longitude: item.longitude?.toString() || "",
          description: item.description || "",
          status: item.status || "",
        }));
        setLocations(mappedLocations);
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to load locations: " + error,
        });
      }
    };

  return (
    <ComponentCard title="Location Registration">
      {/* Add Location Form */}
      <div className="mb-8 border rounded p-4 dark:border-gray-700">
        <h2 className="text-lg font-semibold mb-4">Add New Location</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <Label htmlFor="locationName">Location Name</Label>
            <Input
              id="locationName"
              placeholder="e.g. Plot B1"
              value={locationForm.locationName}
              onChange={(e) =>
                setLocationForm({ ...locationForm, locationName: e.target.value })
              }
            />
          </div>
          <div>
            <Label htmlFor="row">Row</Label>
            <Select
              options={rowOptions}
              placeholder="Select Row"
              onChange={(value) => setLocationForm({ ...locationForm, row: value })}
            />
          </div>
          <div>
            <Label htmlFor="latitude">Latitude</Label>
            <Input
              id="latitude"
              placeholder="e.g. 6.9271"
              value={locationForm.latitude}
              onChange={(e) =>
                setLocationForm({ ...locationForm, latitude: e.target.value })
              }
            />
          </div>
          <div>
            <Label htmlFor="longitude">Longitude</Label>
            <Input
              id="longitude"
              placeholder="e.g. 79.8612"
              value={locationForm.longitude}
              onChange={(e) =>
                setLocationForm({ ...locationForm, longitude: e.target.value })
              }
            />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              placeholder="Optional notes"
              value={locationForm.description}
              onChange={(e) =>
                setLocationForm({ ...locationForm, description: e.target.value })
              }
            />
          </div>
          <div>
            <Label htmlFor="status">Status</Label>
            <Select
              options={statusOptions}
              placeholder="Select Status"
              onChange={(value) => setLocationForm({ ...locationForm, status: value })}
            />
          </div>
        </div>

        <div className="mt-4">
          <button
            className="px-4 py-2 text-white bg-green-600 rounded hover:bg-green-700"
            onClick={handleAddLocation}
          >
            Add Location
          </button>
        </div>
      </div>

      {/* Search/Filter */}
      <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-2">
        <div>
          <Label htmlFor="search">Search by Location Name</Label>
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
            options={[{ value: "all", label: "All Statuses" }, ...statusOptions]}
            placeholder="Filter by status"
            onChange={(value) => setStatusFilter(value)}
          />
        </div>
      </div>

      {/* Location Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-left border border-gray-200 dark:border-gray-700">
          <thead className="bg-gray-100 dark:bg-dark-800">
            <tr className="text-xs font-semibold text-gray-600 uppercase dark:text-gray-300">
              <th className="px-4 py-2 border-r">Location Name</th>
              <th className="px-4 py-2 border-r">Row</th>
              <th className="px-4 py-2 border-r">Latitude</th>
              <th className="px-4 py-2 border-r">Longitude</th>
              <th className="px-4 py-2 border-r">Description</th>
              <th className="px-4 py-2 border-r">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y dark:divide-gray-700 dark:bg-dark-900">
            {filteredLocations.map((loc, index) => (
              <tr key={index} className="hover:bg-gray-50 dark:hover:bg-dark-700">
                <td className="px-4 py-2 border-r">{loc.locationName}</td>
                <td className="px-4 py-2 border-r">{loc.row}</td>
                <td className="px-4 py-2 border-r">{loc.latitude}</td>
                <td className="px-4 py-2 border-r">{loc.longitude}</td>
                <td className="px-4 py-2 border-r">{loc.description}</td>
                <td className="px-4 py-2 border-r">{loc.status}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredLocations.length === 0 && (
          <div className="p-4 text-sm text-gray-500 dark:text-gray-400">
            No locations found.
          </div>
        )}
      </div>
    </ComponentCard>
  );
}

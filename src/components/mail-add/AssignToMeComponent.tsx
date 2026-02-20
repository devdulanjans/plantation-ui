import { useState } from "react";
import ComponentCard from "../common/ComponentCard";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Select from "../form/Select";

export default function AssignedToMe() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const statusOptions = [
    { value: "all", label: "All Statuses" },
    { value: "new", label: "New" },
    { value: "in-progress", label: "In Progress" },
    { value: "completed", label: "Completed" },
  ];

  const mockAssignedMails = [
    {
      refNo: "IN-0023",
      subject: "Legal Document Review",
      department: "Legal",
      mailDate: "2025-07-08",
      status: "In Progress",
      priority: "High",
    },
    {
      refNo: "IN-0024",
      subject: "Invoice Dispute",
      department: "Finance",
      mailDate: "2025-07-07",
      status: "New",
      priority: "Medium",
    },
  ];

  const filteredMails = mockAssignedMails.filter((item) => {
    const matchesSearch =
      item.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.refNo.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "" || statusFilter === "all"
        ? true
        : item.status.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  return (
    <ComponentCard title="Assigned to Me">
      {/* Filter Section */}
      <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-2">
        <div>
          <Label htmlFor="search">Search by Ref No or Subject</Label>
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
              <th className="px-4 py-2 border-r">Ref No</th>
              <th className="px-4 py-2 border-r">Subject</th>
              <th className="px-4 py-2 border-r">Department</th>
              <th className="px-4 py-2 border-r">Mail Date</th>
              <th className="px-4 py-2 border-r">Priority</th>
              <th className="px-4 py-2 border-r">Status</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y dark:divide-gray-700 dark:bg-dark-900">
            {filteredMails.map((mail, index) => (
              <tr key={index} className="hover:bg-gray-50 dark:hover:bg-dark-700">
                <td className="px-4 py-2 border-r">{mail.refNo}</td>
                <td className="px-4 py-2 border-r">{mail.subject}</td>
                <td className="px-4 py-2 border-r">{mail.department}</td>
                <td className="px-4 py-2 border-r">{mail.mailDate}</td>
                <td className="px-4 py-2 border-r">
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded ${
                      mail.priority === "High"
                        ? "bg-red-100 text-red-600"
                        : mail.priority === "Medium"
                        ? "bg-yellow-100 text-yellow-600"
                        : "bg-green-100 text-green-600"
                    }`}
                  >
                    {mail.priority}
                  </span>
                </td>
                <td className="px-4 py-2 border-r">{mail.status}</td>
                <td className="px-4 py-2 space-x-2">
                  <button className="text-blue-600 hover:underline">View</button>
                  <button className="text-green-600 hover:underline">Update</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredMails.length === 0 && (
          <div className="p-4 text-sm text-gray-500 dark:text-gray-400">
            No mail items found.
          </div>
        )}
      </div>
    </ComponentCard>
  );
}

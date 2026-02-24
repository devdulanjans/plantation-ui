import ComponentCard from "../common/ComponentCard";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Select from "../form/Select";
import { useState } from "react";

export default function AllIncomingMail() {
  const [searchTerm, setSearchTerm] = useState("");

  const departmentOptions = [
    { value: "all", label: "All Departments" },
    { value: "finance", label: "Finance" },
    { value: "hr", label: "HR" },
    { value: "admin", label: "Admin" },
  ];

  const priorityOptions = [
    { value: "all", label: "All Priorities" },
    { value: "high", label: "High" },
    { value: "medium", label: "Medium" },
    { value: "low", label: "Low" },
  ];

  const mockData = [
    {
      refNo: "IN-0001",
      subject: "Letter from Bank",
      department: "Finance",
      mailDate: "2025-07-10",
      status: "New",
      priority: "High",
    },
    {
      refNo: "IN-0002",
      subject: "Legal Document",
      department: "Admin",
      mailDate: "2025-07-09",
      status: "In Progress",
      priority: "Medium",
    },
  ];

  return (
    <ComponentCard title="All Incoming Mail">
      {/* Filters */}
      <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-3">
        <div>
          <Label htmlFor="search">Search by Ref or Subject</Label>
          <Input
            id="search"
            placeholder="Enter keyword..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div>
          <Label>Department</Label>
          <Select
            options={departmentOptions}
            placeholder="Filter by department"
            onChange={() => {}}
          />
        </div>
        <div>
          <Label>Priority</Label>
          <Select
            options={priorityOptions}
            placeholder="Filter by priority"
            onChange={() => {}}
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
            {mockData
              .filter((item) =>
                item.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.refNo.toLowerCase().includes(searchTerm.toLowerCase())
              )
              .map((mail, index) => (
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
                    <button className="text-green-600 hover:underline">Download</button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </ComponentCard>
  );
}

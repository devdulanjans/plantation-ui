import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import AddNewMailForm from "../../components/mail-add/AddNewMailForm";

export default function MailAdd() {
    return (
    <div>
      <PageMeta
        title="React.js Form Elements Dashboard | TailAdmin - React.js Admin Dashboard Template"
        description="This is React.js Form Elements  Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
      <PageBreadcrumb pageTitle="Create Mail" />
      <div className="grid grid-cols-1 gap-12 xl:grid-cols-1">
        <div className="space-y-12">
          <AddNewMailForm />
        </div>
      </div>
    </div>
  );

}
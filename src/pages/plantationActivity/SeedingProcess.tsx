import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import SeedingProcessComponent from "../../components/plantationActivityComponents/SeedingProcessComponent";

export default function SeedingProcess() {
    return (
    <div>
      <PageMeta
        title="Alvis Mail Management System"
        description="Alvis Mail Management System"
      />
      <PageBreadcrumb pageTitle="User Assign Mail" />
      <div className="grid grid-cols-1 gap-12 xl:grid-cols-1">
        <div className="space-y-12">
          <SeedingProcessComponent />
        </div>
      </div>
    </div>
  );

}
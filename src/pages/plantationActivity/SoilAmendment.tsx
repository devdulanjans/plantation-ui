import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import SoilAmendmentComponent from "../../components/plantationActivityComponents/SoilAmendmentComponent";

export default function SoilAmendment() {
    return (
    <div>
      <PageMeta
        title="Alvis Mail Management System"
        description="Alvis Mail Management System"
      />
      <PageBreadcrumb pageTitle="Plantation Master" />
      <div className="grid grid-cols-1 gap-12 xl:grid-cols-1">
        <div className="space-y-12">
          <SoilAmendmentComponent />
        </div>
      </div>
    </div>
  );

}
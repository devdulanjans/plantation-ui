import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import FirtilizationCategoryComponent from "../../components/firtilizationComponent/FirtilizationCategoryComponent";

export default function FirtilizerCatgory() {
    return (
    <div>
      <PageMeta
        title="Alvis Mail Management System"
        description="Alvis Mail Management System"
      />
      <PageBreadcrumb pageTitle="User Assign Mail" />
      <div className="grid grid-cols-1 gap-12 xl:grid-cols-1">
        <div className="space-y-12">
          <FirtilizationCategoryComponent />
        </div>
      </div>
    </div>
  );

}
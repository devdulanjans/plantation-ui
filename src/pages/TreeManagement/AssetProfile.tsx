import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import AssetProfileComponent from "../../components/treeManagement/AssetProfile";


export default function AssetProfile() {
    return (
    <div>
      <PageMeta
        title="Alvis Mail Management System"
        description="Alvis Mail Management System"
      />
      <PageBreadcrumb pageTitle="Assets Management" />
      <div className="grid grid-cols-1 gap-12 xl:grid-cols-1">
        <div className="space-y-12">
          <AssetProfileComponent />
        </div>
      </div>
    </div>
  );

}
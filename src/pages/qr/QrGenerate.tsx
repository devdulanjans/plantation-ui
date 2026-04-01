import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import GenerateQRCodesComponent from "../../components/qrComponent/GenerateQrComponent";


export default function GenerateQRCodes() {
    return (
    <div>
      <PageMeta
        title="Alvis Mail Management System"
        description="Alvis Mail Management System"
      />
      <PageBreadcrumb pageTitle="Generate QR Codes" />
      <div className="grid grid-cols-1 gap-12 xl:grid-cols-1">
        <div className="space-y-12">
          <GenerateQRCodesComponent />
        </div>
      </div>
    </div>
  );

}
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import AllIncomingMail from "../../components/mail-add/AllIncomingMail";

export default function IncomingMails() {
    return (
    <div>
      <PageMeta
        title="Alvis Mail Management System"
        description="Alvis Mail Management System"
      />
      <PageBreadcrumb pageTitle="Incoming Mail" />
      <div className="grid grid-cols-1 gap-12 xl:grid-cols-1">
        <div className="space-y-12">
          <AllIncomingMail />
        </div>
      </div>
    </div>
  );

}
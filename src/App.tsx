import { BrowserRouter as Router, Routes, Route } from "react-router";
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import NotFound from "./pages/OtherPage/NotFound";
import UserProfiles from "./pages/UserProfiles";
import Videos from "./pages/UiElements/Videos";
import Images from "./pages/UiElements/Images";
import Alerts from "./pages/UiElements/Alerts";
import Badges from "./pages/UiElements/Badges";
import Avatars from "./pages/UiElements/Avatars";
import Buttons from "./pages/UiElements/Buttons";
import LineChart from "./pages/Charts/LineChart";
import BarChart from "./pages/Charts/BarChart";
import Calendar from "./pages/Calendar";
import BasicTables from "./pages/Tables/BasicTables";
import FormElements from "./pages/Forms/FormElements";
import Blank from "./pages/Blank";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Home from "./pages/Dashboard/Home";
import AddRow from "./pages/location/AddRow";
import LocationRegistration from "./components/locationCom/AddLocationManagement";
import AddTree from "./components/treeManagement/AddTreeManagemetnComp";
import AssetProfile from "./pages/TreeManagement/AssetProfile";
import QrAllocation from "./pages/TreeManagement/QrAllocation";
import QrCancel from "./pages/TreeManagement/QrCancel";
import PruningAllocation from "./pages/TreeManagement/PruningAllocation";
import TranslPlantAllocation from "./pages/TreeManagement/TransplantAllocation";
import SeedingProcess from "./pages/plantationActivity/SeedingProcess";
import HarvestingProcess from "./pages/plantationActivity/HarvestingProcess";
import SoilAmendment from "./pages/plantationActivity/SoilAmendment";
import FieldWork from "./pages/plantationActivity/FieldWork";
import CleanField from "./pages/plantationActivity/CleanField";
import FirtilizationRegistration from "./pages/Firtilization/FirtilizationRegistration";
import FirtilizerCatgory from "./pages/Firtilization/FirtilizerCatgory";
import FirtilizerInventory from "./pages/Firtilization/FirtilizerInventory";
import MechanismSet from "./pages/Firtilization/MechanismSet";
import PestControllActivity from "./pages/PestControllActivity/PestControllActivity";
import PesticideInventory from "./pages/PestControllActivity/PesticideInventory";
import PestMonitoringRecords from "./pages/PestControllActivity/PestMonitoringRecords";
import FarmRegistration from "./pages/Farm/FarmTypeRegistration";
import GenerateQRCodes from "./pages/qr/QrGenerate";
import PrintQrCodesComponent from "./pages/qr/PrintQrCode";

export default function App() {
  return (
    <>
      <Router>
        <ScrollToTop />
        <Routes>
          
        <Route index path="/" element={<SignIn />} />
          {/* Dashboard Layout */}
          <Route element={<AppLayout />}>
            <Route index path="/home" element={<Home />} />

            <Route index path="/location/rows" element={<AddRow />} />
            <Route index path="/location/register" element={<LocationRegistration />} />
            <Route index path="/farm/types" element={<FarmRegistration />} />

            <Route index path="/TreeManagement/AddTree" element={<AddTree />} />
            <Route index path="/TreeManagement/AssetProfile" element={<AssetProfile />} />
            <Route index path="/TreeManagement/QrAllocation" element={<QrAllocation />} />
            <Route index path="/TreeManagement/QrCancel" element={<QrCancel />} />
            <Route index path="/TreeManagement/PruningAllocation" element={<PruningAllocation />} />
            <Route index path="/TreeManagement/TranslPlantAllocation" element={<TranslPlantAllocation />} />

            
            <Route index path="/PlantationActivity/SeedingProcess" element={<SeedingProcess />} />
            <Route index path="/PlantationActivity/HarvestingProcess" element={<HarvestingProcess />} />
            <Route index path="/PlantationActivity/SoilAmendment" element={<SoilAmendment />} />
            <Route index path="/PlantationActivity/FieldWork" element={<FieldWork />} />
            <Route index path="/PlantationActivity/CleanField" element={<CleanField />} />

            
            <Route index path="/Firtilization/FirtilizationRegistration" element={<FirtilizationRegistration />} />
            <Route index path="/Firtilization/FirtilizerCatgory" element={<FirtilizerCatgory />} />
            <Route index path="/Firtilization/FirtilizerInventory" element={<FirtilizerInventory />} />
            <Route index path="/Firtilization/MechanismSet" element={<MechanismSet />} />

            
            <Route index path="/PestControllActivity/PestControllActivity" element={<PestControllActivity />} />            
            <Route index path="/PestControllActivity/PesticideInventory" element={<PesticideInventory />} />                        
            <Route index path="/PestControllActivity/PestMonitoringRecords" element={<PestMonitoringRecords />} />

            <Route index path="/qr/GenerateQRCodes" element={<GenerateQRCodes />} />

            <Route index path="/qr/PrintQrCodes" element={<PrintQrCodesComponent />} />

            {/* <Route path="/incoming/add-mail" element={<MailAdd />} />
            <Route path="/incoming" element={<IncomingMails />} />
            <Route path="/incoming/assigned" element={<AssignToMe />} />
            <Route path="/incoming/assets-profile" element={<AssetProfile />} /> */}
            


            {/* Others Page */}
            <Route path="/profile" element={<UserProfiles />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/blank" element={<Blank />} />

            {/* Forms */}
            <Route path="/form-elements" element={<FormElements />} />

            {/* Tables */}
            <Route path="/basic-tables" element={<BasicTables />} />

            {/* Ui Elements */}
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/avatars" element={<Avatars />} />
            <Route path="/badge" element={<Badges />} />
            <Route path="/buttons" element={<Buttons />} />
            <Route path="/images" element={<Images />} />
            <Route path="/videos" element={<Videos />} />

            {/* Charts */}
            <Route path="/line-chart" element={<LineChart />} />
            <Route path="/bar-chart" element={<BarChart />} />
          </Route>

          {/* Auth Layout */}
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />

          {/* Fallback Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </>
  );
}

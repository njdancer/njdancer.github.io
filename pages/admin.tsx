import dynamic from "next/dynamic";
import { Suspense } from "react";

const CMS = dynamic(() => import("../components/CMS"), {
  // suspense: true,r
  ssr: false,
});

const AdminPage = () => (
  <Suspense fallback={`Loading...`}>
    <CMS />
  </Suspense>
);

export default AdminPage;

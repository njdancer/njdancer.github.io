import NetlifyCMS from "netlify-cms-app";
import config from "../cms-config.yml";

export default function CMS() {
  NetlifyCMS.init({ config });

  return <></>;
}

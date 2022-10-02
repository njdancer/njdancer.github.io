declare module "*.yaml" {
  const data: any;
  export default data;
}

declare module "*.yml" {
  const data: any;
  export default data;
}

declare module "*.md" {
  const attributes: Record<string, unknown>;

  import React from "react";
  const react: React.FC;

  export { attributes, react };
}

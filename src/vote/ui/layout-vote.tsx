import React from "react";

export default ({ children }: { children: JSX.Element }) => (
  <div className="items-center justify-center p-3 rounded">
    <div className="p-6 bg-white rounded shadow-md">{children} </div>
  </div>
);

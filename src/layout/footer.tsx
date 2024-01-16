import React from "react";
import { github, version } from "../config";

export default () => (
  <footer className="mt-auto bg-white shadow">
    <div className="p-4">
      <p className="text-xs text-center">
        &copy; {new Date().getFullYear()}{" "}
        <a
          href="https://swissvote.github.io/landing-page/"
          className="text-blue-600 hover:text-blue-800"
        >
          SwissVote
        </a>
        &nbsp;All Rights Reserved&nbsp;
        <br />
        <a href={github.version} className="text-blue-600 hover:text-blue-800">
          {version}
        </a>
      </p>
    </div>
  </footer>
);

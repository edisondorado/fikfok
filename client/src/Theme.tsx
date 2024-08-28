import { useState, useEffect } from "react";
import useDarkMode from "use-dark-mode";

function Theme({ children }) {
  const darkMode = useDarkMode(
    window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches,
    {
      onChange: (val: boolean) => {
        if (val) {
          localStorage.setItem("theme", "dark");
          document.body.classList.add("dark", "text-foreground", "bg-background")
        } else {
          localStorage.setItem("theme", "light");
          document.body.classList.remove("dark", "text-foreground", "bg-background");
        }
      }
    }
  );

  return (
    <>
      <main
        className={`${
          darkMode.value ? "dark" : ""
        } text-foreground bg-background min-h-screen`}
      >
        {children}
      </main>
    </>
  );
}

export default Theme;

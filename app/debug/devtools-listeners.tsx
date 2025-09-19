"use client";
import { useEffect } from "react";

export default function DevtoolsListenersDebug() {
  useEffect(() => {
    const rz = () => console.log("[dbg] resize", innerWidth, innerHeight, Date.now());
    const fc = () => console.log("[dbg] focus");
    const bl = () => console.log("[dbg] blur");
    const vz = () => console.log("[dbg] visibility", document.visibilityState);
    
    window.addEventListener("resize", rz);
    window.addEventListener("focus", fc);
    window.addEventListener("blur", bl);
    document.addEventListener("visibilitychange", vz);
    
    return () => {
      window.removeEventListener("resize", rz);
      window.removeEventListener("focus", fc);
      window.removeEventListener("blur", bl);
      document.removeEventListener("visibilitychange", vz);
    };
  }, []);
  
  return null;
}

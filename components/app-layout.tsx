"use client"
import Sidebar from "@/components/sidebar"
import { useRef, cloneElement, isValidElement, Children } from "react"

// APP LAYOUT COMPONENT - WRAPS ALL PAGES WITH SIDEBAR 🌐
export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // CREATE A REF TO HOLD THE RESET FUNCTION FROM CONTENT COMPONENTS 🔄
  const resetFunctionRef = useRef<(() => void) | null>(null);

  // CLONE CHILDREN TO PASS THE RESET FUNCTION REF 🧩
  const childrenWithProps = Children.map(children, (child) => {
    // Check if the child is a valid React element
    if (isValidElement(child)) {
      // Clone the element with the resetFunctionRef prop
      return cloneElement(child, { 
        // @ts-expect-error - Pass as onResetRef for content components
        onResetRef: resetFunctionRef 
      });
    }
    return child;
  });

  return (
    <div className="flex min-h-screen flex-col outer-area">
      {/* SIDEBAR COMPONENT WITH RESET FUNCTION 🧭 */}
      <Sidebar onReset={() => resetFunctionRef.current && resetFunctionRef.current()} />
      
      {/* MAIN CONTENT AREA - RENDERS CHILDREN (PAGES) ✨ */}
      {childrenWithProps}
    </div>
  )
} 
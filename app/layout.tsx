import type React from "react"
import "./globals.css"
import type { Metadata } from "next"
import { PT_Serif } from "next/font/google"
import { Toaster } from "@/components/ui/toaster"
import AppLayout from "@/components/app-layout"

const ptSerif = PT_Serif({ subsets: ["latin"], weight: "400" })

export const metadata: Metadata = {
  title: "Knowballs",
  description: "A search engine for NBA data.",
}

// ROOT LAYOUT - WRAPS ALL PAGES IN THE APP 🌐
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${ptSerif.className} relative`}>
        {/* <div className="page-trim-top"></div>
        <div className="page-trim-right"></div>
        <div className="page-trim-bottom"></div>
        <div className="page-trim-left hidden md:block"></div> */}
        <AppLayout>
          {children}
        </AppLayout>
        <Toaster />
      </body>
    </html>
  )
}
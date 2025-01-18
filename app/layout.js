import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/header";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Vitta",
  description: "AI-powered finance manager",
  // AI-powered finace
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <head>
          <link rel="icon" href="/Vitta_sm_logo.png" sizes="any" />
        </head>
        <body className={`${inter.className}`}>
          {/* header */}
          <Header />

          <main className="min-h-screen">
            <Toaster richColors={true} />
            {children}
          </main>

          {/* footer */}
          <footer className="bg-blue-50 py-12 ">
            <div className="container mx-auto px-4 text-center text-gray-600">
              <p>Made with ❤️ by Vijay</p>
            </div>
          </footer>
        </body>
      </html>
    </ClerkProvider>
  );
}

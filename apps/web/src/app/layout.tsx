import { AuthProvider } from "@/context/AuthContext";
import "./globals.css";

export const metadata = {
  title: "AI Ads",
  description: "AI Advertising Workflow",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-neutral-50 text-neutral-900">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}

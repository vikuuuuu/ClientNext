
import "./globals.css";

export const metadata = {
  title: "ClientNext — Client Management",
  description:
    "Manage clients, projects, invoices, billing, and finances in one place with ClientNext.",
  applicationName: "ClientNext",
  robots: {
    index: false,
    follow: false,
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

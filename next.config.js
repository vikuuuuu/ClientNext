const ADMIN = "/:p(dashboard|clients|quotations|invoices|projects|finance|templates|coupons|inquiries|logs|settings|team|portal|freelancer|login)";
module.exports = {
  poweredByHeader: false,
  async headers() {
    return [{ source: ADMIN, headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] }, { source: "/(.*)", headers: [
      { key: "X-Frame-Options", value: "DENY" }, { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "no-referrer" }, { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
      { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" }] }];
  },
};

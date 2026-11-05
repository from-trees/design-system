// Synthetic shape follows Cabinitron's landed customer directory, not a CRM integration.
export function customerExample(id: string) {
  const index = Number(id.split("-").at(-1)) - 1;
  const displayName =
    ["Alex Morgan", "Sam Rivera", "Jordan Chen", "Riley Kim"][index] ??
    "Example customer";
  return {
    id,
    displayName,
    companyName: index === 1 ? "Rivera Design Studio" : "",
    status: ["active", "lead", "completed", "archived"][index] ?? "active",
    notes: "Confirm installation access before scheduling.",
    reviewRequired: index === 2,
    contacts: [
      {
        id: id + "-primary",
        displayName,
        email: ["alex", "sam", "jordan", "riley"][index] + "@example.test",
        phone: "555-0100",
        role: "Primary contact",
        status: "active",
      },
      {
        id: id + "-secondary",
        displayName: "Casey Morgan",
        email: "casey@example.test",
        phone: "555-0101",
        role: "Project contact",
        status: "active",
      },
    ],
    addresses: [
      {
        id: id + "-billing",
        addressType: "billing",
        label: "Billing address",
        line1: "100 Example Lane",
        city: "Example City",
        region: "CA",
        postalCode: "90000",
        status: "active",
      },
      {
        id: id + "-site",
        addressType: "project_site",
        label: "Project site",
        line1: "200 Sample Avenue",
        city: "Example City",
        region: "CA",
        postalCode: "90000",
        status: "active",
      },
    ],
  };
}

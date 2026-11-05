import * as stylex from "@stylexjs/stylex";
import { InfoTooltip, List, Panel, ParameterRow, Status } from "@from-trees/ui";
import { layout, gap } from "@from-trees/ui/utilities";
import { businessPath } from "./workspaceNavigationModel";
import { customerExample } from "./customerDirectoryData";
export function CustomerDirectoryProfile({
  id,
  section,
  onOpenChild,
  onOpenRelated,
}: {
  id: string;
  section: string;
  onOpenChild: (kind: "contacts" | "addresses", id: string) => void;
  onOpenRelated: (path: string, revision?: string) => void;
}) {
  const customer = customerExample(id);
  if (section === "contacts")
    return (
      <List
        label="Customer contacts"
        items={customer.contacts.map((contact, index) => ({
          id: contact.id,
          title: contact.displayName,
          metadata: `${index === 0 ? "Primary · " : ""}${contact.email} · ${contact.role} · ${contact.status}`,
          actions: [
            {
              id: "view",
              label: "View contact",
              icon: "view",
              onAction: () => onOpenChild("contacts", contact.id),
            },
          ],
        }))}
      />
    );
  if (section === "addresses")
    return (
      <List
        label="Customer addresses"
        items={customer.addresses.map((address) => ({
          id: address.id,
          title: address.label,
          metadata: `${address.line1} · ${address.city} · ${address.status}`,
          actions: [
            {
              id: "view",
              label: "View address",
              icon: "view",
              onAction: () => onOpenChild("addresses", address.id),
            },
          ],
        }))}
      />
    );
  if (section === "related")
    return (
      <List
        label="Customer related records"
        items={[
          {
            id: "estimate",
            title: "EST-1001",
            metadata: "Estimate · saved revision 2",
            path: "/work/estimates/estimates-1",
            revision: "2",
          },
          {
            id: "approval",
            title: "Kitchen design confirmation",
            metadata: "Design approval · saved revision 3",
            path: "/work/approvals/approvals-1",
            revision: "3",
          },
          {
            id: "invoice",
            title: "INV-1001",
            metadata: "Invoice · saved revision 1",
            path: "/work/invoices/invoices-1",
            revision: "1",
          },
          {
            id: "project",
            title: "Kitchen renovation",
            metadata: "Design project",
            path: "/work/designs/designs-1",
          },
          {
            id: "inquiry",
            title: "Kitchen cabinetry",
            metadata: "Customer inquiry",
            path: "/customers/inquiries/inquiries-1",
          },
        ].map((item) => ({
          id: item.id,
          title: item.title,
          metadata: item.metadata,
          actions: [
            {
              id: "open",
              label: "Open " + item.title,
              icon: "external",
              onAction: () =>
                onOpenRelated(businessPath + item.path, item.revision),
            },
          ],
        }))}
      />
    );
  if (section === "activity")
    return <Status>Customer version 3 · Example team member · Nov 4</Status>;
  return (
    <div {...stylex.props(layout.stack, gap.lg)}>
      {customer.reviewRequired && (
        <Status tone="warning">Imported identity needs review.</Status>
      )}
      <Panel
        title="Customer profile"
        actions={
          <InfoTooltip label="Saved customer identity">
            Contacts and addresses belong to this customer. Updating directory
            details does not rewrite saved document revisions. Archived
            references remain readable; new work requires active selections.
          </InfoTooltip>
        }
      >
        {[
          ["Customer", customer.displayName],
          ["Company", customer.companyName || "—"],
          ["Lifecycle", customer.status],
          ["Primary contact", customer.contacts[0].displayName],
          ["Email", customer.contacts[0].email],
          ["Phone", customer.contacts[0].phone],
          ["Internal notes", customer.notes],
        ].map(([label, value]) => (
          <ParameterRow key={label} label={label}>
            <span>{value}</span>
          </ParameterRow>
        ))}
      </Panel>
    </div>
  );
}

import type { TableBlock } from "@/lib/services/portal-types"
import { DashboardCard } from "@/components/system/dashboard-card"
import { StatusBadge } from "@/components/system/status-badge"

export function DataTable({ title, description, columns, rows }: TableBlock) {
  return (
    <DashboardCard title={title} description={description}>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-white/5 text-sm">
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column.key} className="px-3 py-3 text-left font-medium text-muted-foreground">
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {rows.map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-white/[0.03] transition-colors">
                {columns.map((column) => {
                  const value = row[column.key]
                  const shouldBadge = column.key === "status"
                  return (
                    <td key={column.key} className="px-3 py-3 text-foreground/90">
                      {shouldBadge ? <StatusBadge status={value} /> : value}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardCard>
  )
}

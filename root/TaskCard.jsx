import type { Task } from "@/types/task"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CalendarDays, User, Globe, LinkIcon } from "lucide-react"

interface TaskCardProps {
  task: Task
}

const statusColors = {
  pending: "bg-gray-100 text-gray-800",
  in_progress: "bg-blue-100 text-blue-800",
  dev_complete: "bg-yellow-100 text-yellow-800",
  in_qc: "bg-purple-100 text-purple-800",
  qc_passed: "bg-green-100 text-green-800",
  qc_failed: "bg-red-100 text-red-800",
  completed: "bg-emerald-100 text-emerald-800",
}

const statusLabels = {
  pending: "Pending",
  in_progress: "In Progress",
  dev_complete: "Dev Complete",
  in_qc: "In QC",
  qc_passed: "QC Passed",
  qc_failed: "QC Failed",
  completed: "Completed",
}

export function TaskCard({ task }: TaskCardProps) {
  const formatDate = (dateString?: string) => {
    if (!dateString) return "Not started"
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg font-semibold">{task.jobName}</CardTitle>
          <Badge className={statusColors[task.status]}>{statusLabels[task.status]}</Badge>
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Globe className="h-4 w-4" />
            {task.siteId}
          </div>
          <div className="flex items-center gap-1">
            <User className="h-4 w-4" />
            {task.developer}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium">Platform:</span> {task.platform}
          </div>
          <div>
            <span className="font-medium">Pages:</span> {task.numberOfPages}
          </div>
          <div>
            <span className="font-medium">Type:</span> {task.typeOfRequest}
          </div>
          <div className="flex items-center gap-1">
            <LinkIcon className="h-3 w-3" />
            <a
              href={task.salesforceLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline truncate"
            >
              Salesforce
            </a>
          </div>
        </div>

        {task.commentsRequired && task.comments && (
          <div>
            <span className="font-medium text-sm">Comments:</span>
            <p className="text-sm text-muted-foreground mt-1">{task.comments}</p>
          </div>
        )}

        {task.additionalComments && (
          <div>
            <span className="font-medium text-sm">Additional Comments:</span>
            <p className="text-sm text-muted-foreground mt-1">{task.additionalComments}</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
          <div>
            <div className="flex items-center gap-1 mb-1">
              <CalendarDays className="h-3 w-3" />
              <span className="font-medium">Dev Timeline</span>
            </div>
            <div>Started: {formatDate(task.devStartTime)}</div>
            <div>Completed: {formatDate(task.devCompletedTime)}</div>
          </div>
          <div>
            <div className="flex items-center gap-1 mb-1">
              <CalendarDays className="h-3 w-3" />
              <span className="font-medium">QC Timeline</span>
            </div>
            <div>Started: {formatDate(task.qcStartTime)}</div>
            <div>Completed: {formatDate(task.qcCompletedTime)}</div>
          </div>
        </div>

        {task.devNotes && (
          <div>
            <span className="font-medium text-sm">Dev Notes:</span>
            <p className="text-sm text-muted-foreground mt-1">{task.devNotes}</p>
          </div>
        )}

        {task.qcNotes && (
          <div>
            <span className="font-medium text-sm">QC Notes:</span>
            <p className="text-sm text-muted-foreground mt-1">{task.qcNotes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

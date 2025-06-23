"use client"

import { useState, useEffect } from "react"
import type { Task } from "@/types/task"
import { getTasks, updateTaskStatus } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Loader2, Play, Send } from "lucide-react"

const statusColors = {
  pending: "bg-gray-100 text-gray-800",
  in_progress: "bg-blue-100 text-blue-800",
  dev_complete: "bg-yellow-100 text-yellow-800",
  in_qc: "bg-purple-100 text-purple-800",
  qc_passed: "bg-green-100 text-green-800",
  qc_failed: "bg-red-100 text-red-800",
  completed: "bg-emerald-100 text-emerald-800",
}

export function DeveloperDashboard() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [devNotes, setDevNotes] = useState<{ [taskId: string]: string }>({})
  const [selectedDeveloper] = useState("John Doe") // In a real app, this would come from auth

  useEffect(() => {
    loadTasks()
  }, [])

  const loadTasks = async () => {
    try {
      const allTasks = await getTasks()
      // Filter tasks assigned to the current developer
      const developerTasks = allTasks.filter(
        (task) =>
          task.developer === selectedDeveloper &&
          ["pending", "in_progress", "dev_complete", "qc_failed"].includes(task.status),
      )
      setTasks(developerTasks)
    } catch (error) {
      console.error("Failed to load tasks:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleStartTask = async (taskId: string) => {
    setActionLoading(taskId)
    try {
      const updatedTask = await updateTaskStatus(taskId, "in_progress")
      setTasks((prev) => prev.map((task) => (task.id === taskId ? updatedTask : task)))
    } catch (error) {
      console.error("Failed to start task:", error)
    } finally {
      setActionLoading(null)
    }
  }

  const handleSendForQC = async (taskId: string) => {
    setActionLoading(taskId)
    try {
      const notes = devNotes[taskId] || ""
      const updatedTask = await updateTaskStatus(taskId, "dev_complete", notes)
      setTasks((prev) => prev.map((task) => (task.id === taskId ? updatedTask : task)))
      setDevNotes((prev) => ({ ...prev, [taskId]: "" }))
    } catch (error) {
      console.error("Failed to send for QC:", error)
    } finally {
      setActionLoading(null)
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Not started"
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Developer Dashboard</h1>
        <div className="text-sm text-muted-foreground">
          Logged in as: <span className="font-medium">{selectedDeveloper}</span>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>My Tasks ({tasks.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Job Name</TableHead>
                  <TableHead>Site ID</TableHead>
                  <TableHead>Platform</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Pages</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Started</TableHead>
                  <TableHead>Dev Notes</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tasks.map((task) => (
                  <TableRow key={task.id}>
                    <TableCell className="font-medium">{task.jobName}</TableCell>
                    <TableCell>{task.siteId}</TableCell>
                    <TableCell>{task.platform}</TableCell>
                    <TableCell>{task.typeOfRequest}</TableCell>
                    <TableCell>{task.numberOfPages}</TableCell>
                    <TableCell>
                      <Badge className={statusColors[task.status]}>{task.status.replace("_", " ").toUpperCase()}</Badge>
                    </TableCell>
                    <TableCell>{formatDate(task.devStartTime)}</TableCell>
                    <TableCell>
                      <div className="w-32">
                        <Textarea
                          placeholder="Add dev notes..."
                          value={devNotes[task.id] || task.devNotes || ""}
                          onChange={(e) => setDevNotes((prev) => ({ ...prev, [task.id]: e.target.value }))}
                          rows={2}
                          className="text-xs"
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {task.status === "pending" && (
                          <Button
                            size="sm"
                            onClick={() => handleStartTask(task.id)}
                            disabled={actionLoading === task.id}
                          >
                            {actionLoading === task.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <>
                                <Play className="h-4 w-4 mr-1" />
                                Start
                              </>
                            )}
                          </Button>
                        )}
                        {(task.status === "in_progress" || task.status === "qc_failed") && (
                          <Button
                            size="sm"
                            onClick={() => handleSendForQC(task.id)}
                            disabled={actionLoading === task.id}
                          >
                            {actionLoading === task.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <>
                                <Send className="h-4 w-4 mr-1" />
                                Send for QC
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {tasks.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">No tasks assigned to you at the moment.</div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import type { Task } from "@/types/task"
import { getTasks, updateTaskStatus } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Loader2, CheckCircle, XCircle } from "lucide-react"

const statusColors = {
  pending: "bg-gray-100 text-gray-800",
  in_progress: "bg-blue-100 text-blue-800",
  dev_complete: "bg-yellow-100 text-yellow-800",
  in_qc: "bg-purple-100 text-purple-800",
  qc_passed: "bg-green-100 text-green-800",
  qc_failed: "bg-red-100 text-red-800",
  completed: "bg-emerald-100 text-emerald-800",
}

export function QCDashboard() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [qcNotes, setQcNotes] = useState<{ [taskId: string]: string }>({})

  useEffect(() => {
    loadTasks()
  }, [])

  const loadTasks = async () => {
    try {
      const allTasks = await getTasks()
      // Filter tasks that are ready for QC or in QC
      const qcTasks = allTasks.filter((task) => ["dev_complete", "in_qc"].includes(task.status))
      setTasks(qcTasks)
    } catch (error) {
      console.error("Failed to load tasks:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleStartQC = async (taskId: string) => {
    setActionLoading(taskId)
    try {
      const updatedTask = await updateTaskStatus(taskId, "in_qc")
      setTasks((prev) => prev.map((task) => (task.id === taskId ? updatedTask : task)))
    } catch (error) {
      console.error("Failed to start QC:", error)
    } finally {
      setActionLoading(null)
    }
  }

  const handlePassQC = async (taskId: string) => {
    setActionLoading(taskId)
    try {
      const notes = qcNotes[taskId] || ""
      const updatedTask = await updateTaskStatus(taskId, "qc_passed", notes)
      setTasks((prev) => prev.filter((task) => task.id !== taskId))
      setQcNotes((prev) => ({ ...prev, [taskId]: "" }))
    } catch (error) {
      console.error("Failed to pass QC:", error)
    } finally {
      setActionLoading(null)
    }
  }

  const handleFailQC = async (taskId: string) => {
    setActionLoading(taskId)
    try {
      const notes = qcNotes[taskId] || ""
      const updatedTask = await updateTaskStatus(taskId, "qc_failed", notes)
      setTasks((prev) => prev.filter((task) => task.id !== taskId))
      setQcNotes((prev) => ({ ...prev, [taskId]: "" }))
    } catch (error) {
      console.error("Failed to fail QC:", error)
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
        <h1 className="text-3xl font-bold">QC Dashboard</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tasks Awaiting QC ({tasks.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Job Name</TableHead>
                  <TableHead>Site ID</TableHead>
                  <TableHead>Platform</TableHead>
                  <TableHead>Developer</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Pages</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Dev Completed</TableHead>
                  <TableHead>Dev Notes</TableHead>
                  <TableHead>QC Notes</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tasks.map((task) => (
                  <TableRow key={task.id}>
                    <TableCell className="font-medium">{task.jobName}</TableCell>
                    <TableCell>{task.siteId}</TableCell>
                    <TableCell>{task.platform}</TableCell>
                    <TableCell>{task.developer}</TableCell>
                    <TableCell>{task.typeOfRequest}</TableCell>
                    <TableCell>{task.numberOfPages}</TableCell>
                    <TableCell>
                      <Badge className={statusColors[task.status]}>{task.status.replace("_", " ").toUpperCase()}</Badge>
                    </TableCell>
                    <TableCell>{formatDate(task.devCompletedTime)}</TableCell>
                    <TableCell>
                      <div className="max-w-32 text-xs text-muted-foreground">{task.devNotes || "No notes"}</div>
                    </TableCell>
                    <TableCell>
                      <div className="w-32">
                        <Textarea
                          placeholder="Add QC notes..."
                          value={qcNotes[task.id] || task.qcNotes || ""}
                          onChange={(e) => setQcNotes((prev) => ({ ...prev, [task.id]: e.target.value }))}
                          rows={2}
                          className="text-xs"
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {task.status === "dev_complete" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleStartQC(task.id)}
                            disabled={actionLoading === task.id}
                          >
                            {actionLoading === task.id ? <Loader2 className="h-4 w-4 animate-spin" /> : "Start QC"}
                          </Button>
                        )}
                        {task.status === "in_qc" && (
                          <>
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => handlePassQC(task.id)}
                              disabled={actionLoading === task.id}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              {actionLoading === task.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <>
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Pass
                                </>
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleFailQC(task.id)}
                              disabled={actionLoading === task.id}
                            >
                              {actionLoading === task.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <>
                                  <XCircle className="h-4 w-4 mr-1" />
                                  Fail
                                </>
                              )}
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {tasks.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">No tasks awaiting QC at the moment.</div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

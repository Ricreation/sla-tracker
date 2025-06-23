"use client"

import type React from "react"

import { useState, useEffect } from "react"
import type { Task, Developer, TaskFormData } from "@/types/task"
import { getTasks, getDevelopers, createTask } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Loader2, Plus } from "lucide-react"

const typeOfRequestOptions = [
  "Full Redesign",
  "Content Update",
  "New Feature",
  "Bug Fix",
  "SEO Optimization",
  "Performance Optimization",
]

const statusColors = {
  pending: "bg-gray-100 text-gray-800",
  in_progress: "bg-blue-100 text-blue-800",
  dev_complete: "bg-yellow-100 text-yellow-800",
  in_qc: "bg-purple-100 text-purple-800",
  qc_passed: "bg-green-100 text-green-800",
  qc_failed: "bg-red-100 text-red-800",
  completed: "bg-emerald-100 text-emerald-800",
}

export function AdminDashboard() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [developers, setDevelopers] = useState<Developer[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState<TaskFormData>({
    jobName: "",
    siteId: "",
    platform: "WP",
    developer: "",
    typeOfRequest: "",
    numberOfPages: 1,
    salesforceLink: "",
    commentsRequired: false,
    comments: "",
    additionalComments: "",
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [tasksData, developersData] = await Promise.all([getTasks(), getDevelopers()])
      setTasks(tasksData)
      setDevelopers(developersData)
    } catch (error) {
      console.error("Failed to load data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const newTask = await createTask({
        ...formData,
        comments: formData.commentsRequired ? formData.comments : undefined,
      })
      setTasks((prev) => [newTask, ...prev])

      // Reset form
      setFormData({
        jobName: "",
        siteId: "",
        platform: "WP",
        developer: "",
        typeOfRequest: "",
        numberOfPages: 1,
        salesforceLink: "",
        commentsRequired: false,
        comments: "",
        additionalComments: "",
      })
    } catch (error) {
      console.error("Failed to create task:", error)
    } finally {
      setSubmitting(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
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
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      </div>

      {/* Task Creation Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Create New Task
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="jobName">Job Name</Label>
                <Input
                  id="jobName"
                  value={formData.jobName}
                  onChange={(e) => setFormData((prev) => ({ ...prev, jobName: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="siteId">Site ID</Label>
                <Input
                  id="siteId"
                  value={formData.siteId}
                  onChange={(e) => setFormData((prev) => ({ ...prev, siteId: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="platform">Platform</Label>
                <Select
                  value={formData.platform}
                  onValueChange={(value: "WP" | "DUDA") => setFormData((prev) => ({ ...prev, platform: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="WP">WordPress</SelectItem>
                    <SelectItem value="DUDA">DUDA</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="developer">Developer</Label>
                <Select
                  value={formData.developer}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, developer: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select developer" />
                  </SelectTrigger>
                  <SelectContent>
                    {developers.map((dev) => (
                      <SelectItem key={dev.id} value={dev.name}>
                        {dev.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="typeOfRequest">Type of Request</Label>
                <Select
                  value={formData.typeOfRequest}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, typeOfRequest: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {typeOfRequestOptions.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="numberOfPages">Number of Pages</Label>
                <Input
                  id="numberOfPages"
                  type="number"
                  min="1"
                  value={formData.numberOfPages}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, numberOfPages: Number.parseInt(e.target.value) || 1 }))
                  }
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="salesforceLink">Salesforce Link</Label>
              <Input
                id="salesforceLink"
                type="url"
                value={formData.salesforceLink}
                onChange={(e) => setFormData((prev) => ({ ...prev, salesforceLink: e.target.value }))}
                required
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="commentsRequired"
                checked={formData.commentsRequired}
                onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, commentsRequired: !!checked }))}
              />
              <Label htmlFor="commentsRequired">Comments Required</Label>
            </div>

            {formData.commentsRequired && (
              <div>
                <Label htmlFor="comments">Comments</Label>
                <Textarea
                  id="comments"
                  value={formData.comments}
                  onChange={(e) => setFormData((prev) => ({ ...prev, comments: e.target.value }))}
                  rows={3}
                />
              </div>
            )}

            <div>
              <Label htmlFor="additionalComments">Additional Comments</Label>
              <Textarea
                id="additionalComments"
                value={formData.additionalComments}
                onChange={(e) => setFormData((prev) => ({ ...prev, additionalComments: e.target.value }))}
                rows={3}
              />
            </div>

            <Button type="submit" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Task...
                </>
              ) : (
                "Create Task"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Tasks Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Tasks ({tasks.length})</CardTitle>
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
                  <TableHead>Created</TableHead>
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
                    <TableCell>{formatDate(task.createdAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

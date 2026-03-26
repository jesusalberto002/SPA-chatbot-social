"use client"

import { useState, useEffect } from "react"
import { Search, Edit, Trash2, Ban, CheckCircle, X, Crown } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import api from "../../../api/axios"
import toastService from "../../../services/toastService"
import SuspensionModal from "./suspensionModal"

const EditUserModal = ({ user, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    subscription: user.subscription,
    status: user.status,
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(user.id, formData)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center">
      <motion.div
        className="p-6 shadow-xl max-w-md w-full mx-4 relative rounded-lg border"
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        style={{
          backgroundColor: "var(--bg-modal)",
          borderColor: "var(--border-primary)",
        }}
      >
        <button onClick={onClose} className="absolute top-3 right-3 transition-colors tertiary-text hover:main-text">
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-lg font-semibold mb-4 main-text">Edit User</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium secondary-text mb-1">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full form-input rounded-md p-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium secondary-text mb-1">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full form-input rounded-md p-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium secondary-text mb-1">Subscription</label>
            <select
              value={formData.subscription}
              onChange={(e) => setFormData({ ...formData, subscription: e.target.value })}
              className="w-full form-input rounded-md p-2"
            >
              <option value="FREE">Free</option>
              <option value="BRONZE">Bronze</option>
              <option value="PLATINUM">Platinum</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium secondary-text mb-1">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full form-input rounded-md p-2"
            >
              <option value="ACTIVE">Active</option>
              <option value="SUSPENDED">Suspended</option>
            </select>
          </div>

          <div className="flex justify-end gap-4 mt-6">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg button-secondary">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 rounded-lg button-primary">
              Save Changes
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

const ConfirmModal = ({ title, message, onConfirm, onCancel, type = "danger" }) => {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center">
      <motion.div
        className="p-6 shadow-xl max-w-md w-full mx-4 relative rounded-lg border"
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        style={{
          backgroundColor: "var(--bg-modal)",
          borderColor: "var(--border-primary)",
        }}
      >
        <h2 className="text-lg font-semibold mb-4 main-text">{title}</h2>
        <p className="secondary-text mb-6">{message}</p>

        <div className="flex justify-end gap-4">
          <button onClick={onCancel} className="px-4 py-2 rounded-lg button-secondary">
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 rounded-lg ${type === "danger" ? "bg-red-600 hover:bg-red-700 text-white" : "button-primary"}`}
          >
            Confirm
          </button>
        </div>
      </motion.div>
    </div>
  )
}

export default function UsersManagement() {
  const [users, setUsers] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [editingUser, setEditingUser] = useState(null)
  const [suspendingUser, setSuspendingUser] = useState(null)
  const [confirmAction, setConfirmAction] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalUsers, setTotalUsers] = useState(0)
  const [hasSearched, setHasSearched] = useState(false)

  const fetchUsers = async (page = 1, search = "") => {
    // Only fetch if there is a search term
    if (!search.trim()) {
        setUsers([]);
        setTotalUsers(0);
        setHasSearched(false);
        return;
    }

    setIsLoading(true)
    setError(null)
    setHasSearched(true); // Mark that a search has been made

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        search,
      })

      const response = await api.get(`/admin/user/search?${params.toString()}`)
      const { users: fetchedUsers, totalPages: pages, totalUsers: total } = response.data

      setUsers(fetchedUsers)
      setTotalPages(pages)
      setTotalUsers(total)
      setCurrentPage(page)
    } catch (error) {
      console.error("Failed to fetch users:", error)
      setError("Could not load users. Please try again later.")
      setUsers([]); // Clear users on error
    } finally {
      setIsLoading(false)
    }
  }
 
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchUsers(1, searchTerm)
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [searchTerm])

  const handleEditUser = (user) => setEditingUser(user);

  const handleSaveUser = async (userId, formData) => {
    try {
      const response = await api.put(`/admin/users/${userId}`, formData)
      const updatedUser = response.data

      setUsers(users.map((user) => (user.id === userId ? updatedUser : user)))
      toastService.success("User updated successfully")
    } catch (error) {
      console.error("Failed to update user:", error)
      toastService.error("Failed to update user. Please try again.")
      setUsers(users.map((user) => (user.id === userId ? { ...user, ...formData } : user)))
    }
  }

  const handleSuspendUser = (user) => {
    // If user is active, open the detailed suspension modal
    if (user.status === "ACTIVE") {
      setSuspendingUser(user)
    } else {
      // If user is already suspended, use a simple confirmation to reactivate
      setConfirmAction({
        type: "activate",
        user,
        title: "Activate User",
        message: `Are you sure you want to activate ${user.name}?`,
        onConfirm: async () => {
          try {
            await api.post(`/admin/user/lift-suspension/${user.id}`)
            setUsers(users.map((u) => (u.id === user.id ? { ...u, status: "ACTIVE" } : u)))
            toastService.success(`User activated successfully`)
          } catch (error) {
            console.error(`Failed to activate user:`, error)
            toastService.error(`Failed to activate user. Please try again.`)
          }
          setConfirmAction(null)
        },
      })
    }
  }

  // ADD THIS - New handler for the SuspensionModal's confirm action
  const handleConfirmSuspension = async ({ userId, reason, duration }) => {
    try {
      // Assuming an endpoint like this. Adjust if your API is different.
      await api.post(`/admin/user/suspend/${userId}`, { reason, duration })

      // Update UI optimistically
      setUsers(users.map((u) => (u.id === userId ? { ...u, status: "SUSPENDED" } : u)))
      toastService.success("User suspended successfully")
    } catch (error) {
      console.error("Failed to suspend user:", error)
      toastService.error("Failed to suspend user. Please try again.")
    } finally {
      setSuspendingUser(null) // Close the modal
    }
  }

  const handleDeleteUser = (user) => {
    setConfirmAction({
      type: "delete",
      user,
      title: "Delete User",
      message: `Are you sure you want to permanently delete ${user.name}? This action cannot be undone.`,
      onConfirm: async () => {
        try {
          await api.delete(`/admin/users/${user.id}`)

          setUsers(users.filter((u) => u.id !== user.id))
          setTotalUsers((prev) => prev - 1)
          toastService.success("User deleted successfully")
        } catch (error) {
          console.error("Failed to delete user:", error)
          toastService.error("Failed to delete user. Please try again.")
          setUsers(users.filter((u) => u.id !== user.id))
        }
        setConfirmAction(null)
      },
    })
  }

  const handlePageChange = (page) => {
    fetchUsers(page, searchTerm)
  }

  if (isLoading) return <div className="text-center main-text py-10">Loading users...</div>
  if (error && users.length === 0) return <div className="text-center status-error py-10">{error}</div>

  return (
    <>
      <AnimatePresence>
        {editingUser && (
          <EditUserModal user={editingUser} onClose={() => setEditingUser(null)} onSave={handleSaveUser} />
        )}
        {suspendingUser && (
          <SuspensionModal
            user={suspendingUser}
            onClose={() => setSuspendingUser(null)}
            onConfirm={handleConfirmSuspension}
          />
        )}

        {confirmAction && (
          <ConfirmModal
            title={confirmAction.title}
            message={confirmAction.message}
            onConfirm={confirmAction.onConfirm}
            onCancel={() => setConfirmAction(null)}
            // MODIFIED - Use 'warning' for activate to avoid red button
            type={confirmAction.type === "delete" ? "danger" : "warning"}
          />
        )}
      </AnimatePresence>

      <div className="space-y-6">
        {/* Search Section */}
        <div className="card-secondary p-4 md:p-6 rounded-lg">
          <h3 className="text-lg font-semibold main-text mb-4">Search Users</h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 tertiary-text" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 form-input rounded-lg"
            />
          </div>
          {/* FIX: Now correctly uses totalUsers from state */}
          {hasSearched && !isLoading && (
            <p className="mt-2 text-sm tertiary-text">
              Found {totalUsers} user{totalUsers !== 1 ? "s" : ""}
            </p>
          )}
          {error && (
            <p className="mt-2 text-sm text-red-500">Warning: {error}</p>
          )}
        </div>

        {/* Users List Container */}
        <div className="card-secondary rounded-lg overflow-hidden min-h-[400px]">
          <div className="p-4 md:p-6 border-b" style={{ borderColor: "var(--border-primary)" }}>
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold main-text">
                {hasSearched ? `Search Results` : "Users"} ({totalUsers})
              </h3>
              {totalPages > 1 && (
                <p className="hidden sm:block text-sm tertiary-text">
                  Page {currentPage} of {totalPages}
                </p>
              )}
            </div>
          </div>

          {/* Conditional Content: Loading, Error, Placeholders, or Data */}
          {isLoading ? (
            <div className="text-center main-text py-10">Loading users...</div>
          ) : !hasSearched ? (
             <div className="text-center tertiary-text p-10">
                <p>Start typing in the search bar to find users by ID, name, or email.</p>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center tertiary-text p-10">
                <p>No users found matching "{searchTerm}".</p>
            </div>
          ) : (
            <>
              {/* DESKTOP TABLE VIEW */}
              <div className="overflow-x-auto hidden md:block">
                <table className="w-full">
                  <thead style={{ backgroundColor: "var(--bg-tertiary)" }}>
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium secondary-text uppercase tracking-wider">User</th>
                      <th className="px-6 py-3 text-left text-xs font-medium secondary-text uppercase tracking-wider">Subscription</th>
                      <th className="px-6 py-3 text-left text-xs font-medium secondary-text uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium secondary-text uppercase tracking-wider">Created</th>
                      <th className="px-6 py-3 text-left text-xs font-medium secondary-text uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody style={{ divideColor: "var(--border-tertiary)" }}>
                    {/* FIX: Mapped over `users` directly */}
                    {users.map((user) => (
                      <tr key={user.id} className="hover-interactive">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium main-text flex items-center gap-2">
                              {user.name}
                              {user.subscription === "PLATINUM" && <Crown className="w-4 h-4 text-purple-500" />}
                            </div>
                            <div className="text-sm tertiary-text">{user.email}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${user.subscription === "PLATINUM" ? "bg-purple-100 text-purple-800" : user.subscription === "BRONZE" ? "bg-yellow-100 text-yellow-800" : "bg-gray-100 text-gray-800"}`}>
                            {user.subscription}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${ user.status === "ACTIVE" ? "text-green-500 bg-green-500/10" : "text-red-500 bg-red-500/10" }`}>
                            {user.status === "ACTIVE" ? <CheckCircle className="w-3 h-3 mr-1" /> : <Ban className="w-3 h-3 mr-1" />}
                            {user.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm tertiary-text">{new Date(user.createdAt).toLocaleDateString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center gap-2">
                            <button onClick={() => handleEditUser(user)} className="p-1 rounded hover-interactive" title="Edit user"><Edit className="w-4 h-4 text-blue-500" /></button>
                            <button onClick={() => handleSuspendUser(user)} className="p-1 rounded hover-interactive" title={user.status === "ACTIVE" ? "Suspend user" : "Activate user"}>
                              {user.status === "ACTIVE" ? <Ban className="w-4 h-4 text-yellow-500" /> : <CheckCircle className="w-4 h-4 text-green-500" />}
                            </button>
                            <button onClick={() => handleDeleteUser(user)} className="p-1 rounded hover-interactive" title="Delete user"><Trash2 className="w-4 h-4 text-red-500" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* MOBILE CARD VIEW */}
              <div className="divide-y md:hidden" style={{ divideColor: "var(--border-primary)" }}>
                {/* FIX: Mapped over `users` directly */}
                {users.map((user) => (
                  <div key={user.id} className="p-4 space-y-3">
                    <div className="flex justify-between items-start gap-2">
                      <div className="min-w-0">
                        <div className="text-sm font-medium main-text flex items-center gap-2 truncate">
                            {user.name}
                            {user.subscription === "PLATINUM" && <Crown className="w-4 h-4 text-purple-500 flex-shrink-0" />}
                        </div>
                        <div className="text-sm tertiary-text truncate">{user.email}</div>
                      </div>
                      <div className="flex items-center gap-0 flex-shrink-0">
                        <button onClick={() => handleEditUser(user)} className="p-2 rounded-full hover-interactive"><Edit className="w-4 h-4 text-blue-500" /></button>
                        <button onClick={() => handleSuspendUser(user)} className="p-2 rounded-full hover-interactive">
                          {user.status === "ACTIVE" ? <Ban className="w-4 h-4 text-yellow-500" /> : <CheckCircle className="w-4 h-4 text-green-500" />}
                        </button>
                        <button onClick={() => handleDeleteUser(user)} className="p-2 rounded-full hover-interactive"><Trash2 className="w-4 h-4 text-red-500" /></button>
                      </div>
                    </div>
                     <div className="flex items-center justify-between text-xs">
                        <span className={`inline-flex px-2 py-1 font-semibold rounded-full ${ user.subscription === "PLATINUM" ? "bg-purple-100 text-purple-800" : user.subscription === "BRONZE" ? "bg-yellow-100 text-yellow-800" : "bg-gray-100 text-gray-800" }`}>
                          {user.subscription}
                        </span>
                        <span className={`inline-flex items-center gap-1 font-semibold ${ user.status === "ACTIVE" ? "text-green-500" : "text-red-500" }`}>
                          {user.status === "ACTIVE" ? <CheckCircle className="w-3 h-3" /> : <Ban className="w-3 h-3" />}
                          {user.status}
                        </span>
                      </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Pagination */}
          {hasSearched && !isLoading && totalPages > 1 && (
            <div className="p-4 border-t flex justify-center items-center gap-2" style={{ borderColor: "var(--border-primary)" }}>
               <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="px-3 py-1 rounded button-secondary disabled:opacity-50 disabled:cursor-not-allowed">Prev</button>
               <span className="text-sm font-medium tertiary-text">
                 Page {currentPage} of {totalPages}
               </span>
               <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="px-3 py-1 rounded button-secondary disabled:opacity-50 disabled:cursor-not-allowed">Next</button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  FaBell,
  FaEdit,
  FaTrash,
  FaChevronDown,
  FaList,
  FaTh,
} from "react-icons/fa";
import {
  connectSocket,
  onEvent,
  offEvent,
  disconnectSocket,
} from "../service/socketService";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { DeleteTaskModal } from "./modal/DeleteTaskModal";
import { CreateTaskModal } from "./modal/CreateTaskModal";
import { EditTaskModal } from "./modal/EditTaskModal";
import { KanbanBoard } from "./KanbanBoard";
import { formatDate } from "./utils/formatDate";
const statusList = ["All", "Pending", "In Progress", "Completed"];
const updateStatusOptions = ["Pending", "In Progress", "Completed"];
const getStatusForAPI = (displayStatus: string): string => {
  switch (displayStatus) {
    case "In Progress":
      return "inprogress";
    case "Pending":
      return "pending";
    case "Completed":
      return "completed";
    default:
      return displayStatus.toLowerCase();
  }
};

const getDisplayStatus = (apiStatus: string): string => {
  switch (apiStatus) {
    case "inprogress":
      return "In Progress";
    case "pending":
      return "Pending";
    case "completed":
      return "Completed";
    default:
      return apiStatus.charAt(0).toUpperCase() + apiStatus.slice(1);
  }
};

const getStatusBadgeStyle = (status: string): string => {
  const displayStatus = getDisplayStatus(status);

  switch (displayStatus) {
    case "Pending":
      return "bg-red-100 text-red-800 hover:bg-red-200";
    case "In Progress":
      return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200";
    case "Completed":
      return "bg-green-100 text-green-800 hover:bg-green-200";
    default:
      return "bg-gray-100 text-gray-800 hover:bg-gray-200";
  }
};
const getCategoryBadgeStyle = (category: string): string => {
  switch (category) {
    case "high":
      return "bg-red-50 text-red-800 hover:bg-red-200";
    case "medium":
      return "bg-blue-50 text-blue-800 hover:bg-yellow-200";
    case "low":
      return "bg-yellow-50 text-yellow-800 hover:bg-green-200";
    default:
      return "bg-gray-50 text-gray-800 hover:bg-gray-200";
  }
};

const Dashboard = () => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [allTasks, setAllTasks] = useState<any[]>([]);
  const [users, setUsers] = useState<Map<string, string>>(new Map());
  const [userId, setUserId] = useState("");
  const [username, setUsername] = useState("");
  const [notifications, setNotifications] = useState<string[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [userLoading, setUserLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState<string | null>(
    null
  );
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);

  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [editTask, setEditTask] = useState<any | null>(null);

  const pageFromUrl = parseInt(searchParams.get("page") || "1", 10);
  const statusFromUrl = searchParams.get("status") || "All";
  const searchFromUrl = searchParams.get("search") || "";

  const [currentPage, setCurrentPage] = useState(pageFromUrl);
  const [filterStatus, setFilterStatus] = useState(statusFromUrl);
  const [searchQuery, setSearchQuery] = useState(searchFromUrl);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);

  const [showCreateModal, setShowCreateModal] = useState(false);

  const [viewMode, setViewMode] = useState<"list" | "kanban">("list");

  useEffect(() => {
    setCurrentPage(pageFromUrl);
    setFilterStatus(statusFromUrl);
    setSearchQuery(searchFromUrl);
  }, [pageFromUrl, statusFromUrl, searchFromUrl]);

  const updateURLParams = (page: number, status?: string, search?: string) => {
    const params = new URLSearchParams(searchParams);

    params.set("page", page.toString());

    if (status !== undefined) {
      if (status === "All") {
        params.delete("status");
      } else {
        params.set("status", status);
      }
    }

    if (search !== undefined) {
      if (search === "") {
        params.delete("search");
      } else {
        params.set("search", search);
      }
    }

    setSearchParams(params);
  };

  const fetchNotifications = async (): Promise<void> => {
    try {
      const res = await fetch("http://localhost:3000/api/notifications", {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications.map((n: any) => n.message));
      }
    } catch (error) {
      console.error("Notification fetch error:", error);
    }
  };

  const fetchUser = async (): Promise<{
    userId: string;
    username: string;
  } | null> => {
    try {
      setUserLoading(true);
      const userRes = await fetch("http://localhost:3000/api/auth/user", {
        credentials: "include",
      });

      if (!userRes.ok) throw new Error("Not authenticated");

      const userData = await userRes.json();
      const username = userData?.data?.user?.username || "";
      const userId = userData?.data?.user?._id || "";

      console.log("userData", userData);
      console.log("username", username);

      setUserId(userId);
      setUsername(username);

      return { userId, username };
    } catch (err) {
      console.error("User fetch error:", err);
      alert("Please login first");
      navigate("/login");
      return null;
    } finally {
      setUserLoading(false);
    }
  };

  const fetchTasks = async (page: number = 1): Promise<void> => {
    try {
      setLoading(true);
      const tasksRes = await fetch(
        `http://localhost:3000/api/tasks?page=${page}&limit=5`,
        {
          credentials: "include",
        }
      );

      if (!tasksRes.ok) {
        throw new Error("Failed to fetch tasks");
      }

      const taskData = await tasksRes.json();
      setTasks(taskData.tasks || []);
      setCurrentPage(taskData.currentPage || page);
      setTotalPages(taskData.totalPages || 1);

      await fetchTaskUsers(taskData.tasks || []);
    } catch (err) {
      console.error("Tasks fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllTasks = async (): Promise<void> => {
    try {
      const tasksRes = await fetch(
        `http://localhost:3000/api/tasks?limit=1000`,
        {
          credentials: "include",
        }
      );

      if (!tasksRes.ok) {
        throw new Error("Failed to fetch all tasks");
      }

      const taskData = await tasksRes.json();
      setAllTasks(taskData.tasks || []);

      await fetchTaskUsers(taskData.tasks || []);
    } catch (err) {
      console.error("All tasks fetch error:", err);
    }
  };

  const fetchTaskUsers = async (tasks: any[]): Promise<void> => {
    try {
      const uniqueUserIds = [...new Set(tasks.map((task: any) => task.user))];

      const userPromises = uniqueUserIds.map(async (userId) => {
        const stringUserId = userId as string;

        if (users.has(stringUserId)) {
          return null;
        }

        try {
          const userRes = await fetch(
            `http://localhost:3000/api/auth/users/${stringUserId}`,
            {
              credentials: "include",
            }
          );

          if (userRes.ok) {
            const userData = await userRes.json();
            return {
              id: stringUserId,
              username: userData?.data?.user?.username || "Unknown User",
            };
          }
        } catch (error) {
          console.error(`Failed to fetch user ${stringUserId}:`, error);
        }

        return { id: stringUserId, username: "Unknown User" };
      });

      const userResults = await Promise.all(userPromises);

      setUsers((prev) => {
        const newUsers = new Map(prev);
        userResults.forEach((result) => {
          if (result) {
            newUsers.set(result.id, result.username);
          }
        });
        return newUsers;
      });
    } catch (error) {
      console.error("Error fetching task users:", error);
    }
  };

  const updateTask = async (
    taskId: string,
    updates: Partial<{
      title: string;
      description: string;
      status: string;
      dueDate: string;
    }>
  ) => {
    try {
      setUpdatingTaskId(taskId);

      const currentTask = tasks.find((task) => task._id === taskId);
      if (!currentTask) {
        alert("Task not found");
        return;
      }

      const updatedTask = {
        title: updates.title ?? currentTask.title,
        description: updates.description ?? currentTask.description,
        status: updates.status
          ? getStatusForAPI(updates.status)
          : currentTask.status,
        completed: updates.status
          ? getStatusForAPI(updates.status) === "completed"
          : currentTask.completed,
        dueDate: updates.dueDate ?? currentTask.dueDate,
      };

      const response = await fetch(
        `http://localhost:3000/api/tasks/${taskId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(updatedTask),
        }
      );

      if (response.ok) {
        await Promise.all([fetchTasks(currentPage), fetchAllTasks()]);
        setShowStatusDropdown(null);
      } else {
        const errorData = await response.json();
        alert(`Failed to update task: ${errorData.message || "Unknown error"}`);
      }
    } catch (err) {
      console.error("Update task error:", err);
      alert("Something went wrong while updating the task.");
    } finally {
      setUpdatingTaskId(null);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(".status-dropdown-container")) {
        setShowStatusDropdown(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const initializeData = async () => {
      const userResult = await fetchUser();
      if (userResult) {
        await Promise.all([fetchTasks(pageFromUrl), fetchAllTasks()]);
        setInitialized(true);
      }
    };

    if (!initialized) {
      initializeData();
    }
  }, [pageFromUrl, initialized]);

  useEffect(() => {
    if (initialized && username && !userLoading) {
      fetchTasks(currentPage);
    }
  }, [currentPage, initialized, username, userLoading]);

  const refreshAllTasks = async () => {
    await fetchAllTasks();
  };

  useEffect(() => {
    if (!username || userLoading) return;

    connectSocket(userId);
    fetchNotifications();

    const handleNotification = (data: any) => {
      console.log("📥 Notification received:", data);
      setNotifications((prev) => [...prev, data]);
    };

    onEvent("notification", handleNotification);

    return () => {
      offEvent("notification", handleNotification);
      disconnectSocket();
    };
  }, [username, userId, userLoading]);

  const handlePageChange = async (newPage: number) => {
    if (newPage === currentPage || loading) return;

    setCurrentPage(newPage);
    updateURLParams(newPage);
    await fetchTasks(newPage);
  };

  const handleStatusFilter = (status: string) => {
    setFilterStatus(status);
    const newPage = 1;
    setCurrentPage(newPage);
    updateURLParams(newPage, status);
    fetchTasks(newPage);
  };

  const handleSearchChange = (search: string) => {
    setSearchQuery(search);
    const newPage = 1;
    setCurrentPage(newPage);
    updateURLParams(newPage, filterStatus, search);
  };

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();

  const filteredTasks = tasks.filter((task) => {
    const matchStatus =
      filterStatus === "All" ||
      (filterStatus === "Completed"
        ? task.completed || task.status === "completed"
        : filterStatus === "In Progress"
        ? task.status === "inprogress"
        : task.status === filterStatus.toLowerCase());
    const matchSearch = task.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchStatus && matchSearch;
  });

  const handleLogout = async () => {
    try {
      await fetch("http://localhost:3000/api/auth/logout", {
        credentials: "include",
      });
      disconnectSocket();
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
      navigate("/login");
    }
  };

  const openDeleteModal = (id: string) => {
    setTaskToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDeleteTask = async () => {
    if (!taskToDelete) return;

    try {
      const res = await fetch(
        `http://localhost:3000/api/tasks/${taskToDelete}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (res.ok) {
        setShowDeleteModal(false);
        setTaskToDelete(null);
        await fetchTasks(currentPage);
        refreshAllTasks();
      } else {
        alert("Failed to delete task");
      }
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  if (userLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-800 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="sticky top-0 z-50 w-full bg-blue-800 text-white p-4 flex justify-between items-center shadow">
        <h1 className="text-xl md:text-2xl font-bold">⌘ TaskTime</h1>
        <div className="flex items-center gap-4">
          <div className="relative">
            <div
              className="cursor-pointer"
              onClick={() => setShowNotifications((prev) => !prev)}
            >
              <FaBell className="text-xl" />
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-2 text-xs bg-red-600 text-white w-5 h-5 rounded-full flex items-center justify-center">
                  {notifications.length}
                </span>
              )}
            </div>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded shadow-lg z-50 border border-gray-200">
                <div className="p-4 font-semibold text-black border-b">
                  Notifications
                </div>
                <ul className="max-h-60 overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map((msg, index) => (
                      <li
                        key={index}
                        className="px-4 py-2 hover:bg-gray-100 text-sm border-b-2 text-gray-700"
                      >
                        {msg}
                      </li>
                    ))
                  ) : (
                    <li className="px-4 py-2 text-sm text-gray-500">
                      No notifications
                    </li>
                  )}
                </ul>
              </div>
            )}
          </div>
          <div className="w-10 h-10 rounded-full bg-white text-blue-800 flex items-center justify-center font-bold">
            {getInitials(username)}
          </div>
          <Button variant="secondary" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </header>

      <main className="grid md:grid-cols-3 gap-6 p-6">
        <section className="md:col-span-2 bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
            <h2 className="text-xl font-semibold">Your Tasks</h2>
            <div className="flex gap-2">
              <div className="flex bg-gray-100 rounded-lg p-1">
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="flex items-center gap-2"
                >
                  <FaList className="w-4 h-4" />
                  List
                </Button>
                <Button
                  variant={viewMode === "kanban" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("kanban")}
                  className="flex items-center gap-2"
                >
                  <FaTh className="w-4 h-4" />
                  Kanban
                </Button>
              </div>

              <Button
                onClick={() => setShowCreateModal(true)}
                className="bg-blue-600 text-white"
              >
                + Create Task
              </Button>
            </div>
          </div>

          <input
            className="w-full p-2 border rounded mb-4"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
          />

          <div className="flex flex-wrap gap-2 mb-4">
            {statusList.map((status) => (
              <Button
                key={status}
                variant={filterStatus === status ? "default" : "outline"}
                onClick={() => handleStatusFilter(status)}
                disabled={loading}
              >
                {status}
              </Button>
            ))}
          </div>
          {viewMode === "list" && (
            <>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-800 mr-3"></div>
                  <span className="text-gray-600">Loading tasks...</span>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredTasks?.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <p>No tasks found</p>
                      {(searchQuery || filterStatus !== "All") && (
                        <p className="text-sm mt-2">
                          Try adjusting your search or filter criteria
                        </p>
                      )}
                    </div>
                  ) : (
                    filteredTasks.map((task) => (
                      <Card
                        key={task._id}
                        className="p-4 cursor-pointer transition-shadow hover:shadow-lg"
                      >
                        <CardContent className="flex justify-between items-start">
                          <div>
                            <h3 className="text-lg font-semibold">
                              {task.title}
                            </h3>
                            <p className="text-sm text-gray-500">
                              {task.description || "No description"}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              Posted by: {users.get(task.user) || "Loading..."}{" "}
                              • {formatDate(task.createdAt)}
                            </p>
                            <div className="mt-2 flex gap-2">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-sm text-xs font-medium ${getCategoryBadgeStyle(
                                  task.category || "medium"
                                )}`}
                              >
                                {task.category?.charAt(0).toUpperCase() +
                                  task.category?.slice(1) || "high"}
                              </span>

                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-sm text-xs font-medium ${getStatusBadgeStyle(
                                  task.status || "pending"
                                )}`}
                              >
                                {getDisplayStatus(task.status || "pending")}
                              </span>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <div className="flex gap-3 text-blue-700">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setEditTask(task)}
                              >
                                <FaEdit />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openDeleteModal(task._id)}
                              >
                                <FaTrash />
                              </Button>
                            </div>

                            <div className="relative status-dropdown-container">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  setShowStatusDropdown(
                                    showStatusDropdown === task._id
                                      ? null
                                      : task._id
                                  )
                                }
                                disabled={updatingTaskId === task._id}
                                className="flex items-center gap-2 text-xs"
                              >
                                {updatingTaskId === task._id ? (
                                  <div className="animate-spin rounded-full h-3 w-3 border-b border-blue-800"></div>
                                ) : (
                                  <>
                                    {getDisplayStatus(task.status) ||
                                      "Update Status"}
                                    <FaChevronDown
                                      className={`transition-transform ${
                                        showStatusDropdown === task._id
                                          ? "rotate-180"
                                          : ""
                                      }`}
                                    />
                                  </>
                                )}
                              </Button>

                              {showStatusDropdown === task._id && (
                                <div className="absolute right-0 top-full mt-1 w-32 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                                  {updateStatusOptions.map((status) => (
                                    <button
                                      key={status}
                                      onClick={() =>
                                        updateTask(task._id, { status })
                                      }
                                      className={`w-full text-left px-3 py-2 text-xs hover:bg-gray-100 transition-colors
      ${
        getStatusForAPI(status) === task.status ||
        (task.completed && status === "Completed")
          ? "bg-blue-50 text-blue-700 font-medium"
          : "text-gray-700"
      }
      ${status === updateStatusOptions[0] ? "rounded-t-md" : ""}
      ${
        status === updateStatusOptions[updateStatusOptions.length - 1]
          ? "rounded-b-md"
          : ""
      }
    `}
                                      disabled={updatingTaskId === task._id}
                                    >
                                      {status}
                                      {(getStatusForAPI(status) ===
                                        task.status ||
                                        (task.completed &&
                                          status === "Completed")) && (
                                        <span className="ml-1">✓</span>
                                      )}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              )}
            </>
          )}
          {viewMode === "kanban" && (
            <KanbanBoard
              tasks={filteredTasks}
              users={users}
              onUpdateTask={updateTask}
              onEditTask={setEditTask}
              onDeleteTask={openDeleteModal}
            />
          )}

          <div className="flex justify-center mt-4 space-x-2">
            <button
              disabled={currentPage === 1 || loading}
              onClick={() => handlePageChange(currentPage - 1)}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Prev
            </button>

            <span className="self-center text-gray-700">
              Page {currentPage} of {totalPages}
            </span>

            <button
              disabled={currentPage === totalPages || loading}
              onClick={() => handlePageChange(currentPage + 1)}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </section>

        <aside className="bg-white p-6 rounded-lg shadow space-y-6 h-fit">
          <div>
            <h2 className="text-lg font-semibold mb-2">Dashboard</h2>
            <h6 className="pb-5">Your task statistics</h6>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="bg-blue-100 p-4 flex flex-col items-center justify-center rounded">
                Total Tasks
                <br />
                <strong>{allTasks.length}</strong>
              </div>
              <div className="bg-green-100 p-4 flex flex-col items-center justify-center rounded">
                Completed
                <br />
                <strong>
                  {allTasks.filter((t) => t.status === "completed").length}
                </strong>
              </div>
              <div className="bg-yellow-100 p-4 flex flex-col items-center justify-center rounded">
                In Progress
                <br />
                <strong>
                  {allTasks.filter((t) => t.status === "inprogress").length}
                </strong>
              </div>
              <div className="bg-red-100 p-4 flex flex-col items-center justify-center rounded">
                Pending
                <br />
                <strong>
                  {allTasks.filter((t) => t.status === "pending").length}
                </strong>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-2 pb-5 border-b border-gray-300">
              Upcoming Deadlines
            </h2>
            <div className="text-sm flex flex-col gap-0.5 text-gray-700">
              {allTasks
                .filter((t) => t.status !== "completed")
                .sort(
                  (a, b) =>
                    new Date(a.dueDate).getTime() -
                    new Date(b.dueDate).getTime()
                )
                .slice(0, 5)
                .map((task) => (
                  <div
                    key={task._id}
                    className="flex justify-between items-center gap-0.5"
                  >
                    <span className="font-bold">{task.title}</span>
                    <span className="deadline-date">
                      {formatDate(task.dueDate || task.createdAt)}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </aside>
      </main>
      {showDeleteModal && (
        <DeleteTaskModal
          onCancel={() => {
            setShowDeleteModal(false);
            setTaskToDelete(null);
          }}
          onConfirm={confirmDeleteTask}
        />
      )}
      <CreateTaskModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => {
          fetchTasks(currentPage);
        }}
      />
      {editTask && (
        <EditTaskModal
          task={editTask}
          onClose={() => setEditTask(null)}
          onUpdate={(taskId, fields) => updateTask(taskId, fields)}
        />
      )}
    </div>
  );
};

export default Dashboard;

export const getStatusForAPI = (displayStatus: string): string => {
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

export const getDisplayStatus = (apiStatus: string): string => {
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

export const getStatusBadgeStyle = (status: string): string => {
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

export const getCategoryBadgeStyle = (category: string): string => {
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

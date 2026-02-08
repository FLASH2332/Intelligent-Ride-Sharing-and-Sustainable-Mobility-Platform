import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Users, CheckCircle, Car } from "lucide-react";

const OrgAdminDashboard = () => {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPendingUsers = async () => {
      try {
        const res = await fetch(
          "http://localhost:5000/org-admin/pending-users",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            },
          }
        );

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Failed to fetch users");
        }

        setUsers(data.users);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPendingUsers();
  }, []);

  const approveUser = async (userId) => {
    try {
      const res = await fetch(
        "http://localhost:5000/org-admin/approve-user",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
          body: JSON.stringify({ userId }),
        }
      );

      if (!res.ok) {
        throw new Error("Approval failed");
      }

      setUsers((prev) => prev.filter((u) => u._id !== userId));
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) {
    return <p className="p-8">Loading pending users...</p>;
  }

  if (error) {
    return <p className="p-8 text-red-600">{error}</p>;
  }

  return (
    <div className="min-h-screen bg-stone-50 p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Users className="w-8 h-8 text-emerald-600" />
          <h1 className="text-3xl font-bold text-stone-900">
            Organization Admin
          </h1>
        </div>

        {/* 🔑 NEW: Driver Requests CTA */}
        <button
          onClick={() => navigate("/admin/driver-requests")}
          className="flex items-center gap-2 px-4 py-2 bg-stone-800 text-white rounded-lg hover:bg-stone-900 transition"
        >
          <Car className="w-4 h-4" />
          Driver Requests
        </button>
      </div>

      {/* Pending Count */}
      <div className="mb-6 text-sm text-stone-600">
        Pending approvals:{" "}
        <span className="font-semibold text-emerald-700">
          {users.length}
        </span>
      </div>

      {/* Empty State */}
      {users.length === 0 ? (
        <div className="bg-emerald-50 border border-emerald-200 p-6 rounded-xl flex items-center gap-3">
          <CheckCircle className="w-6 h-6 text-emerald-600" />
          <p className="text-emerald-800 font-medium">
            🎉 No pending users at the moment
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-xl shadow border">
          <table className="w-full border-collapse">
            <thead className="bg-stone-100">
              <tr className="border-b">
                <th className="text-left p-4">Email</th>
                <th className="text-left p-4">Phone</th>
                <th className="text-left p-4">Joined</th>
                <th className="text-left p-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id} className="border-b hover:bg-stone-50">
                  <td className="p-4">{u.email}</td>
                  <td className="p-4">{u.phone}</td>
                  <td className="p-4">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => approveUser(u._id)}
                      className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
                    >
                      Approve
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default OrgAdminDashboard;

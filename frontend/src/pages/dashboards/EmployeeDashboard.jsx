import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const EmployeeDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState("");

  // 🔹 Fetch logged-in user
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/users/me", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message);

        setUser(data.user);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  // 🔹 Request driver access
  const requestDriver = async () => {
    setActionLoading(true);
    setMessage("");

    try {
      const res = await fetch(
        "http://localhost:5000/api/users/driver-intent",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setUser((prev) => ({
        ...prev,
        isDriver: true,
        driverStatus: "PENDING",
      }));

      setMessage("Driver request submitted. Upload documents next.");

      setTimeout(() => {
        navigate("/driver/upload");
      }, 1200);
    } catch (err) {
      setMessage(err.message || "Something went wrong");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <p className="p-8">Loading dashboard...</p>;
  }

  // 🛡️ Safety guard
  if (!user) {
    return <p className="p-8 text-red-600">Failed to load user</p>;
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-stone-900 mb-2">
        Welcome to GreenCommute 🌱
      </h1>

      <p className="text-stone-600 mb-8">
        Start sharing rides with colleagues from your organization.
      </p>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Find Rides */}
        <div className="p-6 bg-white border rounded-xl shadow-sm">
          <h3 className="font-semibold text-lg mb-2">Find Rides</h3>
          <p className="text-sm text-stone-600">
            Match with colleagues along your route.
          </p>
        </div>

        {/* Offer Ride */}
        <div className="p-6 bg-white border rounded-xl shadow-sm">
          <h3 className="font-semibold text-lg mb-2">Offer a Ride</h3>
          <p className="text-sm text-stone-600">
            Share your commute and save emissions.
          </p>
        </div>

        {/* 🚗 Driver Card */}
        <div className="p-6 bg-white border rounded-xl shadow-sm">
          <h3 className="font-semibold text-lg mb-2">Become a Driver</h3>

          {/* NOT A DRIVER */}
          {!user.isDriver && (
            <>
              <p className="text-sm text-stone-600 mb-4">
                Offer rides to colleagues and reduce emissions.
              </p>
              <button
                onClick={requestDriver}
                disabled={actionLoading}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg"
              >
                {actionLoading ? "Submitting..." : "Request Driver Access"}
              </button>
            </>
          )}

          {/* DRIVER BUT NO DOCS */}
          {user.isDriver && !user.documentsUploaded && (
            <>
              <p className="text-sm text-stone-600 mb-4">
                Upload license & RC to continue
              </p>
              <button
                onClick={() => navigate("/driver/upload")}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg"
              >
                Upload Driver Documents
              </button>
            </>
          )}

          {/* DOCS UPLOADED, PENDING */}
          {user.driverStatus === "PENDING" && user.documentsUploaded && (
            <p className="text-emerald-700 font-medium mt-3">
              Driver request submitted. Awaiting approval.
            </p>
          )}

          {/* APPROVED */}
          {user.driverStatus === "APPROVED" && (
            <p className="text-emerald-700 font-semibold mt-3">
              ✅ You are an approved driver
            </p>
          )}

          {/* REJECTED */}
          {user.driverStatus === "REJECTED" && (
            <p className="text-red-600 mt-3">
              ❌ Rejected: {user.driverRejectionReason || "No reason provided"}
            </p>
          )}

          {message && (
            <p className="mt-3 text-sm text-emerald-700">{message}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;

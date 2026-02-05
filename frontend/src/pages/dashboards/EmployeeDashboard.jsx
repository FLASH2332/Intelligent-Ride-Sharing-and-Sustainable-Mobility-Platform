const EmployeeDashboard = () => {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-stone-900 mb-2">
        Welcome to GreenCommute 🌱
      </h1>

      <p className="text-stone-600 mb-8">
        Start sharing rides with colleagues from your organization.
      </p>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="p-6 bg-white border rounded-xl shadow-sm">
          <h3 className="font-semibold text-lg mb-2">Find Rides</h3>
          <p className="text-sm text-stone-600">
            Match with colleagues along your route.
          </p>
        </div>

        <div className="p-6 bg-white border rounded-xl shadow-sm">
          <h3 className="font-semibold text-lg mb-2">Offer a Ride</h3>
          <p className="text-sm text-stone-600">
            Share your commute and save emissions.
          </p>
        </div>

        <div className="p-6 bg-white border rounded-xl shadow-sm">
          <h3 className="font-semibold text-lg mb-2">Impact</h3>
          <p className="text-sm text-stone-600">
            Track CO₂ saved and rides shared.
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;

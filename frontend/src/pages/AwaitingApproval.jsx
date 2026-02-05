import { Shield } from "lucide-react";

const AwaitingApproval = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50 px-6">
      <div className="bg-white p-8 rounded-xl shadow max-w-md text-center">
        <Shield className="w-12 h-12 text-emerald-600 mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">
          Awaiting Admin Approval
        </h1>
        <p className="text-stone-600">
          Your account has been created successfully.
          <br />
          Please wait for your organization administrator to approve your access.
        </p>
        <p className="text-sm text-stone-500 mt-4">
          You will be able to log in once approved.
        </p>
      </div>
    </div>
  );
};

export default AwaitingApproval;

import {
  Button,
  Divider,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Tooltip
} from "@nextui-org/react";
import { Monitor, Smartphone, Laptop, Terminal, X, Info } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  getConnectedDevices,
  logoutAllDevices,
  deleteProfileOtp,
  deleteProfile
} from "@/services/dispatch/user-dispatch";
import { deleteSession } from "@/services/session";
import { useAuth } from "@/hooks/use-auth";
import toast from "react-hot-toast";
import { formatDate } from "@/utils";

interface Device {
  device_id: string;
  device_name: string;
  ip_address: string;
  last_active: Date;
  created_at: Date;
}

const getDeviceInfo = (deviceName: string) => {
  const userAgent = deviceName.toLowerCase();

  if (userAgent.includes("postman")) {
    return {
      type: "API Client",
      icon: Terminal,
      name: "Postman",
      os: "Cross-platform",
      browser: "Postman Runtime",
      version: userAgent.split("/")[1]
    };
  }

  if (userAgent.includes("mozilla")) {
    const info = {
      type: "Browser",
      icon: Laptop,
      name: "Web Browser",
      os: userAgent.includes("windows")
        ? "Windows"
        : userAgent.includes("mac")
        ? "macOS"
        : userAgent.includes("linux")
        ? "Linux"
        : "Unknown",
      browser: userAgent.includes("chrome")
        ? "Chrome"
        : userAgent.includes("firefox")
        ? "Firefox"
        : userAgent.includes("safari")
        ? "Safari"
        : "Unknown",
      version:
        userAgent.match(/chrome\/([0-9.]+)/i)?.[1] ||
        userAgent.match(/firefox\/([0-9.]+)/i)?.[1] ||
        userAgent.match(/safari\/([0-9.]+)/i)?.[1] ||
        "Unknown"
    };
    return info;
  }

  return {
    type: "Unknown Device",
    icon: Monitor,
    name: deviceName,
    os: "Unknown",
    browser: "Unknown",
    version: "Unknown"
  };
};

const SecuritySetting = () => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const { setIsLoggedIn, setUser, user } = useAuth();
  const [infoToolTip, setInfoTooltip] = useState(0);
  const [popoverVisible, setPopoverVisible] = useState(false); // Control popover visibility
  const navigate = useNavigate();

  useEffect(() => {
    getConnectedDevices()
      .then((res) => setDevices(res.connected_devices))
      .catch((error) => {
        toast.error("Error fetching connected devices.");
        console.error(error);
      });
  }, []);

  const handleLogoutAll = () => {
    setLoading(true);
    logoutAllDevices()
      .then(() => {
        toast.success("All devices have been logged out, including your current session.");
        deleteSession();
        setUser(null);
        setIsLoggedIn(false);
        navigate("/");
      })
      .catch((error) => {
        toast.error("Error logging out from all devices.");
        console.error(error);
      })
      .finally(() => setLoading(false));
  };

  const handleDeleteAccountOtpSend = () => {
    if (user?.email) {
      setLoading(true);
      deleteProfileOtp({ email: user.email })
        .then(() => {
          toast.success("OTP sent to your email for account deletion.");
          setOtpSent(true);
          setPopoverVisible(false); // Auto-hide popover
        })
        .catch((error) => {
          toast.error("Failed to send OTP. Please try again.");
          console.error(error);
        })
        .finally(() => setLoading(false));
    }
  };

  const handleDeleteAccount = () => {
    if (!otp) {
      toast.error("Please enter the OTP to confirm account deletion.");
      return;
    }

    if (user?.email) {
      setLoading(true);
      deleteProfile({ email: user.email, otp: parseInt(otp) })
        .then(() => {
          toast.success("Your account has been successfully deleted.");
          deleteSession();
          setUser(null);
          setIsLoggedIn(false);
          navigate("/");
        })
        .catch((error) => {
          toast.error("Error deleting account. Please try again.");
          console.error(error);
        })
        .finally(() => setLoading(false));
    }
  };

  const cancelOtpFlow = () => {
    setOtp("");
    setOtpSent(false);
  };

  return (
    <>
      {/* Account Deletion Section */}
      <div className="max-xs:block text-lg flex justify-between items-center w-full p-2">
        <div className="px-2 font-semibold">Delete Account</div>
        <div>
          <Popover
            placement="top-end"
            showArrow
            color="danger"
            isOpen={popoverVisible} // Control visibility via state
            onOpenChange={(isOpen) => setPopoverVisible(isOpen)}
          >
            <PopoverTrigger>
              <Button
                className="w-full"
                color="danger"
                disabled={loading}
                onClick={() => setPopoverVisible(true)}
              >
                Delete Current Account
              </Button>
            </PopoverTrigger>
            <PopoverContent>
              <div className="px-1 py-2">
                <div className="font-bold">Are you sure?</div>
                <p className="text-small py-2">
                  Your account will be permanently deleted. This action cannot be undone.
                </p>
                <div className="flex gap-2 justify-end">
                  <Button
                    className="border-2"
                    onClick={handleDeleteAccountOtpSend}
                    size="sm"
                    color="danger"
                    disabled={loading}
                  >
                    {loading ? "Sending OTP..." : "Confirm"}
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
      <Divider />

      {/* OTP Input Section */}
      {otpSent && (
        <div className="max-xs:block text-lg flex flex-col gap-4 p-2">
          <div className="font-semibold px-2">Enter OTP</div>
          <input
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            type="number"
            className="w-full border-2 px-2 py-1 rounded-md"
            placeholder="Enter OTP"
          />
          <div className="flex gap-2 justify-end">
            <Button
              className="border-2"
              onClick={handleDeleteAccount}
              size="sm"
              color="danger"
              disabled={loading}
            >
              {loading ? "Deleting..." : "Submit"}
            </Button>
            <Button
              className="border-2"
              onClick={cancelOtpFlow}
              size="sm"
              color="default"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
      <Divider />

      {/* Logout Section */}
      <div className="max-xs:block text-lg flex justify-between items-center w-full p-2">
        <div className="px-2 font-semibold">Log out of all devices</div>
        <div>
          <Popover placement="top-end" showArrow>
            <PopoverTrigger>
              <Button className="w-full" disabled={loading}>
                Log Out All
              </Button>
            </PopoverTrigger>
            <PopoverContent>
              <div className="px-1 py-2">
                <div className="font-bold">Are you sure?</div>
                <p className="text-small py-2">
                  You will be logged out from all devices, including this session.
                </p>
                <div className="flex gap-2 justify-end">
                  <Button
                    onClick={handleLogoutAll}
                    size="sm"
                    color="danger"
                    disabled={loading}
                  >
                    {loading ? "Logging Out..." : "Confirm"}
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
      <Divider />

      {/* Connected Devices Section */}
      <div className="block text-lg justify-between items-center w-full p-2">
        <div className="p-2 font-semibold">Connected Devices</div>
        <div className="max-h-80 overflow-auto">
          {devices.length > 0 ? (
            devices.map((v, id) => {
              const deviceInfo = getDeviceInfo(v.device_name);
              const DeviceIcon = deviceInfo.icon;
              return (
                <div
                  key={id}
                  className="px-8 py-4 border-2 w-full text-center dark:border-gray-200 border-gray-800 rounded-md mt-2 flex justify-between"
                >
                  <div className="mr-4">
                    <DeviceIcon className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{deviceInfo.name}</h3>
                    <Tooltip
                      isOpen={infoToolTip === id + 1}
                      content={
                        <div className="space-y-2">
                          <p>
                            <span className="font-semibold">Type:</span> {deviceInfo.type}
                          </p>
                          <p>
                            <span className="font-semibold">OS:</span> {deviceInfo.os}
                          </p>
                          <p>
                            <span className="font-semibold">Browser:</span>{" "}
                            {deviceInfo.browser}
                          </p>
                          <p>
                            <span className="font-semibold">Version:</span>{" "}
                            {deviceInfo.version}
                          </p>
                          <p>
                            <span className="font-semibold">Last Active:</span>{" "}
                            {formatDate(v.last_active)}
                          </p>
                          <p>
                            <span className="font-semibold">First Seen:</span>{" "}
                            {formatDate(v.created_at)}
                          </p>
                        </div>
                      }
                    >
                      <Button
                        onMouseLeave={() => setInfoTooltip(0)}
                        onMouseEnter={() => setInfoTooltip(id + 1)}
                        variant="ghost"
                        isIconOnly
                        className="h-6 w-6"
                      >
                        <Info className="h-4 w-4" />
                      </Button>
                    </Tooltip>
                  </div>
                  <div className="text-right mr-4">
                    <p className="font-mono">{v.ip_address}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(v.last_active).toLocaleDateString()}
                    </p>
                  </div>
                  <Button variant="ghost" isIconOnly className="ml-2">
                    <X className="h-4 w-4" />
                    <span className="sr-only">Remove device</span>
                  </Button>
                </div>
              );
            })
          ) : (
            <div className="p-4 border-dashed border-2 w-full text-center dark:border-gray-200 border-gray-800">
              No connected devices.
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default SecuritySetting;

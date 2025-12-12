import React from "react";
import useAuthUser from "../hooks/useAuthUser";
import { Link, useLocation } from "react-router";
import {
  BellIcon,
  HomeIcon,
  ShipWheelIcon,
  UserPen,
  UsersIcon,
} from "lucide-react";

const Sidebar = () => {
  const { authUser } = useAuthUser();
  const location = useLocation();
  const currentPath = location.pathname;

  // console.log(currentPath)

  return (
    <aside className="w-72 bg-base-200 border-r border-base-300 hidden lg:flex flex-col h-screen sticky top-0">
      <div className="px-5 py-[13.4px] border-b border-base-300">
        <Link to="/" className="flex items-center gap-2.5">
          <ShipWheelIcon className="size-9 text-primary" />
          <span className="text-3xl font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary tracking-wider">
            StealthChat
          </span>
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        <Link
          to="/"
          className={`btn btn-ghost justify-start w-full gap-3 px-3 normal-case hover:bg-base-content/5 ${
            currentPath === "/" ? "btn-active bg-base-content/5 " : ""
          }`}
        >
          <HomeIcon className="size-5 text-base-content opacity-70" />
          <span>Home</span>
        </Link>

        <Link
          to="/friends"
          className={`btn btn-ghost justify-start w-full gap-3 px-3 normal-case hover:bg-base-content/5 ${
            currentPath === "/friends" ? "btn-active bg-base-content/5" : ""
          }`}
        >
          <UsersIcon className="size-5 text-base-content opacity-70" />
          <span>Friends</span>
        </Link>

        <Link
          to="/notifications"
          className={`btn btn-ghost justify-start w-full gap-3 px-3 normal-case hover:bg-base-content/5 ${
            currentPath === "/notifications"
              ? "btn-active bg-base-content/5"
              : ""
          }`}
        >
          <BellIcon className="size-5 text-base-content opacity-70" />
          <span>Notifications</span>
        </Link>
      </nav>

      {/* USER PROFILE SECTION */}
      <Link to="/profile" className="p-4 border-t border-base-300 mt-auto">
        <div className="flex items-center gap-3">
          <div className="avatar">
            <div className="w-10 rounded-full">
              <img src={authUser?.profilePicture} alt="User Avatar" />
            </div>
          </div>
          <div className="flex-1">
            <p className="font-semibold text-sm">{authUser?.fullName}</p>

            {renderStatusBadge(authUser?.isOnline)}
          </div>
        </div>
      </Link>
    </aside>
  );
};

export default Sidebar;

function renderStatusBadge(status) {
  const baseClasses =
    "text-xs flex items-center gap-2 py-0.5 rounded-full";
  if (status === "online") {
    return (
      <p className={`${baseClasses} text-success `}>
        <span className="w-2 h-2 rounded-full bg-success inline-block" />
        Online
      </p>
    );
  } else if (status === "busy") {
    return (
      <p className={`${baseClasses} text-warning `}>
        <span className="w-2 h-2 rounded-full bg-warning inline-block" />
        Busy
      </p>
    );
  } else {
    return (
      <p className={`${baseClasses} text-error `}>
        <span className="w-2 h-2 rounded-full bg-error inline-block" />
        Offline
      </p>
    );
  }
}

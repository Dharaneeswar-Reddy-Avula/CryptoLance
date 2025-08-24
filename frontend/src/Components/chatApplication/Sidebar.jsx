"use client";

import { useEffect, useState } from "react";
import { Users, Search } from "lucide-react";
import SidebarSkeleton from "./skeletons/MessageSkeleton";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import {
  getUsers,
  setSelectedUser,
} from "../../store/ChatApplicationSlice/ChatAppSlice";
import { FaArrowLeftLong } from "react-icons/fa6";
import { useAccount } from "wagmi";
import { Link } from "react-router-dom";
const Sidebar = () => {
  const { users, selectedUser, isUsersLoading } = useSelector(
    (state) => state.chatApp
  );
const {address} = useAccount();

  const { onlineUsers } = useSelector((state) => state.auth);
  console.log("Sidebar - onlineUsers from Redux:", onlineUsers);
  console.log("Sidebar - users from chatAppSlice:", users);
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getUsers());
  }, [dispatch]);

  const filteredUsers = users.filter((user) => {
    if (String(user._id).toLowerCase() === String(address).toLowerCase()) {
      return false;
    }
    const matchesName = user.fullname
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesWallet = user._id
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesSearch = matchesName || matchesWallet;

    if (!matchesSearch) return false;

    if (showOnlineOnly) {
      const userId = String(user._id || "").toLowerCase();
      return (
        Array.isArray(onlineUsers) &&
        onlineUsers.some(
          (onlineId) => String(onlineId).toLowerCase() === userId
        )
      );
    }
    return true;
  });

  // Check if a user is online
  const isUserOnline = (user) => {
    const userId = String(user._id || "").toLowerCase();
    return (
      Array.isArray(onlineUsers) &&
      onlineUsers.some((onlineId) => String(onlineId).toLowerCase() === userId)
    );
  };

  if (isUsersLoading) return <SidebarSkeleton />;

  return (
    <aside className="h-full w-full lg:w-80 bg-slate-900/90 backdrop-blur-sm border-r border-cyan-500/20 flex flex-col">
      <div className="border-b border-cyan-500/20 w-full p-4 bg-slate-800/50">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-cyan-500/20 rounded-lg">
            <Users className="size-5 text-cyan-400" />
          </div>
          <span className="font-medium text-lg hidden lg:block text-white">
            Contacts
          </span>
          <div className="ml-auto flex items-center gap-1">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
            <span className="text-xs text-slate-400">
              {onlineUsers?.length || 0}
            </span>
          </div>
        </div>

        <div className="relative mb-3 hidden lg:block">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 size-4" />
          <input
            type="text"
            placeholder="Search by name or wallet..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:border-cyan-500/50 focus:outline-none transition-colors text-sm"
          />
        </div>

        <div className="hidden lg:flex items-center justify-between">
          <div>
            <Link to="/" className="text-sm text-slate-400 flex items-center gap-2"><FaArrowLeftLong />
                 Back to Home</Link>
          </div>
          <label className="cursor-pointer flex items-center gap-2 group">
            <div className="relative">
              <input
                type="checkbox"
                checked={showOnlineOnly}
                onChange={(e) => setShowOnlineOnly(e.target.checked)}
                className="sr-only"
              />
              <div
                className={`w-10 h-5 rounded-full transition-all duration-200 ${
                  showOnlineOnly ? "bg-cyan-500" : "bg-slate-600"
                }`}
              >
                <div
                  className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform duration-200 mt-0.5 ${
                    showOnlineOnly ? "translate-x-5" : "translate-x-0.5"
                  }`}
                ></div>
              </div>
            </div>
            <span className="text-sm text-slate-300 group-hover:text-cyan-400 transition-colors">
              Online only
            </span>
          </label>
        </div>
      </div>

      <div className="overflow-y-auto w-full py-1 scrollbar-thin scrollbar-thumb-cyan-500/20 scrollbar-track-transparent">
        {filteredUsers.map((user) => {
          const isOnline = isUserOnline(user);
          return (
            <button
              key={user._id}
              onClick={() => dispatch(setSelectedUser(user))}
              className={`
                w-full p-3 mx-2 mb-1 flex items-center gap-3 rounded-lg transition-all duration-200 group
                hover:bg-slate-700/50
                ${
                  selectedUser?._id === user._id
                    ? "bg-slate-600/40 border-l-4 border-slate-400"
                    : ""
                }
              `}
            >
              <div className="relative flex-shrink-0">
                {user.profile ? (
                  <img
                    src={user.profile}
                    alt={user.fullname}
                    className="size-11 object-cover rounded-full border-2 border-slate-600 group-hover:border-cyan-500/50 transition-colors"
                  />
                ) : (
                  <div className="size-11 flex items-center justify-center rounded-full border-2 border-slate-600 group-hover:border-cyan-500/50 bg-slate-700 text-white font-semibold text-lg">
                    {user.fullname?.charAt(0).toUpperCase()}
                  </div>
                )}

                {isOnline && (
                  <div className="absolute -bottom-0.5 -right-0.5 size-3 bg-emerald-400 rounded-full border-2 border-slate-900"></div>
                )}
              </div>

              <div className="hidden lg:block text-left min-w-0 flex-1">
                <div className="font-medium truncate text-white text-sm">
                  {user.fullname}
                </div>
                <div className="text-xs text-slate-400 truncate">
                  {user._id}
                </div>
                <div
                  className={`text-xs ${
                    isOnline ? "text-emerald-400" : "text-slate-500"
                  }`}
                >
                  {isOnline ? "Online" : "Offline"}
                </div>
              </div>
            </button>
          );
        })}

        {filteredUsers.length === 0 && (
          <div className="text-center py-8 text-slate-400">
            <Users className="size-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No contacts found</p>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;

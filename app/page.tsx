"use client"

import { Whiteboard } from "@/components/whiteboard"

export default function Home() {
  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#FFFBEB]">
      <header className="h-14 flex-shrink-0 bg-gradient-to-r from-yellow-50 to-amber-50 border-b-2 border-yellow-300 flex items-center px-6 z-30">
        <div className="flex items-center justify-between w-full">
          {/* Left Section */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center shadow-lg">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-semibold text-gray-900">Untitled</h1>
                <span className="px-2 py-0.5 text-xs font-medium bg-yellow-200 text-yellow-800 rounded">
                  Free
                </span>
              </div>
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-3">
            <button className="p-2 text-gray-600 hover:bg-yellow-100 rounded-lg transition-all">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </button>
            <button className="p-2 text-gray-600 hover:bg-yellow-100 rounded-lg transition-all">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button className="p-2 text-gray-600 hover:bg-yellow-100 rounded-lg transition-all">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
            <div className="w-px h-6 bg-yellow-300" />
            <button className="px-4 py-2 text-sm font-medium bg-yellow-400 hover:bg-yellow-500 text-white rounded-lg transition-all shadow-sm">
              Share
            </button>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center text-white text-sm font-bold shadow-md cursor-pointer hover:scale-105 transition-transform">
              M
            </div>
          </div>
        </div>
      </header>
      <div className="flex-1 min-h-0">
        <Whiteboard />
      </div>
    </div>
  )
}

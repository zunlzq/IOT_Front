export default function Sidebar({ activeTab, setActiveTab }) {
  return (
    <aside className="w-64 bg-slate-100 border-r border-slate-200 flex flex-col justify-between min-h-screen relative z-20">
      <div>
        <div className="p-6 border-b border-slate-200">
          <h1 className="text-2xl font-black text-slate-800 leading-none">
            4Guard
          </h1>
          <h2 className="text-xl font-bold text-slate-600 leading-none mt-1">
            Pro
          </h2>
          <p className="text-[10px] text-slate-400 font-mono mt-2 tracking-widest uppercase">Industrial Control</p>
        </div>

        <nav className="p-4 space-y-1">
          <button 
            onClick={() => setActiveTab("monitoring")}
            className={`w-full flex items-center px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-200 ${
              activeTab === "monitoring"
                ? "bg-slate-900 text-white shadow-md"
                : "text-slate-600 hover:bg-slate-200 hover:text-slate-900"
            }`}
          >
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            실시간 모니터링
          </button>

          <button 
            onClick={() => setActiveTab("map")}
            className={`w-full flex items-center px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-200 ${
              activeTab === "map"
                ? "bg-slate-900 text-white shadow-md"
                : "text-slate-600 hover:bg-slate-200 hover:text-slate-900"
            }`}
          >
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            실시간 지도
          </button>

          <button 
            onClick={() => setActiveTab("management")}
            className={`w-full flex items-center px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-200 ${
              activeTab === "management"
                ? "bg-slate-900 text-white shadow-md"
                : "text-slate-600 hover:bg-slate-200 hover:text-slate-900"
            }`}
          >
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            작업자 관리
          </button>

          <button 
            onClick={() => setActiveTab("simulator")}
            className={`w-full flex items-center px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-200 ${
              activeTab === "simulator"
                ? "bg-slate-900 text-white shadow-md"
                : "text-slate-600 hover:bg-slate-200 hover:text-slate-900"
            }`}
          >
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
            센서 시뮬레이터
          </button>
        </nav>
      </div>
    </aside>
  );
}

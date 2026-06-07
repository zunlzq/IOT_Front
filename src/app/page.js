"use client";

import React, { useState, useEffect } from "react";
import dynamic from 'next/dynamic';
import Sidebar from "@/components/Sidebar";
import WorkerCard from "@/components/WorkerCard";

const MapComponent = dynamic(() => import('@/components/MapComponent'), { ssr: false });

const getInitials = (name) => {
  if (!name) return "";
  return name.trim().charAt(0).toUpperCase();
};

const getAvatarBg = (id) => {
  const colors = [
    'bg-slate-500 text-white',
    'bg-emerald-600 text-white',
    'bg-indigo-600 text-white',
    'bg-blue-600 text-white',
    'bg-sky-600 text-white',
    'bg-violet-600 text-white',
    'bg-rose-500 text-white',
    'bg-amber-600 text-white',
  ];
  if (!id) return colors[0];
  let sum = 0;
  for (let i = 0; i < id.length; i++) {
    sum += id.charCodeAt(i);
  }
  return colors[sum % colors.length];
};

export default function Home() {
  const [workers, setWorkers] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState("monitoring");

  const [newWorkerId, setNewWorkerId] = useState("");
  const [newWorkerName, setNewWorkerName] = useState("");
  const [editingWorkerId, setEditingWorkerId] = useState(null);
  const [editName, setEditName] = useState("");

  const [selectedWorkerId, setSelectedWorkerId] = useState("");
  const [pressure, setPressure] = useState(600);
  const [temperature, setTemperature] = useState(32.5);
  const [sos, setSos] = useState(false);
  const [lat, setLat] = useState(37.5665);
  const [lng, setLng] = useState(126.9780);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("safetyguard_workers");
    if (saved) {
      try {
        setWorkers(JSON.parse(saved));
      } catch (e) {
        setWorkers([]);
      }
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("safetyguard_workers", JSON.stringify(workers));
    }
    if (!selectedWorkerId && workers.length > 0) {
      setSelectedWorkerId(workers[0].id);
    }
  }, [workers, selectedWorkerId, isLoaded]);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch("http://localhost:8000/api/status");
        if (response.ok) {
          const data = await response.json();
          if (data.worker_id) {
            setWorkers((prev) =>
              prev.map((w) =>
                w.id === data.worker_id
                  ? {
                    ...w,
                    pressure: data.pressure,
                    temperature: data.temperature,
                    sos: data.sos,
                    gps_lat: data.gps_lat,
                    gps_lng: data.gps_lng,
                    helmet_status_code: data.helmet_status_code,
                    overall_status_code: data.overall_status_code,
                  }
                  : w
              )
            );
          }
        }
      } catch (error) {
      }
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const activeWorkers = workers.length;
  const criticalAlerts = workers.filter(w => w.overall_status_code === 'emergency').length;
  const warnings = workers.filter(w => w.overall_status_code === 'not_wearing' || w.overall_status_code === 'high_temperature').length;

  const handleAddWorker = (e) => {
    e.preventDefault();
    if (!newWorkerId || !newWorkerName) return;

    if (workers.some(w => w.id === newWorkerId)) {
      alert("이미 존재하는 ID입니다.");
      return;
    }

    const newWorker = {
      id: newWorkerId,
      name: newWorkerName,
      pressure: null,
      temperature: null,
      gps_lat: null,
      gps_lng: null,
      sos: false,
      helmet_status_code: "waiting",
      overall_status_code: "waiting"
    };

    setWorkers([...workers, newWorker]);
    setNewWorkerId("");
    setNewWorkerName("");
  };

  const handleDeleteWorker = (id) => {
    if (confirm("정말로 이 작업자를 삭제하시겠습니까?")) {
      setWorkers(workers.filter(w => w.id !== id));
      if (selectedWorkerId === id) setSelectedWorkerId("");
    }
  };

  const startEditing = (worker) => {
    setEditingWorkerId(worker.id);
    setEditName(worker.name);
  };

  const saveEditing = (id) => {
    setWorkers(workers.map(w => w.id === id ? { ...w, name: editName } : w));
    setEditingWorkerId(null);
  };

  const handleSimulateSubmit = async (e) => {
    e.preventDefault();
    if (!selectedWorkerId) return;

    setLoading(true);
    setStatusMsg("");
    try {
      const response = await fetch("http://localhost:8000/api/sensor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          worker_id: selectedWorkerId,
          pressure: parseInt(pressure),
          temperature: parseFloat(temperature),
          gps_lat: parseFloat(lat),
          gps_lng: parseFloat(lng),
          sos: sos
        })
      });
      if (response.ok) {
        const result = await response.json();
        const updatedData = result.data;
        setWorkers((prev) =>
          prev.map((w) =>
            w.id === updatedData.worker_id
              ? {
                ...w,
                pressure: updatedData.pressure,
                temperature: updatedData.temperature,
                sos: updatedData.sos,
                gps_lat: updatedData.gps_lat,
                gps_lng: updatedData.gps_lng,
                helmet_status_code: updatedData.helmet_status_code,
                overall_status_code: updatedData.overall_status_code,
              }
              : w
          )
        );
        setStatusMsg("✅ 데이터 전송 성공!");
      } else {
        setStatusMsg("❌ 전송 실패: 올바른 값을 입력했는지 확인하세요.");
      }
    } catch (error) {
      setStatusMsg("⚠️ 백엔드 서버가 켜져 있는지 확인하세요.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-1 flex flex-col bg-slate-50 relative">
        <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none"></div>

        <header className="h-16 border-b border-slate-200 bg-white/90 backdrop-blur-md flex items-center justify-between px-8 relative z-10 shadow-sm">
          <div className="flex-1">
            <h1 className="text-lg font-extrabold text-slate-800 tracking-tight">스마트 헬멧 통합 관제 대시보드</h1>
          </div>
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></span>
              <span className="text-xs font-bold text-emerald-700 tracking-widest">SYSTEM ACTIVE</span>
            </div>
          </div>
        </header>

        <div className="p-8 flex-1 relative z-10 max-w-7xl mx-auto w-full">

          {activeTab === "monitoring" ? (
            <>
              <div className="mb-8">
                <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight mb-4">종합 현황</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex items-center space-x-4">
                    <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-500">등록된 작업자</p>
                      <p className="text-2xl font-bold text-slate-800">{activeWorkers}명</p>
                    </div>
                  </div>
                  <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex items-center space-x-4">
                    <div className="p-3 bg-red-50 rounded-lg text-red-600">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-500">위험 (SOS)</p>
                      <p className="text-2xl font-bold text-slate-800">{criticalAlerts}건</p>
                    </div>
                  </div>
                  <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex items-center space-x-4">
                    <div className="p-3 bg-amber-50 rounded-lg text-amber-600">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-500">주의 (헬멧/온도)</p>
                      <p className="text-2xl font-bold text-slate-800">{warnings}건</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center mb-6">
                <div className="w-1.5 h-6 bg-slate-800 rounded-sm mr-3"></div>
                <h3 className="text-xl font-bold text-slate-800">실시간 관제 그리드</h3>
              </div>

              {workers.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col items-center">
                  <svg className="w-16 h-16 text-slate-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                  <p className="text-slate-500 font-medium text-lg">등록된 작업자가 없습니다.</p>
                  <p className="text-slate-400 mt-1 mb-6">좌측의 '작업자 관리' 메뉴에서 작업자를 먼저 추가해주세요.</p>
                  <button onClick={() => setActiveTab("management")} className="bg-emerald-600 text-white px-6 py-2 rounded-lg font-bold shadow-sm hover:bg-emerald-700 transition">
                    작업자 관리로 이동
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {workers.map((worker) => (
                    <WorkerCard key={worker.id} worker={worker} />
                  ))}
                </div>
              )}
            </>
          ) : activeTab === "management" ? (
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center mb-6">
                <div className="w-1.5 h-6 bg-slate-800 rounded-sm mr-3"></div>
                <h3 className="text-2xl font-extrabold text-slate-800">작업자 관리</h3>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-8 relative z-10">
                <h4 className="font-bold text-slate-700 mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                  신규 작업자 등록
                </h4>
                <form onSubmit={handleAddWorker} className="flex items-end space-x-4">
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-slate-500 mb-1">작업자 ID (고유 식별자)</label>
                    <input
                      type="text"
                      value={newWorkerId}
                      onChange={(e) => setNewWorkerId(e.target.value)}
                      placeholder="예: W01"
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-300 text-sm"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-slate-500 mb-1">작업자 이름</label>
                    <input
                      type="text"
                      value={newWorkerName}
                      onChange={(e) => setNewWorkerName(e.target.value)}
                      placeholder="예: 김민수"
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-300 text-sm"
                    />
                  </div>
                  <button
                    type="submit"
                    className="bg-emerald-600 text-white px-6 py-2 rounded-lg text-sm font-bold shadow hover:bg-emerald-700 transition-colors h-[38px]"
                  >
                    등록하기
                  </button>
                </form>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden relative z-10">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="p-4 text-xs font-bold text-slate-500 uppercase">프로필</th>
                      <th className="p-4 text-xs font-bold text-slate-500 uppercase">ID</th>
                      <th className="p-4 text-xs font-bold text-slate-500 uppercase">이름</th>
                      <th className="p-4 text-xs font-bold text-slate-500 uppercase">현재 위치 (Lat, Lng)</th>
                      <th className="p-4 text-xs font-bold text-slate-500 uppercase text-right">관리</th>
                    </tr>
                  </thead>
                  <tbody>
                    {workers.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="p-8 text-center text-slate-400">등록된 작업자가 없습니다.</td>
                      </tr>
                    ) : (
                      workers.map(w => (
                        <tr key={w.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                          <td className="p-4">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs border border-slate-200 shadow-inner select-none ${getAvatarBg(w.id)}`}>
                              {getInitials(w.name)}
                            </div>
                          </td>
                          <td className="p-4 font-mono text-sm font-medium text-slate-700">{w.id}</td>
                          <td className="p-4">
                            {editingWorkerId === w.id ? (
                              <input
                                type="text"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                className="px-2 py-1 border border-slate-300 rounded focus:outline-none text-sm w-32"
                              />
                            ) : (
                              <span className="font-semibold text-slate-800">{w.name}</span>
                            )}
                          </td>
                          <td className="p-4 font-mono text-xs text-slate-500">
                            {w.gps_lat ? `${w.gps_lat.toFixed(4)}, ${w.gps_lng.toFixed(4)}` : "없음"}
                          </td>
                          <td className="p-4 text-right space-x-2">
                            {editingWorkerId === w.id ? (
                              <button onClick={() => saveEditing(w.id)} className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-xs font-bold hover:bg-blue-200">저장</button>
                            ) : (
                              <button onClick={() => startEditing(w)} className="px-3 py-1 bg-slate-100 text-slate-600 rounded text-xs font-bold hover:bg-slate-200">수정</button>
                            )}
                            <button onClick={() => handleDeleteWorker(w.id)} className="px-3 py-1 bg-red-50 text-red-600 rounded text-xs font-bold hover:bg-red-100">삭제</button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : activeTab === "simulator" ? (
            <div className="max-w-2xl mx-auto bg-white rounded-2xl border border-slate-200 shadow-md p-8 relative z-10">
              <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight mb-2">무선 센서 시뮬레이터</h2>
              <p className="text-sm text-slate-500 mb-6">
                가상의 센서 데이터를 서버로 송신하여 대시보드의 실시간 상태 및 지도 위치를 테스트합니다.
              </p>

              {workers.length === 0 ? (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-sm font-bold text-center">
                  작업자를 먼저 추가해주세요! (작업자 관리 탭)
                </div>
              ) : (
                <form onSubmit={handleSimulateSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">작업자 선택</label>
                    <select
                      value={selectedWorkerId}
                      onChange={(e) => {
                        setSelectedWorkerId(e.target.value);
                        const w = workers.find(x => x.id === e.target.value);
                        if (w) {
                          setPressure(w.pressure || 600);
                          setTemperature(w.temperature || 32.5);
                          setSos(w.sos || false);
                          setLat(w.gps_lat || 37.5665);
                          setLng(w.gps_lng || 126.9780);
                        }
                      }}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-300 font-semibold"
                    >
                      <option value="" disabled>작업자를 선택하세요</option>
                      {workers.map((w) => (
                        <option key={w.id} value={w.id}>{w.name} (ID: {w.id})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-sm font-bold text-slate-700">압력값 (FSR Pressure)</label>
                      <span className="text-sm font-bold text-slate-600 font-mono">{pressure} PSI</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1000"
                      value={pressure}
                      onChange={(e) => setPressure(e.target.value)}
                      className="w-full accent-slate-800"
                    />
                    <p className="text-[11px] text-slate-400 mt-1">
                      * 500 미만으로 낮추면 안전모를 벗은 것으로 판단하여 경고 상태(`미착용`)로 전환됩니다.
                    </p>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-sm font-bold text-slate-700">체온 (Temperature)</label>
                      <span className="text-sm font-bold text-slate-600 font-mono">{parseFloat(temperature).toFixed(1)}°C</span>
                    </div>
                    <input
                      type="range"
                      min="30"
                      max="42"
                      step="0.1"
                      value={temperature}
                      onChange={(e) => setTemperature(e.target.value)}
                      className="w-full accent-slate-800"
                    />
                    <p className="text-[11px] text-slate-400 mt-1">
                      * 37.0°C 이상일 경우 고온 경고 상태로 전환됩니다.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <div className="col-span-2">
                      <label className="block text-sm font-bold text-slate-800">GPS 위치 변경</label>
                      <p className="text-xs text-slate-500 mb-3">지도 탭에서 이 좌표 기반으로 이동합니다.</p>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">위도 (Lat)</label>
                      <input
                        type="number"
                        step="0.0001"
                        value={lat}
                        onChange={(e) => setLat(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-slate-400 font-mono text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">경도 (Lng)</label>
                      <input
                        type="number"
                        step="0.0001"
                        value={lng}
                        onChange={(e) => setLng(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-slate-400 font-mono text-sm"
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-4 bg-red-50 rounded-xl border border-red-200">
                    <input
                      type="checkbox"
                      id="sos-checkbox"
                      checked={sos}
                      onChange={(e) => setSos(e.target.checked)}
                      className="w-5 h-5 accent-red-600 rounded"
                    />
                    <label htmlFor="sos-checkbox" className="text-sm font-bold text-red-800 cursor-pointer select-none">
                      비상 SOS 버튼 활성화 (SOS Active)
                    </label>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl shadow-md hover:bg-slate-800 transition-all disabled:opacity-50 active:scale-95"
                    >
                      {loading ? "전송 중..." : "센서 데이터 전송"}
                    </button>
                  </div>

                  {statusMsg && (
                    <div className="p-3 bg-slate-100 rounded-xl text-center text-xs font-semibold text-slate-700 border border-slate-200 mt-4">
                      {statusMsg}
                    </div>
                  )}
                </form>
              )}
            </div>
          ) : (
            <div className="h-full flex flex-col">
              <div className="flex items-center mb-6">
                <div className="w-1.5 h-6 bg-slate-800 rounded-sm mr-3"></div>
                <h3 className="text-xl font-bold text-slate-800">실시간 지도</h3>
                <span className="ml-4 text-sm text-slate-500">작업자들의 현재 위치가 표시됩니다.</span>
              </div>

              {workers.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col items-center">
                  <svg className="w-16 h-16 text-slate-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                  <p className="text-slate-500 font-medium text-lg">등록된 작업자가 없습니다.</p>
                  <p className="text-slate-400 mt-1 mb-6">좌측의 '작업자 관리' 메뉴에서 작업자를 먼저 추가해주세요.</p>
                  <button onClick={() => setActiveTab("management")} className="bg-emerald-600 text-white px-6 py-2 rounded-lg font-bold shadow-sm hover:bg-emerald-700 transition">
                    작업자 관리로 이동
                  </button>
                </div>
              ) : (
                <div className="flex-1 min-h-[600px]">
                  <MapComponent workers={workers} />
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

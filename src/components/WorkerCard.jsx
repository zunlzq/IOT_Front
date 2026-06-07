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

export default function WorkerCard({ worker }) {
  let borderColor = 'border-emerald-500';
  let bannerColor = 'bg-emerald-500';

  if (worker.overall_status_code === 'emergency') {
    borderColor = 'border-red-600 animate-sos-flash relative z-10';
    bannerColor = 'bg-red-600 animate-pulse';
  } else if (
    worker.overall_status_code === 'not_wearing' ||
    worker.overall_status_code === 'high_temperature'
  ) {
    borderColor = 'border-amber-500';
    bannerColor = 'bg-amber-500';
  } else if (worker.overall_status_code === 'waiting') {
    borderColor = 'border-slate-300';
    bannerColor = 'bg-slate-300';
  }

  return (
    <div className={`bg-white border-l-[6px] ${borderColor} shadow-sm rounded-r-xl border-y border-r border-slate-200 p-5 flex flex-col justify-between hover:shadow-md hover:-translate-y-1 transition-all duration-300 relative`}>
      <div className="flex items-center space-x-4 mb-5">
        <div className="relative">
          <div className={`w-14 h-14 rounded-full flex items-center justify-center font-extrabold text-xl border border-slate-200 shadow-inner select-none ${getAvatarBg(worker.id)}`}>
            {getInitials(worker.name)}
          </div>
          <div className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-white ${bannerColor}`}></div>
        </div>
        <div className="pr-6">
          <h3 className="font-semibold text-slate-800 text-lg">{worker.name}</h3>
          <p className="text-xs text-slate-500 font-mono tracking-tighter">
            {worker.gps_lat === null
              ? "위치 정보 없음"
              : `Lat ${worker.gps_lat.toFixed(4)} / Lng ${worker.gps_lng.toFixed(4)}`}
          </p>
        </div>
        {worker.sos && (
          <div className="absolute top-4 right-4 animate-bounce bg-red-100 text-red-600 px-2 py-1 rounded text-[10px] font-bold tracking-widest border border-red-200 shadow-sm">
            SOS ALERT
          </div>
        )}
      </div>

      <div className="flex space-x-8 mb-5 mt-2">
        <div className="border-l-[3px] border-slate-200 pl-3">
          <p className="text-[10px] text-slate-400 font-bold tracking-wider mb-1">PRESSURE</p>
          <p className={`text-xl font-light ${worker.pressure === null ? 'text-slate-400 text-sm font-semibold' : worker.pressure >= 500 ? 'text-slate-800' : 'text-red-600'}`}>
            {worker.pressure === null ? "대기중" : `${worker.pressure} PSI`}
          </p>
        </div>
        <div className="border-l-[3px] border-slate-200 pl-3">
          <p className="text-[10px] text-slate-400 font-bold tracking-wider mb-1">TEMP</p>
          <p className={`text-xl font-light ${worker.temperature === null ? 'text-slate-400 text-sm font-semibold' : worker.temperature >= 37.0 ? 'text-red-600' : 'text-slate-800'}`}>
            {worker.temperature === null ? "대기중" : `${worker.temperature.toFixed(1)}°C`}
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        {worker.helmet_status_code === 'waiting' ? (
          <>
            <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span className="text-xs font-mono font-medium text-slate-400">WAITING SENSOR</span>
          </>
        ) : worker.helmet_status_code === 'wearing' ? (
          <>
            <svg className="w-5 h-5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-xs font-mono font-medium text-emerald-600">Wearing PPE</span>
          </>
        ) : (
          <>
            <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span className="text-xs font-mono font-bold text-red-600 tracking-wider">NO HELMET DETECTED</span>
          </>
        )}
      </div>
    </div>
  );
}

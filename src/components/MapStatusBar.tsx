import { useEffect, useRef, useState } from "react";

function utmFromLatLng(lat: number, lng: number) {
  const zone = Math.floor((lng + 180) / 6) + 1;
  const band = "CDEFGHJKLMNPQRSTUVWX"[Math.floor((lat + 80) / 8)] ?? "L";
  const centralMeridian = (zone - 1) * 6 - 180 + 3;
  const mPerDeg = 111320;
  const easting = 500000 + (lng - centralMeridian) * mPerDeg * Math.cos((lat * Math.PI) / 180);
  const northing = lat < 0 ? 10000000 + lat * mPerDeg : lat * mPerDeg;
  return { zone, band, easting, northing };
}

function fmt(n: number, d = 2) {
  return n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
}

export function MapStatusBar({
  centerLat = -3.9089,
  centerLng = -70.5152,
  initialScale = 347130,
}: {
  centerLat?: number;
  centerLng?: number;
  initialScale?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ lat: centerLat, lng: centerLng });

  // span (degrees) approximated from scale: at lat 0, 1 deg ≈ 111,320 m.
  // Assume ~600 px visible width → span ≈ (scale * 600 / dpi_m) / 111320
  const span = (initialScale * 0.5) / 111320;

  useEffect(() => {
    const parent = ref.current?.parentElement;
    if (!parent) return;
    const onMove = (e: MouseEvent) => {
      const rect = parent.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      if (x < 0 || x > 1 || y < 0 || y > 1) return;
      setPos({
        lng: centerLng + (x - 0.5) * span,
        lat: centerLat - (y - 0.5) * span,
      });
    };
    parent.addEventListener("mousemove", onMove);
    return () => parent.removeEventListener("mousemove", onMove);
  }, [centerLat, centerLng, span]);

  const utm = utmFromLatLng(pos.lat, pos.lng);
  const cell = "px-3 py-1 border-l border-[#e5e7eb] whitespace-nowrap flex items-center gap-1";

  return (
    <div
      ref={ref}
      className="absolute bottom-0 left-1/2 -translate-x-1/2 z-[600] bg-white border border-[#e5e7eb] rounded-t-md shadow-md flex items-center text-[11px] text-[#374151] overflow-hidden"
    >
      <div className={`${cell} bg-[#1f2937] text-white font-semibold`}>DATUM WGS84</div>
      <div className={cell}>
        <span className="text-[#6b7280]">GCS Longitud:</span>
        <span className="tabular-nums">{fmt(pos.lng, 5)}</span>
      </div>
      <div className={cell}>
        <span className="text-[#6b7280]">Latitud:</span>
        <span className="tabular-nums">{fmt(pos.lat, 5)}</span>
      </div>
      <div className={cell}>
        <span className="text-[#6b7280]">UTM Zona:</span>
        <span className="tabular-nums">{utm.zone} {utm.band}</span>
      </div>
      <div className={cell}>
        <span className="text-[#6b7280]">Este:</span>
        <span className="tabular-nums">{fmt(utm.easting)}m</span>
      </div>
      <div className={cell}>
        <span className="text-[#6b7280]">Norte:</span>
        <span className="tabular-nums">{fmt(utm.northing)}m</span>
      </div>
    </div>
  );
}

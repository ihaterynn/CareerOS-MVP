"use client";

import {
  BriefcaseBusiness,
  Clock3,
  Layers3,
  MapPin,
  Navigation,
  Route,
  SlidersHorizontal,
  WalletCards
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { LatLngExpression, LayerGroup, Map as LeafletMap, Polyline } from "leaflet";
import { candidateProfile, jobListings, type CandidateJob } from "../candidate-data";
import { ModuleCard, ScoreBar, Tag } from "./candidate-ui";

type RouteInfo = {
  distanceKm: number;
  durationMin: number;
  coordinates: LatLngExpression[];
  source: "OSRM" | "Estimated";
};

export function JobSearchPanel() {
  const [selectedJobId, setSelectedJobId] = useState(jobListings[0].id);
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
  const selectedJob = jobListings.find((job) => job.id === selectedJobId) ?? jobListings[0];
  const geoScore = routeInfo ? scoreCommute(routeInfo.durationMin) : selectedJob.match.geo;
  const dynamicScore = Math.round(
    selectedJob.match.skills * 0.45 +
      geoScore * 0.25 +
      selectedJob.match.salary * 0.15 +
      selectedJob.match.preference * 0.15
  );

  return (
    <div className="grid gap-4 2xl:grid-cols-[minmax(0,1fr)_390px]">
      <section className="min-w-0 overflow-hidden rounded-[14px] border border-line bg-paper shadow-soft">
        <div className="flex flex-col gap-3 border-b border-line bg-mist px-4 py-3 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="kicker">Location-aware job search</p>
            <h2 className="mt-1 font-serif text-2xl font-semibold text-ink">Klang Valley live route map</h2>
          </div>

          <div className="flex flex-wrap gap-2 text-xs font-semibold text-muted">
            <span className="inline-flex items-center gap-2 rounded-full border border-line bg-paper px-3 py-1.5">
              <Navigation size={14} className="text-gold" aria-hidden="true" />
              {candidateProfile.location}
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-line bg-paper px-3 py-1.5">
              <SlidersHorizontal size={14} className="text-gold" aria-hidden="true" />
              Skills + route + salary + preferences
            </span>
          </div>
        </div>

        <div className="relative min-h-[calc(100vh-185px)] overflow-hidden bg-[#E8EFF7]">
          <LeafletCareerMap
            selectedJobId={selectedJob.id}
            onSelectJob={setSelectedJobId}
            onRouteInfo={setRouteInfo}
          />

          <div className="absolute left-4 top-4 z-[500] w-[min(360px,calc(100%-32px))] rounded-[14px] border border-line bg-paper/95 p-3 shadow-lifted backdrop-blur">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <p className="kicker">Recommended roles</p>
                <p className="mt-1 text-sm font-semibold text-ink">{jobListings.length} active matches</p>
              </div>
              <Tag tone="gold">OSM tiles</Tag>
            </div>

            <div className="grid max-h-[calc(100vh-300px)] gap-2 overflow-auto pr-1">
              {jobListings.map((job) => {
                const selected = job.id === selectedJob.id;

                return (
                  <button
                    key={job.id}
                    type="button"
                    onClick={() => setSelectedJobId(job.id)}
                    className={[
                      "rounded-[10px] border p-3 text-left transition",
                      selected
                        ? "border-gold bg-[#F3EAD3] shadow-sm"
                        : "border-line bg-paper/90 hover:border-gold hover:bg-mist"
                    ].join(" ")}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold leading-5 text-ink">{job.title}</p>
                        <p className="mt-1 text-xs font-semibold text-muted">{job.company}</p>
                      </div>
                      <span className="rounded-full bg-ink px-2 py-1 text-xs font-bold text-paper">
                        {selected ? dynamicScore : job.match.overall}%
                      </span>
                    </div>
                    <div className="mt-3 grid gap-2 text-xs text-muted">
                      <span className="flex items-center gap-2">
                        <MapPin size={13} className="text-gold" aria-hidden="true" />
                        {job.location}
                      </span>
                      <span className="flex items-center gap-2">
                        <Clock3 size={13} className="text-gold" aria-hidden="true" />
                        {selected && routeInfo ? `${Math.round(routeInfo.durationMin)} min route` : `${job.commuteMinutes} min estimate`}
                      </span>
                      <span className="flex items-center gap-2">
                        <WalletCards size={13} className="text-gold" aria-hidden="true" />
                        {job.salary}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="absolute bottom-4 left-4 z-[500] rounded-[10px] border border-line bg-paper/95 px-3 py-2 text-xs font-semibold text-muted shadow-soft backdrop-blur">
            Drag or zoom the map. Click a role or marker to animate the commute route.
          </div>
        </div>
      </section>

      <aside className="grid content-start gap-4 2xl:sticky 2xl:top-20">
        <ModuleCard>
          <p className="kicker">Selected match</p>
          <h3 className="mt-2 font-serif text-2xl font-semibold text-ink">{selectedJob.title}</h3>
          <p className="mt-1 text-sm font-semibold text-muted">{selectedJob.company} - {selectedJob.location}</p>

          <div className="mt-4 rounded-[12px] border border-[#E3D2A6] bg-[#F3EAD3] p-4">
            <p className="kicker">Career DNA score</p>
            <p className="mt-1 font-serif text-4xl font-semibold leading-none text-ink">
              {dynamicScore}%
            </p>
            <p className="mt-2 text-sm leading-5 text-muted">
              Recalculated with {routeInfo?.source ?? "route"} commute data.
            </p>
          </div>

          <div className="mt-4 grid gap-3">
            <ScoreBar value={selectedJob.match.skills} label="Career DNA skill fit" tone="good" />
            <ScoreBar value={geoScore} label="Live route and commute fit" tone="info" />
            <ScoreBar value={selectedJob.match.salary} label="Salary expectation fit" tone="gold" />
            <ScoreBar value={selectedJob.match.preference} label="Work preference fit" tone="warn" />
          </div>
        </ModuleCard>

        <ModuleCard>
          <div className="mb-3 flex items-center gap-2 font-semibold text-ink">
            <Route size={17} className="text-gold" aria-hidden="true" />
            Route and work context
          </div>
          <div className="grid gap-2 text-sm">
            <ContextRow label="Mode" value={selectedJob.mode} />
            <ContextRow
              label="Distance"
              value={routeInfo ? `${routeInfo.distanceKm.toFixed(1)} km` : "Calculating..."}
            />
            <ContextRow
              label="Route time"
              value={routeInfo ? `${Math.round(routeInfo.durationMin)} minutes` : "Calculating..."}
            />
            <ContextRow label="Your max" value={`${candidateProfile.commutePreferenceMinutes} minutes`} />
            <ContextRow label="Salary" value={selectedJob.salary} />
          </div>
        </ModuleCard>

        <ModuleCard>
          <div className="mb-3 flex items-center gap-2 font-semibold text-ink">
            <BriefcaseBusiness size={17} className="text-gold" aria-hidden="true" />
            Why this score
          </div>
          <ul className="grid gap-2">
            {selectedJob.explanation.map((item) => (
              <li key={item} className="rounded-[10px] border border-line bg-mist p-3 text-sm leading-5 text-muted">
                {item}
              </li>
            ))}
            {routeInfo ? (
              <li className="rounded-[10px] border border-line bg-mist p-3 text-sm leading-5 text-muted">
                Commute score uses the live route: {routeInfo.distanceKm.toFixed(1)} km, about {Math.round(routeInfo.durationMin)} minutes from home.
              </li>
            ) : null}
          </ul>
          <div className="mt-4 flex flex-wrap gap-2">
            {selectedJob.missingSkills.map((skill) => (
              <Tag key={skill} tone="warn">{skill}</Tag>
            ))}
          </div>
        </ModuleCard>
      </aside>
    </div>
  );
}

function LeafletCareerMap({
  selectedJobId,
  onSelectJob,
  onRouteInfo
}: {
  selectedJobId: string;
  onSelectJob: (jobId: string) => void;
  onRouteInfo: (routeInfo: RouteInfo | null) => void;
}) {
  const mapElementRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markerLayerRef = useRef<LayerGroup | null>(null);
  const routeRef = useRef<Polyline | null>(null);
  const routeGlowRef = useRef<Polyline | null>(null);
  const routeNodeLayerRef = useRef<LayerGroup | null>(null);
  const animationRef = useRef<number | null>(null);
  const pulseAnimationRef = useRef<number | null>(null);
  const leafletRef = useRef<typeof import("leaflet") | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const selectedJob = useMemo(
    () => jobListings.find((job) => job.id === selectedJobId) ?? jobListings[0],
    [selectedJobId]
  );

  useEffect(() => {
    let cancelled = false;

    async function initMap() {
      if (!mapElementRef.current || mapRef.current) return;

      const L = await import("leaflet");
      if (cancelled || !mapElementRef.current) return;

      leafletRef.current = L;
      const candidateLatLng: LatLngExpression = [
        candidateProfile.coordinates.lat,
        candidateProfile.coordinates.lng
      ];
      const map = L.map(mapElementRef.current, {
        center: candidateLatLng,
        zoom: 11,
        zoomControl: false
      });

      L.control.zoom({ position: "bottomright" }).addTo(map);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
        maxZoom: 19
      }).addTo(map);

      markerLayerRef.current = L.layerGroup().addTo(map);
      mapRef.current = map;
      setMapReady(true);
    }

    initMap();

    return () => {
      cancelled = true;
      if (animationRef.current) window.clearInterval(animationRef.current);
      if (pulseAnimationRef.current) window.cancelAnimationFrame(pulseAnimationRef.current);
      mapRef.current?.remove();
      mapRef.current = null;
      markerLayerRef.current = null;
      routeRef.current = null;
      routeGlowRef.current = null;
      routeNodeLayerRef.current = null;
      setMapReady(false);
    };
  }, []);

  useEffect(() => {
    const L = leafletRef.current;
    const map = mapRef.current;
    const markerLayer = markerLayerRef.current;
    if (!mapReady || !L || !map || !markerLayer) return;

    markerLayer.clearLayers();

    L.marker([candidateProfile.coordinates.lat, candidateProfile.coordinates.lng], {
      icon: L.divIcon({
        html: "<div class=\"career-map-home\">Home</div>",
        className: "",
        iconSize: [58, 32],
        iconAnchor: [29, 16]
      })
    }).addTo(markerLayer);

    jobListings.forEach((job) => {
      const selected = job.id === selectedJobId;
      const marker = L.marker([job.coordinates.lat, job.coordinates.lng], {
        icon: L.divIcon({
          html: `<div class="career-map-marker ${selected ? "is-selected" : ""}">${job.match.overall}%</div>`,
          className: "",
          iconSize: [58, 34],
          iconAnchor: [29, 17]
        })
      });

      marker.on("click", () => onSelectJob(job.id));
      marker.addTo(markerLayer);
    });
  }, [mapReady, onSelectJob, selectedJobId]);

  useEffect(() => {
    const L = leafletRef.current;
    const map = mapRef.current;
    if (!mapReady || !L || !map) return;
    const currentL = L;
    const currentMap = map;

    let cancelled = false;

    async function loadRoute() {
      onRouteInfo(null);
      if (animationRef.current) window.clearInterval(animationRef.current);
      if (pulseAnimationRef.current) window.cancelAnimationFrame(pulseAnimationRef.current);
      routeRef.current?.remove();
      routeGlowRef.current?.remove();
      routeNodeLayerRef.current?.remove();

      const route = await fetchRoute(selectedJob);
      if (cancelled) return;

      onRouteInfo(route);
      const bounds = currentL.latLngBounds(route.coordinates);
      currentMap.fitBounds(bounds, { paddingTopLeft: [390, 60], paddingBottomRight: [80, 90], maxZoom: 13 });

      const glowLine = currentL.polyline(route.coordinates, {
        color: "#F0C15C",
        weight: 14,
        opacity: 0.28,
        lineCap: "round",
        lineJoin: "round"
      }).addTo(currentMap);
      routeGlowRef.current = glowLine;

      const line = currentL.polyline([], {
        color: "#A9802F",
        weight: 7,
        opacity: 0.96,
        dashArray: "2 14",
        lineCap: "round",
        lineJoin: "round"
      }).addTo(currentMap);
      routeRef.current = line;

      const routeNodeLayer = currentL.layerGroup().addTo(currentMap);
      routeNodeLayerRef.current = routeNodeLayer;
      const routeNodes = sampleRouteNodes(route.coordinates, 18).map((coordinate, nodeIndex) =>
        currentL.circleMarker(coordinate, {
          radius: nodeIndex === 0 || nodeIndex === 17 ? 6 : 4,
          color: "#3B2A13",
          weight: 1.5,
          fillColor: nodeIndex === 17 ? "#DFA83C" : "#FFF4D8",
          fillOpacity: 0.95,
          opacity: 0.9
        }).addTo(routeNodeLayer)
      );

      const chunkSize = Math.max(1, Math.ceil(route.coordinates.length / 90));
      let index = 0;
      animationRef.current = window.setInterval(() => {
        index = Math.min(route.coordinates.length, index + chunkSize);
        line.setLatLngs(route.coordinates.slice(0, index));
        if (index >= route.coordinates.length && animationRef.current) {
          window.clearInterval(animationRef.current);
          animationRef.current = null;
        }
      }, 16);

      const pulseStartedAt = performance.now();
      const pulseRoute = (timestamp: number) => {
        if (cancelled) return;

        const progress = ((timestamp - pulseStartedAt) % 1600) / 1600;
        const pulse = 0.5 + Math.sin(progress * Math.PI * 2) * 0.5;
        line.setStyle({
          opacity: 0.72 + pulse * 0.28,
          weight: 6 + pulse * 3,
          dashOffset: `${Math.round(progress * -64)}`
        });
        glowLine.setStyle({
          opacity: 0.16 + pulse * 0.22,
          weight: 12 + pulse * 8
        });
        routeNodes.forEach((node, nodeIndex) => {
          const nodePhase = (progress + nodeIndex / Math.max(routeNodes.length, 1)) % 1;
          const nodePulse = 0.5 + Math.sin(nodePhase * Math.PI * 2) * 0.5;
          const isJobNode = nodeIndex === routeNodes.length - 1;
          node.setRadius((isJobNode ? 6 : 3.8) + nodePulse * (isJobNode ? 4.5 : 2.8));
          node.setStyle({
            fillOpacity: 0.55 + nodePulse * 0.4,
            opacity: 0.55 + nodePulse * 0.4
          });
        });

        pulseAnimationRef.current = window.requestAnimationFrame(pulseRoute);
      };

      pulseAnimationRef.current = window.requestAnimationFrame(pulseRoute);
    }

    loadRoute();

    return () => {
      cancelled = true;
      if (pulseAnimationRef.current) {
        window.cancelAnimationFrame(pulseAnimationRef.current);
        pulseAnimationRef.current = null;
      }
    };
  }, [mapReady, onRouteInfo, selectedJob]);

  return <div ref={mapElementRef} className="absolute inset-0 z-0" aria-label="OpenStreetMap job route map" />;
}

function ContextRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-[10px] border border-line bg-mist px-3 py-2">
      <span className="text-muted">{label}</span>
      <span className="text-right font-semibold text-ink">{value}</span>
    </div>
  );
}

async function fetchRoute(job: CandidateJob): Promise<RouteInfo> {
  const origin = candidateProfile.coordinates;
  const destination = job.coordinates;
  const url = `https://router.project-osrm.org/route/v1/driving/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?overview=full&geometries=geojson&alternatives=false&steps=false`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Route request failed");

    const data = await response.json() as {
      routes?: Array<{
        distance: number;
        duration: number;
        geometry: {
          coordinates: Array<[number, number]>;
        };
      }>;
    };
    const route = data.routes?.[0];
    if (!route) throw new Error("Route unavailable");

    return {
      distanceKm: route.distance / 1000,
      durationMin: route.duration / 60,
      coordinates: route.geometry.coordinates.map(([lng, lat]) => [lat, lng] as LatLngExpression),
      source: "OSRM"
    };
  } catch {
    const distanceKm = haversineKm(origin.lat, origin.lng, destination.lat, destination.lng);
    return {
      distanceKm,
      durationMin: (distanceKm / 32) * 60,
      coordinates: [
        [origin.lat, origin.lng],
        [destination.lat, destination.lng]
      ],
      source: "Estimated"
    };
  }
}

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number) {
  const radiusKm = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * radiusKm * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function sampleRouteNodes(coordinates: LatLngExpression[], nodeCount: number) {
  if (coordinates.length <= nodeCount) return coordinates;

  return Array.from({ length: nodeCount }, (_, index) => {
    const routeIndex = Math.round((index / (nodeCount - 1)) * (coordinates.length - 1));
    return coordinates[routeIndex];
  });
}

function toRad(value: number) {
  return value * Math.PI / 180;
}

function scoreCommute(durationMin: number) {
  const max = candidateProfile.commutePreferenceMinutes;
  if (durationMin <= max) return 100;
  if (durationMin <= max + 10) return 82;
  if (durationMin <= max + 25) return 62;
  return 42;
}

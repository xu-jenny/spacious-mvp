// import React, { useState, useRef, useMemo, useCallback, useEffect } from 'react';
// import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
// import 'leaflet/dist/leaflet.css';
// import L, { Icon, LatLng } from 'leaflet';
// import { LiaMapMarkerSolid } from "react-icons/lia";
// import { USGSWaterSearchResult } from '@/app/search';

// const customIcon = new L.Icon({
// 	iconUrl: "/map-marker.png",
// 	iconSize: [38, 38], // size of the icon
// 	iconAnchor: [19, 38], // point of the icon which will correspond to marker's location
//     popupAnchor: [0, -38] // point from which the popup should open relative to the iconAnchor
//   });

// export const stationIcon = new L.Icon({
//     iconUrl:  "/map-marker.png",
//     iconSize: [30, 30], // size of the icon
//     iconAnchor: [19, 38], // point of the icon which will correspond to marker's location
// 	popupAnchor: [0, -38] // point from which the popup should open relative to the iconAnchor
// 	});

// interface MarkerProps {
// 	position: {lat: number, lng: number},
// 	setLocalLocation: React.Dispatch<React.SetStateAction<{
// 		lat: number;
// 		lng: number;
// 	}>>;
// 	setLocation: React.Dispatch<React.SetStateAction<string>>;
// }
// export const DraggableMarker = ({ position, setLocalLocation, setLocation }: MarkerProps) => {
// 	const [draggable, setDraggable] = useState(true);
// 	const markerRef = useRef(null);
// 	const eventHandlers = useMemo(
// 		() => ({
// 			dragend() {
// 				const marker = markerRef.current;
// 				if (marker != null) {
// 					const newPos = marker.getLatLng()
// 					setLocalLocation(newPos);
// 					setLocation(`${newPos.lat}, ${newPos.lng}`);
// 				}
// 			},
// 		}),
// 		[]
// 	);

// 	const toggleDraggable = useCallback(() => {
// 		setDraggable((d) => !d);
// 	}, []);

// 	return (
// 		<Marker
// 			draggable={draggable}
// 			eventHandlers={eventHandlers}
// 			position={position}
// 				icon={customIcon}
// 			ref={markerRef}>
// 		</Marker>
// 	);
// };

// interface Props {
// 	location: string;
// 	data: USGSWaterSearchResult[]
// 	setLocation: React.Dispatch<React.SetStateAction<string>>;
// }

// // export const parseCoordinates = async (coordinateString: string): Promise<{lat: number, lng: number}> => {
// const parseCoordinates = (coordinateString: string): [number, number] => { //{lat: number, lng: number} => {
// 	// return Raleign if no string passed
// 	if (coordinateString == null || coordinateString.length < 3){
// 		// return {
// 		// 	lat: 35.7796,
//         //     lng: -78.6382,
// 		// };
//         return [35.7796,-78.6382]
// 	}
//     const isLatLong = (str: string) => {
//         const latLongRegex = /^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?),\s*[-+]?(180(\.0+)?|(1[0-7]\d|\d{1,2})(\.\d+)?)$/;
//         return latLongRegex.test(str);
//       };
// 	if (isLatLong(coordinateString)){
// 		const [lat, lng] = coordinateString.split(',').map(coord => parseFloat(coord.trim()));
//         // return { lat, lng };
//         return [lat, lng]
// 	}
//     // else {
//     //     const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(coordinateString)}&format=json&addressdetails=1`);
//     //     const data = await response.json();
// 	// 	if (data.length > 0) {
// 	// 		return {
// 	// 			lat: data[0].lat,
// 	// 			lng: data[0].lon
// 	// 		}
// 	// 	}
//     // }
//     return [35.7796,-78.6382]
//     // return {
//     //     lat: 35.7796,
//     //     lng: -78.6382,
//     // };
// };

// const USGSWaterMapViewer = ({location, setLocation, data}: Props) => {
// 	const [position, setPosition] = useState(parseCoordinates(location)); //{ lat: 35.7796, lng: -78.6382 });

// //   useEffect(() => {
// //     const fetchLatLng = async () => {
// //       const pos = await parseCoordinates(location);
// //       setPosition(pos);
// //     };
// //     fetchLatLng();
// //   }, [location]);

//   return (
//     <div style={{ border: '2px solid black', padding: '10px', height: '600px', width: '100%' }}>
//       <MapContainer key={position.lat + ',' + position.lng} center={position} zoom={11} style={{ height: '100%', width: '100%' }}>
//         <TileLayer
//           url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//           attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
//         />
//         <DraggableMarker position={position} setLocalLocation={setPosition} setLocation={setLocation} />
//         {data != null && data.map((d: USGSWaterSearchResult) => (
//           <Marker key={d.id} position={{ lat: d.lat, lng: d.long }} icon={stationIcon} />
//         ))}
//       </MapContainer>
//     </div>
//   );
// };

// export default USGSWaterMapViewer;

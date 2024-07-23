import React, { useEffect, useState } from 'react';
import { Map, Marker, Overlay } from "pigeon-maps";
import { USGSWaterSearchResult } from '@/app/search';
import { GoDownload } from "react-icons/go";
import { Button } from 'flowbite-react';

interface Props {
    location: string;
    data: USGSWaterSearchResult[]
}

const parseCoordinates = async (coordinateString: string): Promise<[number, number]> => { 

	// return Raleign if no string passed
	if (coordinateString == null || coordinateString.length < 3){
        return [35.7796,-78.6382]
	}
    const isLatLong = (str: string) => {
        const latLongRegex = /^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?),\s*[-+]?(180(\.0+)?|(1[0-7]\d|\d{1,2})(\.\d+)?)$/;
        return latLongRegex.test(str);
      };
	if (isLatLong(coordinateString)){
		const [lat, lng] = coordinateString.split(',').map(coord => parseFloat(coord.trim()));
        return [lat, lng]
	} 
    else {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(coordinateString)}&format=json&addressdetails=1`);
        const data = await response.json();
		if (data.length > 0) {
			return [data[0].lat, data[0].lon]
		}
    }
    return [35.7796,-78.6382]
};

const PigeonMapViewer = ({location, data}: Props) => {
	const [position, setPosition] = useState<[number, number]>([35.7796,-78.6382]);
    const [overlayItem, setOverlayItem] = useState<USGSWaterSearchResult | null>(null);

    const handleMouseClick = (item: USGSWaterSearchResult) => {
        setOverlayItem(item);
    };

    useEffect(() => {
      const fetchLatLng = async () => {
        const pos = await parseCoordinates(location);
        console.log("new position", pos)
        setPosition(pos);
      };
      fetchLatLng();
    }, [location]);
    
	return (
		<div 
			style={{
				border: "2px solid black",
				padding: "10px",
				height: "620px",
				width: "100%",
			}}>
			<Map defaultZoom={12} height={600} center={position}>
                {overlayItem &&
                    <Overlay anchor={[overlayItem.lat, overlayItem.long]} offset={[200, 100]}>
                        <div className='bg-white w-60 p-2 z-50'>
                            <div className="flex justify-between">
                                <p>{overlayItem.title}</p>
                                <Button size="sm" className="h-10 w-10" style={{background: 'none'}} onClick={() => setOverlayItem(null)}><span className="text-black">X</span></Button>
                            </div>
                            {overlayItem.csv_dl_link && <Button size="sm" href={overlayItem.csv_dl_link} outline pill className='w-fit h-fit'><GoDownload className="h-4 w-4" /></Button>}
                        </div>
                    </Overlay>
                }
                {data != null && data.map((d: USGSWaterSearchResult, i: number) => <Marker 
                    key={d.id} width={28} color={ i == 0 ? 'blue' : 'red'} anchor={[d.lat, d.long]} 
                    onClick={() => handleMouseClick(d)}
                />)}
                {data != null && <Marker 
					width={32}
					anchor={position}
                    color={'black'}
				/>}
			</Map>
		</div>
	);
};

export default PigeonMapViewer;

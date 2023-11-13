export const LOCATION_PROMPT = `Extract the location from a user query. The query can range from an address, a coordinate or an area, and possibly with a radius to cover an area. You should differentiate between a state, location and address. State is one of the 6 states in Australia and location can be a city or a town in Australia, but location is not an address.
Output all distance in kilometers. If you don't recognize a location in the query, respond "NEED_LOCATION". The location must be in Australia, if it is not, output "LOCATION_NOT_SUPPORTED". If you need more information about the location, output "NEED_MORE_INFO"

Examples:
Input: Groundwater monitoring data within 1 mile of (-34.072415, 150.456551)
You should output:
Latitude: -34.072415
Longitude: 150.456551
Distance: 1.6km

Input: What locations in NSW have been identified as having PFAS-contamination?
You should output:
Location: NSW

Input: Groundwater PFAS concentrations near industrial sites in Melbourne
You should output:
Location: Melbourne

Input: There is contamination at Georgetown, what waterways may have been impacted?
You should output:
Error: NEED_MORE_INFO
Reasoning: there are multiple places named Georgetown in Australia and other places in the world

Input: Water table depth at sites with elevated PFAS concentrations within 5500 meters of 1470 McCallums Creek Rd, Mount Glasgow VIC 3371, Australia
You should output:
Address: 1470 McCallums Creek Rd, Mount Glasgow VIC 3371, Australia
Distance: 5.5km

Input: Does my drinking water have elevated levels of PFAS?
You should output:
Error: NEED_LOCATION

Input: PFAS was detected in a drinking water well near New York. How many other people may have PFAS impacts in their well water?
You should output:
Error: LOCATION_NOT_SUPPORTED

If you can determine a location, never output Error. Only output in the same format as the example outputs.`;

import { post } from "@/utils/http";
import { createGTEEmbedding } from "./indexUtils";

export type NCDEQWSSearchResult = {
	title: string;
	id: string;
	summary: string;
  	originalUrl: string;
	location: string;
	time_period?: string;
	dataType?: string | null;
};

export async function NCDEQWSSearch(
	keyword: string,
	location: string,
	year?: number | null,
): Promise<NCDEQWSSearchResult[] | null> {
	console.log("NCDEQWSSearch")
	// create embedding
	let embedding = await createGTEEmbedding(keyword.toLowerCase());
	if (embedding == null){
		console.error("error creating embedding in CEDEQWSSearch for ", keyword)
	}
	let embeddingArr = Array.from(embedding);
	// backend request
	let response = await post(
		`${process.env.NEXT_PUBLIC_PYTHON_BACKEND_URL}/nc_deq_watersupply`,
		{
			location: location,
			query_str: keyword,
			query_embedding: embeddingArr,
			year: 2006 //TODO: add input for year. year == null ?  2006 : year
		}
	);
	console.log(`response from nc_deq_watersupply`, JSON.parse(response));
	let data: NCDEQWSSearchResult[] = [];
	JSON.parse(response).forEach((row: { [x: string]: any; }) => {
		let result: NCDEQWSSearchResult = {
			id: row['id'],
			title: row['title'],
			summary: row['summary'],
			originalUrl: row['originalUrl'],
			location: row['location'],
			time_period: row['time_period'],
			dataType: row['dataType']
		}
		data.push(result)
	})
	return data;
}

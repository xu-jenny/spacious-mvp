import { post } from "@/utils/http";

export type NCDEQWSSearchResult = {
  title: string;
  id: string;
  summary: string;
  originalUrl: string;
  location: string;
  time_period?: string[];
  dataType?: string | null;
  sample?: string;
  csv_filename?: string;
};

export async function NCDEQWSSearch(
  keyword: string,
  location: string,
  year?: number | null
): Promise<NCDEQWSSearchResult[] | null> {
  let response = await post(
    `${process.env.NEXT_PUBLIC_PYTHON_BACKEND_URL}/nc_deq_watersupply`,
    {
      query_str: keyword,
      location: location,
    }
  );
  if (response == null) {
    return null;
  }
  console.log(`response from nc_deq_watersupply`, JSON.parse(response));
  let data: NCDEQWSSearchResult[] = [];
  JSON.parse(response).forEach((row: { [x: string]: any }) => {
    let result: NCDEQWSSearchResult = {
      id: row["id"],
      title: row["title"],
      summary: row["summary"],
      originalUrl: row["originalUrl"],
      location: row["location"],
      sample: row["sample"],
      csv_filename: row["csv_filename"],
    };
    data.push(result);
  });
  return data;
}

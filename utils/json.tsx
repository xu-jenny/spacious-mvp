export function jsonParse(output: string) {
  try {
    return JSON.parse(output.replaceAll("'", '"'));
  } catch (e) {
    console.log("error running jsonParse on ", output);
    console.log(e);
    return null;
  }
}

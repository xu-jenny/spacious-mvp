export function jsonParse(output: string) {
    try {
      return JSON.parse(output.replaceAll("'", '"'));
    } catch (e) {
      console.log(e);
      return null;
    }
  }